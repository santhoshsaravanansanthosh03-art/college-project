import time
import datetime
from typing import Dict, Any, List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from ..db.store import db_store
from ..services.dispatcher import dispatcher
from ..services.connector import connector_engine

class LoyaltyBackgroundWorker:
    """
    Automated Background Polling & Expiration Monitor Daemon.
    Performs periodic portfolio audits, simulates partner balance drifts,
    and dispatches multi-channel alerts before reward points expire.
    """

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
        self.total_scans = 0

    def start(self):
        if not self.is_running:
            # Schedule periodic scan every 4 hours (interval)
            self.scheduler.add_job(
                self.run_portfolio_scan,
                trigger='interval',
                hours=4,
                id='portfolio_expiry_scanner',
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            print("[OK] LoyaltyBackgroundWorker: Daemon started (Interval: 4 hours)")

    def stop(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            print("[STOP] LoyaltyBackgroundWorker: Daemon stopped")

    async def run_portfolio_scan(self) -> Dict[str, Any]:
        """
        Executes a comprehensive scan across all linked loyalty accounts:
        1. Compares expiration dates against user-defined alert thresholds.
        2. Detects expiring points batches.
        3. Dispatches automated Email + SMS + In-App alerts.
        4. Refreshes scheduler telemetry in SQLite.
        """
        scan_start_time = time.time()
        self.total_scans += 1
        now_dt = datetime.datetime.now()
        timestamp_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")

        conn = db_store.get_connection()
        try:
            cursor = conn.cursor()
            # 1. Fetch user profile preferences
            cursor.execute("SELECT * FROM user_profile LIMIT 1")
            user_row = cursor.fetchone()
            user_profile = dict(user_row) if user_row else {
                'email': 'alex.morgan@omnipoints.io',
                'expiry_alert_threshold_days': 30
            }
            threshold_days = user_profile.get('expiry_alert_threshold_days', 30)

            # 2. Fetch all linked accounts
            cursor.execute("SELECT * FROM accounts")
            accounts = [dict(r) for r in cursor.fetchall()]

            dispatched_alerts: List[Dict[str, Any]] = []

            for acc in accounts:
                exp_date_str = acc.get('expiration_date')
                is_expiring = bool(acc.get('is_expiring_soon'))

                # Calculate days remaining if expiration date is present
                days_remaining = None
                if exp_date_str:
                    try:
                        exp_dt = datetime.datetime.strptime(exp_date_str, "%Y-%m-%d")
                        delta = (exp_dt - now_dt).days
                        days_remaining = max(1, delta)
                    except Exception:
                        days_remaining = 17  # Fallback for mock demo dates

                # Check if points are expiring within user threshold
                if is_expiring or (days_remaining is not None and days_remaining <= threshold_days):
                    days = days_remaining if days_remaining is not None else 17
                    alert_res = dispatcher.dispatch_expiry_alert(acc, user_profile, days)
                    dispatched_alerts.append(alert_res)

            # 3. Update scheduler state metrics
            duration_ms = round((time.time() - scan_start_time) * 1000, 2)
            next_run_dt = now_dt + datetime.timedelta(hours=4)

            state_updates = [
                ('last_run_timestamp', timestamp_str),
                ('total_scans_performed', str(self.total_scans)),
                ('last_accounts_scanned', str(len(accounts))),
                ('last_alerts_dispatched', str(len(dispatched_alerts))),
                ('last_duration_ms', str(duration_ms)),
                ('next_scheduled_run', next_run_dt.strftime("%Y-%m-%d %H:%M:%S")),
                ('worker_status', 'healthy_active')
            ]

            cursor.executemany('''
                INSERT OR REPLACE INTO scheduler_state (key, value)
                VALUES (?, ?)
            ''', state_updates)
            conn.commit()

            return {
                "success": True,
                "timestamp": timestamp_str,
                "accounts_scanned": len(accounts),
                "alerts_dispatched_count": len(dispatched_alerts),
                "alerts": dispatched_alerts,
                "duration_ms": duration_ms,
                "next_scheduled_run": next_run_dt.strftime("%Y-%m-%d %H:%M:%S")
            }
        finally:
            conn.close()

    def get_status(self) -> Dict[str, Any]:
        """
        Retrieves live telemetry and audit metrics for the scheduler worker.
        """
        conn = db_store.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM scheduler_state")
            state_dict = {r['key']: r['value'] for r in cursor.fetchall()}

            # Count total alerts sent
            cursor.execute("SELECT COUNT(*) FROM alert_logs")
            total_dispatches = cursor.fetchone()[0]

            return {
                "daemon_active": self.is_running,
                "total_scans_performed": int(state_dict.get('total_scans_performed', self.total_scans)),
                "last_run_timestamp": state_dict.get('last_run_timestamp', 'Never'),
                "next_scheduled_run": state_dict.get('next_scheduled_run', 'Pending'),
                "last_accounts_scanned": int(state_dict.get('last_accounts_scanned', 6)),
                "last_alerts_dispatched": int(state_dict.get('last_alerts_dispatched', 0)),
                "last_duration_ms": float(state_dict.get('last_duration_ms', 0.0)),
                "total_dispatches_in_audit_log": total_dispatches,
                "frequency": "Every 4 Hours (Daily Cron)",
            }
        finally:
            conn.close()

background_worker = LoyaltyBackgroundWorker()

