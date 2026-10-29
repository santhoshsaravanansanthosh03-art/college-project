from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import time
import uuid

from ..models.loyalty import LoyaltyAccount, LinkAccountRequest, PointsTransaction
from ..db.store import db_store
from ..services.vault import vault_service
from ..services.connector import connector_engine

router = APIRouter(prefix="/accounts", tags=["Loyalty Accounts"])

@router.get("", response_model=List[Dict[str, Any]])
def get_accounts():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts ORDER BY points_balance DESC")
        rows = cursor.fetchall()
        accounts = []
        for r in rows:
            acc = dict(r)
            acc['isExpiringSoon'] = bool(acc['is_expiring_soon'])
            acc['pointsBalance'] = acc['points_balance']
            acc['estimatedValueUsd'] = acc['estimated_value_usd']
            acc['accountNumberMasked'] = acc['account_number_masked']
            acc['accountNumberFull'] = acc['account_number_full']
            acc['memberTier'] = acc['member_tier']
            acc['programId'] = acc['program_id']
            acc['programName'] = acc['program_name']
            acc['currencyName'] = acc['currency_name']
            acc['brandGradient'] = acc['brand_gradient']
            acc['accentColor'] = acc['accent_color']
            acc['lastSyncedAt'] = acc['last_synced_at']
            acc['syncStatus'] = acc['sync_status']
            acc['barcodeValue'] = acc['barcode_value']
            acc['expiringPoints'] = acc['expiring_points']
            acc['expirationDate'] = acc['expiration_date']
            # Never leak vault encrypted ciphertext in public response
            acc.pop('encrypted_credentials', None)
            accounts.append(acc)
        return accounts
    finally:
        conn.close()

@router.post("/link", response_model=Dict[str, Any])
def link_account(payload: LinkAccountRequest):
    # 1. Authenticate with simulated connector
    auth_result = connector_engine.authenticate_partner(
        payload.programId, payload.accountNumber, payload.authMethod
    )
    if not auth_result.get("verified"):
        raise HTTPException(status_code=400, detail="Partner authentication failed.")

    # 2. Encrypt credentials in vault
    encrypted_cred = vault_service.encrypt(payload.memberPassword or "oauth_session_token_approved")

    # 3. Create account record
    account_id = f"acc-{int(time.time())}"
    masked = f"•••• •••• {payload.accountNumber[-4:] if len(payload.accountNumber) >= 4 else '8921'}"

    # Determine gradient
    gradients = {
        'airline': 'from-sky-950 via-slate-900 to-indigo-950',
        'hotel': 'from-amber-950 via-stone-900 to-neutral-900',
        'credit_card': 'from-blue-950 via-indigo-950 to-slate-900',
        'dining': 'from-emerald-950 via-green-950 to-teal-950',
        'retail': 'from-fuchsia-950 via-pink-950 to-slate-900',
    }
    gradient = gradients.get(auth_result['category'], 'from-slate-900 to-slate-950')

    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO accounts (
                id, program_id, program_name, category, account_number_masked,
                account_number_full, member_tier, points_balance, estimated_value_usd,
                currency_name, brand_gradient, accent_color, last_synced_at, sync_status,
                barcode_value, encrypted_credentials
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            account_id,
            payload.programId,
            auth_result['program_name'],
            auth_result['category'],
            masked,
            payload.accountNumber,
            payload.memberTier or auth_result['member_tier'],
            auth_result['initial_balance'],
            auth_result['estimated_value_usd'],
            auth_result['currency_name'],
            gradient,
            '#38BDF8',
            'Just now',
            'active',
            f"{payload.programId.upper()[:3]}-{payload.accountNumber[-6:]}",
            encrypted_cred
        ))

        # Add initial ledger audit transaction
        tx_id = f"tx-{uuid.uuid4().hex[:8]}"
        cursor.execute('''
            INSERT INTO transactions (id, account_id, program_name, type, points, description, date, value_usd)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tx_id, account_id, auth_result['program_name'], 'earned',
            auth_result['initial_balance'], 'Initial Balance Synchronized',
            time.strftime("%b %d, %Y"), auth_result['estimated_value_usd']
        ))

        # Add notification
        cursor.execute('''
            INSERT INTO notifications (id, title, message, type, timestamp, read, urgency)
            VALUES (?, ?, ?, ?, ?, 0, ?)
        ''', (
            f"notif-{uuid.uuid4().hex[:8]}",
            f"{auth_result['program_name']} Linked",
            f"Successfully connected with {auth_result['initial_balance']:,} {auth_result['currency_name']} ($ {auth_result['estimated_value_usd']:.2f} value).",
            "sync",
            "Just now",
            "low"
        ))

        conn.commit()
        return {"success": True, "account_id": account_id, "balance": auth_result['initial_balance']}
    finally:
        conn.close()

@router.delete("/{account_id}")
def unlink_account(account_id: str):
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        cursor.execute("DELETE FROM transactions WHERE account_id = ?", (account_id,))
        conn.commit()
        return {"success": True, "message": "Account unlinked."}
    finally:
        conn.close()

@router.post("/{account_id}/sync")
def sync_account(account_id: str):
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Account not found.")

        added_points = connector_engine.fetch_live_balance(row['program_id'], row['account_number_full'])
        new_balance = row['points_balance'] + added_points
        new_usd = row['estimated_value_usd'] + (added_points * 0.015)

        cursor.execute('''
            UPDATE accounts
            SET points_balance = ?, estimated_value_usd = ?, last_synced_at = 'Just now', sync_status = 'active'
            WHERE id = ?
        ''', (new_balance, new_usd, account_id))
        conn.commit()

        return {"success": True, "new_balance": new_balance, "points_added": added_points}
    finally:
        conn.close()

@router.post("/sync-all")
def sync_all_accounts():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE accounts SET last_synced_at = 'Just now', sync_status = 'active'")
        conn.commit()
        return {"success": True, "message": "All accounts synchronized."}
    finally:
        conn.close()

@router.get("/transactions", response_model=List[Dict[str, Any]])
def get_transactions():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transactions ORDER BY rowid DESC LIMIT 20")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
