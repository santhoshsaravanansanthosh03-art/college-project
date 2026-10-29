import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from ..config import settings
from ..services.vault import vault_service

class DatabaseStore:
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = db_path
        self._init_tables()
        self._seed_initial_data()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Accounts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    program_id TEXT NOT NULL,
                    program_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    account_number_masked TEXT NOT NULL,
                    account_number_full TEXT NOT NULL,
                    member_tier TEXT NOT NULL,
                    points_balance INTEGER NOT NULL,
                    estimated_value_usd REAL NOT NULL,
                    currency_name TEXT NOT NULL,
                    brand_gradient TEXT NOT NULL,
                    accent_color TEXT NOT NULL,
                    expiration_date TEXT,
                    is_expiring_soon INTEGER DEFAULT 0,
                    expiring_points INTEGER,
                    last_synced_at TEXT NOT NULL,
                    sync_status TEXT DEFAULT 'active',
                    barcode_value TEXT NOT NULL,
                    encrypted_credentials TEXT
                )
            ''')

            # Transactions ledger table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    account_id TEXT NOT NULL,
                    program_name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    points INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    value_usd REAL
                )
            ''')

            # Transfer partners configuration
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transfer_partners (
                    id TEXT PRIMARY KEY,
                    source_program_id TEXT NOT NULL,
                    target_program_id TEXT NOT NULL,
                    source_program_name TEXT NOT NULL,
                    target_program_name TEXT NOT NULL,
                    ratio REAL NOT NULL,
                    bonus_percentage REAL DEFAULT 0,
                    bonus_expires_at TEXT,
                    min_transfer INTEGER NOT NULL,
                    transfer_time_estimate TEXT NOT NULL
                )
            ''')

            # Notifications table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    read INTEGER DEFAULT 0,
                    urgency TEXT DEFAULT 'low'
                )
            ''')

            # User profile table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_profile (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    avatar TEXT NOT NULL,
                    member_since TEXT NOT NULL,
                    preferred_currency TEXT DEFAULT 'USD',
                    mfa_enabled INTEGER DEFAULT 1,
                    auto_sync_daily INTEGER DEFAULT 1,
                    expiry_alert_threshold_days INTEGER DEFAULT 30
                )
            ''')

            # Alert dispatch audit logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alert_logs (
                    id TEXT PRIMARY KEY,
                    account_id TEXT NOT NULL,
                    program_name TEXT NOT NULL,
                    alert_type TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    recipient TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    dispatched_at TEXT NOT NULL,
                    status TEXT DEFAULT 'delivered'
                )
            ''')

            # Scheduler metrics state table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scheduler_state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            ''')
            conn.commit()

    def _seed_initial_data(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Check if user profile exists
            cursor.execute("SELECT COUNT(*) FROM user_profile")
            if cursor.fetchone()[0] == 0:
                cursor.execute('''
                    INSERT INTO user_profile (id, name, email, avatar, member_since, preferred_currency, mfa_enabled, auto_sync_daily, expiry_alert_threshold_days)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    'usr_01',
                    'Alex Morgan',
                    'alex.morgan@omnipoints.io',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
                    'March 2024',
                    'USD',
                    1,
                    1,
                    30
                ))

            # Seed accounts if empty
            cursor.execute("SELECT COUNT(*) FROM accounts")
            if cursor.fetchone()[0] == 0:
                accounts_seed = [
                    (
                        'acc-1', 'amex-membership-rewards', 'American Express MR', 'credit_card',
                        '•••• •••• •••• 3019', '3782 822401 3019', 'Platinum Cardholder',
                        125400, 2508.00, 'Points', 'from-blue-900 via-indigo-950 to-slate-900',
                        '#38BDF8', None, 0, None, '12 mins ago', 'active', 'AMX-37828224013019',
                        vault_service.encrypt("simulated_amex_oauth_refresh_token_xyz981")
                    ),
                    (
                        'acc-2', 'delta-skymiles', 'Delta SkyMiles', 'airline',
                        '•••• •••• 8842', '2398418842', 'Platinum Medallion',
                        142500, 1710.00, 'Miles', 'from-sky-950 via-slate-900 to-rose-950',
                        '#F43F5E', None, 0, None, '1 hour ago', 'active', 'DL-2398418842-PLAT',
                        vault_service.encrypt("delta_skymiles_oauth_token_v49")
                    ),
                    (
                        'acc-3', 'marriott-bonvoy', 'Marriott Bonvoy', 'hotel',
                        '•••• •••• 4120', '9841024120', 'Titanium Elite',
                        184200, 1473.60, 'Points', 'from-amber-950 via-neutral-900 to-stone-900',
                        '#F59E0B', None, 0, None, '3 hours ago', 'active', 'MB-9841024120-TITAN',
                        vault_service.encrypt("bonvoy_encrypted_member_session_01")
                    ),
                    (
                        'acc-4', 'starbucks-rewards', 'Starbucks Rewards', 'dining',
                        '•••• 7729', '601839217729', 'Gold Member',
                        1850, 83.25, 'Stars', 'from-emerald-950 via-green-950 to-teal-950',
                        '#10B981', '2026-11-15', 1, 450, '30 mins ago', 'active', 'SB-601839217729',
                        vault_service.encrypt("starbucks_pin_and_card_secure")
                    ),
                    (
                        'acc-5', 'sephora-beauty-insider', 'Sephora Beauty Insider', 'retail',
                        '•••• •••• 1923', '8839201923', 'Rouge Member',
                        2400, 60.00, 'Points', 'from-fuchsia-950 via-pink-950 to-black',
                        '#EC4899', None, 0, None, 'Yesterday', 'active', 'SEP-8839201923-ROUGE',
                        vault_service.encrypt("sephora_rouge_auth_payload")
                    ),
                    (
                        'acc-6', 'united-mileageplus', 'United MileagePlus', 'airline',
                        '•••• •••• 6501', 'AA48396501', 'Premier Gold',
                        41350, 516.88, 'Miles', 'from-blue-950 via-slate-900 to-indigo-950',
                        '#60A5FA', None, 0, None, '2 days ago', 'action_required', 'UA-AA48396501-GOLD',
                        vault_service.encrypt("united_session_auth_token_refresh")
                    )
                ]
                cursor.executemany('''
                    INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', accounts_seed)

            # Seed transactions if empty
            cursor.execute("SELECT COUNT(*) FROM transactions")
            if cursor.fetchone()[0] == 0:
                tx_seed = [
                    ('tx-1', 'acc-1', 'American Express MR', 'earned', 15400, 'Travel Booking 5x Bonus Points', 'Oct 27, 2026', 308.00),
                    ('tx-2', 'acc-2', 'Delta SkyMiles', 'earned', 4200, 'Flight JFK -> LHR Medallion Bonus', 'Oct 24, 2026', 50.40),
                    ('tx-3', 'acc-4', 'Starbucks Rewards', 'redeemed', -200, 'Redeemed for Artisan Lunch Sandwich', 'Oct 22, 2026', -9.00),
                    ('tx-4', 'acc-3', 'Marriott Bonvoy', 'earned', 12500, '3 Nights Stay at St. Regis New York', 'Oct 19, 2026', 100.00),
                    ('tx-5', 'acc-1', 'American Express MR', 'transferred', -25000, 'Transferred to Delta SkyMiles (+20% Promo)', 'Oct 15, 2026', -500.00),
                ]
                cursor.executemany('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)', tx_seed)

            # Seed transfer partners if empty
            cursor.execute("SELECT COUNT(*) FROM transfer_partners")
            if cursor.fetchone()[0] == 0:
                partners_seed = [
                    ('tp-1', 'amex-membership-rewards', 'delta-skymiles', 'American Express MR', 'Delta SkyMiles', 1.0, 25.0, '2026-11-30', 1000, 'Instant'),
                    ('tp-2', 'amex-membership-rewards', 'marriott-bonvoy', 'American Express MR', 'Marriott Bonvoy', 1.2, 0.0, None, 1000, 'Within 2 hours'),
                    ('tp-3', 'chase-ultimate-rewards', 'hyatt-world-of-hyatt', 'Chase Ultimate Rewards', 'World of Hyatt', 1.0, 0.0, None, 1000, 'Instant'),
                    ('tp-4', 'chase-ultimate-rewards', 'united-mileageplus', 'Chase Ultimate Rewards', 'United MileagePlus', 1.0, 15.0, '2026-12-15', 1000, 'Instant')
                ]
                cursor.executemany('INSERT INTO transfer_partners VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', partners_seed)

            # Seed notifications if empty
            cursor.execute("SELECT COUNT(*) FROM notifications")
            if cursor.fetchone()[0] == 0:
                notif_seed = [
                    ('notif-1', 'Urgent: 450 Starbucks Stars Expiring Soon', 'Your 450 Stars are set to expire on Nov 15, 2026. Redeem or purchase an item to reset activity.', 'expiry', '2 hours ago', 0, 'high'),
                    ('notif-2', '25% Transfer Bonus: Amex -> Delta SkyMiles', 'Limited time promotional bonus activated. Every 1,000 Amex MR converts to 1,250 Delta SkyMiles.', 'bonus', '1 day ago', 0, 'medium'),
                    ('notif-3', 'United MileagePlus Session Expired', 'United Airlines requires two-factor confirmation. Click to re-authenticate and restore automatic point sync.', 'sync', '2 days ago', 0, 'high'),
                    ('notif-4', 'Security Alert: New Device Login', 'Successful web login from San Francisco, CA (Chrome on Windows).', 'security', '3 days ago', 1, 'low')
                ]
                cursor.executemany('INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)', notif_seed)

            conn.commit()

db_store = DatabaseStore()
