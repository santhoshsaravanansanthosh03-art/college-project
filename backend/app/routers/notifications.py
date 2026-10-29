from fastapi import APIRouter
from typing import List, Dict, Any
from ..db.store import db_store

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[Dict[str, Any]])
def get_notifications():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM notifications ORDER BY rowid DESC")
        rows = cursor.fetchall()
        notifications = []
        for r in rows:
            item = dict(r)
            item['read'] = bool(item['read'])
            notifications.append(item)
        return notifications
    finally:
        conn.close()

@router.post("/{notification_id}/read")
def mark_read(notification_id: str):
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notification_id,))
        conn.commit()
        return {"success": True}
    finally:
        conn.close()

@router.post("/read-all")
def mark_all_read():
    conn = db_store.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET read = 1")
        conn.commit()
        return {"success": True}
    finally:
        conn.close()
