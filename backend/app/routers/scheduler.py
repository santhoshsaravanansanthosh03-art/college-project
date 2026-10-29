from fastapi import APIRouter
from typing import Dict, Any, List
from ..services.worker import background_worker
from ..db.store import db_store

router = APIRouter(prefix="/scheduler", tags=["Background Worker & Alerting Daemon"])

@router.get("/status", response_model=Dict[str, Any])
def get_scheduler_status():
    """
    Returns telemetry for the background polling daemon, next scheduled run,
    and alert dispatch counts.
    """
    return background_worker.get_status()

@router.post("/scan-now", response_model=Dict[str, Any])
async def trigger_manual_scan():
    """
    Manually triggers an immediate portfolio scan across all linked loyalty accounts
    to evaluate expiring points and dispatch Email/SMS notifications.
    """
    result = await background_worker.run_portfolio_scan()
    return result

@router.get("/logs", response_model=List[Dict[str, Any]])
def get_alert_logs():
    """
    Returns the audit trail of dispatched email, SMS, and in-app alerts.
    """
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alert_logs ORDER BY rowid DESC LIMIT 50")
        rows = cursor.fetchall()
        logs = []
        for r in rows:
            d = dict(r)
            logs.append({
                "id": d['id'],
                "accountId": d['account_id'],
                "programName": d['program_name'],
                "alertType": d['alert_type'],
                "channel": d['channel'],
                "recipient": d['recipient'],
                "subject": d['subject'],
                "message": d['message'],
                "dispatchedAt": d['dispatched_at'],
                "status": d['status']
            })
        return logs
    finally:
        conn.close()

