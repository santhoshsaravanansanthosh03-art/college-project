from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..models.user import UserProfile, UserProfileUpdate
from ..db.store import db_store

router = APIRouter(prefix="/user", tags=["User & Profile"])

@router.get("/profile", response_model=UserProfile)
def get_user_profile():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profile LIMIT 1")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found.")
        d = dict(row)
        return UserProfile(
            id=d['id'],
            name=d['name'],
            email=d['email'],
            avatar=d['avatar'],
            memberSince=d['member_since'],
            preferredCurrency=d['preferred_currency'],
            mfaEnabled=bool(d['mfa_enabled']),
            autoSyncDaily=bool(d['auto_sync_daily']),
            expiryAlertThresholdDays=d['expiry_alert_threshold_days']
        )
    finally:
        conn.close()

@router.put("/profile", response_model=UserProfile)
def update_profile(updates: UserProfileUpdate):
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        if updates.name is not None:
            cursor.execute("UPDATE user_profile SET name = ?", (updates.name,))
        if updates.preferredCurrency is not None:
            cursor.execute("UPDATE user_profile SET preferred_currency = ?", (updates.preferredCurrency,))
        if updates.mfaEnabled is not None:
            cursor.execute("UPDATE user_profile SET mfa_enabled = ?", (1 if updates.mfaEnabled else 0,))
        if updates.autoSyncDaily is not None:
            cursor.execute("UPDATE user_profile SET auto_sync_daily = ?", (1 if updates.autoSyncDaily else 0,))
        if updates.expiryAlertThresholdDays is not None:
            cursor.execute("UPDATE user_profile SET expiry_alert_threshold_days = ?", (updates.expiryAlertThresholdDays,))
        conn.commit()
        return get_user_profile()
    finally:
        conn.close()

@router.post("/toggle-mfa")
def toggle_mfa():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE user_profile SET mfa_enabled = 1 - mfa_enabled")
        conn.commit()
        return {"success": True}
    finally:
        conn.close()
