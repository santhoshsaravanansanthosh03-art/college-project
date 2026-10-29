import sys
import os
import unittest

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from starlette.testclient import TestClient
from app.main import app
from app.services.vault import vault_service
from app.db.store import db_store

class LoyaltyPlatformTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # 1. Security & Vault Tests
    def test_01_vault_encryption_decryption(self):
        secret = "secret_airline_oauth_token_12345"
        encrypted = vault_service.encrypt(secret)
        self.assertNotEqual(secret, encrypted)
        decrypted = vault_service.decrypt(encrypted)
        self.assertEqual(secret, decrypted)

    def test_02_vault_tamper_resistance(self):
        secret = "super_sensitive_token"
        encrypted = vault_service.encrypt(secret)
        # Corrupt the ciphertext
        corrupted = encrypted[:-2] + "XX"
        with self.assertRaises(Exception):
            vault_service.decrypt(corrupted)

    # 2. Database & Seeds
    def test_03_database_initialization(self):
        conn = db_store.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM accounts")
        account_count = cursor.fetchone()[0]
        self.assertGreater(account_count, 0)
        cursor.execute("SELECT COUNT(*) FROM transfer_partners")
        partner_count = cursor.fetchone()[0]
        self.assertGreater(partner_count, 0)
        conn.close()

    # 3. Healthcheck Endpoint
    def test_04_healthcheck(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "online")
        self.assertIn("vault_encryption", data)

    # 4. Accounts Endpoints
    def test_05_get_accounts(self):
        response = self.client.get("/api/accounts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        # Check security: Encrypted credentials must never be leaked
        for acc in data:
            self.assertNotIn("encrypted_credentials", acc)
            self.assertIn("pointsBalance", acc)
            self.assertIn("programName", acc)

    def test_06_link_account(self):
        payload = {
            "programId": "marriott-bonvoy",
            "accountNumber": "9940182741",
            "memberPassword": "secure_member_pin",
            "memberTier": "Gold Elite",
            "authMethod": "credentials"
        }
        response = self.client.post("/api/accounts/link", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("account_id", data)

    def test_07_sync_account(self):
        # Fetch first account
        accs = self.client.get("/api/accounts").json()
        first_id = accs[0]["id"]
        response = self.client.post(f"/api/accounts/{first_id}/sync")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("new_balance", data)

    # 5. Transfers & Ledger Endpoints
    def test_08_get_transfer_partners(self):
        response = self.client.get("/api/transfers/partners")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_09_transfer_quote(self):
        accs = self.client.get("/api/accounts").json()
        amex_acc = next((a for a in accs if 'amex' in a['programId']), accs[0])
        quote_payload = {
            "sourceAccountId": amex_acc["id"],
            "targetProgramId": "delta-skymiles",
            "pointsAmount": 5000
        }
        response = self.client.post("/api/transfers/quote", json=quote_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("targetPoints", data)
        self.assertGreater(data["targetPoints"], 0)

    def test_10_execute_transfer(self):
        accs = self.client.get("/api/accounts").json()
        amex_acc = next((a for a in accs if 'amex' in a['programId']), accs[0])
        transfer_payload = {
            "sourceAccountId": amex_acc["id"],
            "targetProgramId": "delta-skymiles",
            "pointsAmount": 1000
        }
        response = self.client.post("/api/transfers/execute", json=transfer_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("transactionId", data)

    # 6. AI Recommendations
    def test_11_get_recommendations(self):
        response = self.client.get("/api/recommendations")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    # 7. Notifications
    def test_12_get_notifications(self):
        response = self.client.get("/api/notifications")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    # 8. Background Polling Worker & Scheduler
    def test_13_scheduler_status(self):
        response = self.client.get("/api/scheduler/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("daemon_active", data)
        self.assertIn("frequency", data)

    def test_14_trigger_manual_scan(self):
        response = self.client.post("/api/scheduler/scan-now")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("accounts_scanned", data)
        self.assertIn("alerts_dispatched_count", data)

    def test_15_scheduler_alert_logs(self):
        response = self.client.get("/api/scheduler/logs")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        # Check first log format
        first_log = data[0]
        self.assertIn("channel", first_log)
        self.assertIn("recipient", first_log)

    # 9. User Profile & Security
    def test_16_user_profile_and_mfa(self):
        response = self.client.get("/api/user/profile")
        self.assertEqual(response.status_code, 200)
        user = response.json()
        initial_mfa = user.get("mfaEnabled")

        # Toggle MFA
        toggle_res = self.client.post("/api/user/toggle-mfa")
        self.assertEqual(toggle_res.status_code, 200)

        # Check toggled
        updated_user = self.client.get("/api/user/profile").json()
        self.assertEqual(updated_user.get("mfaEnabled"), not initial_mfa)

if __name__ == "__main__":
    unittest.main(verbosity=2)

