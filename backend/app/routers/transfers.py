from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..models.loyalty import TransferQuoteRequest, TransferQuoteResponse, TransferExecuteRequest, TransferExecuteResponse
from ..db.store import db_store
from ..services.ledger import ledger_service

router = APIRouter(prefix="/transfers", tags=["Points Transfers"])

@router.get("/partners", response_model=List[Dict[str, Any]])
def get_transfer_partners():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transfer_partners")
        rows = cursor.fetchall()
        partners = []
        for r in rows:
            p = dict(r)
            partners.append({
                "id": p['id'],
                "sourceProgramId": p['source_program_id'],
                "targetProgramId": p['target_program_id'],
                "sourceProgramName": p['source_program_name'],
                "targetProgramName": p['target_program_name'],
                "ratio": p['ratio'],
                "bonusPercentage": p['bonus_percentage'],
                "bonusExpiresAt": p['bonus_expires_at'],
                "minTransfer": p['min_transfer'],
                "transferTimeEstimate": p['transfer_time_estimate'],
            })
        return partners
    finally:
        conn.close()

@router.post("/quote", response_model=TransferQuoteResponse)
def get_transfer_quote(payload: TransferQuoteRequest):
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (payload.sourceAccountId,))
        source = cursor.fetchone()
        if not source:
            raise HTTPException(status_code=404, detail="Source account not found.")

        cursor.execute('''
            SELECT * FROM transfer_partners
            WHERE source_program_id = ? AND target_program_id = ?
        ''', (source['program_id'], payload.targetProgramId))
        partner = cursor.fetchone()
        if not partner:
            raise HTTPException(status_code=400, detail="Transfer route unavailable.")

        bonus_multiplier = 1.0 + ((partner['bonus_percentage'] or 0.0) / 100.0)
        target_points = int(round(payload.pointsAmount * partner['ratio'] * bonus_multiplier))

        return TransferQuoteResponse(
            sourceProgramName=source['program_name'],
            targetProgramName=partner['target_program_name'],
            sourcePoints=payload.pointsAmount,
            targetPoints=target_points,
            ratio=partner['ratio'],
            bonusPercentage=partner['bonus_percentage'] or 0.0,
            transferFeeUsd=0.0,
            estimatedArrival=partner['transfer_time_estimate']
        )
    finally:
        conn.close()

@router.post("/execute", response_model=TransferExecuteResponse)
def execute_transfer(payload: TransferExecuteRequest):
    success, message, data = ledger_service.execute_cross_program_transfer(
        payload.sourceAccountId,
        payload.targetProgramId,
        payload.pointsAmount
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return TransferExecuteResponse(
        success=True,
        transactionId=data.get("transaction_id", "tx_done"),
        sourcePointsDeducted=data.get("source_points_deducted", payload.pointsAmount),
        targetPointsCredited=data.get("target_points_credited", 0),
        message=message
    )
