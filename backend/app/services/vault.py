import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from ..config import settings

class VaultService:
    """
    AES-256-GCM Hardware-Compliant Vault Service.
    Secures third-party loyalty credentials and OAuth refresh tokens.
    """
    def __init__(self, key: bytes = settings.VAULT_MASTER_KEY):
        self.key = key
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypts sensitive member credentials using AES-256-GCM with a fresh 96-bit nonce.
        Returns base64 formatted: nonce (12 bytes) + ciphertext + authentication tag (16 bytes).
        """
        if not plaintext:
            return ""
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        combined = nonce + ciphertext
        return base64.b64encode(combined).decode('utf-8')

    def decrypt(self, encrypted_payload: str) -> str:
        """
        Decrypts and authenticates ciphertext using the master vault key.
        Raises ValueError if tampering or key mismatch occurs.
        """
        if not encrypted_payload:
            return ""
        try:
            raw = base64.b64decode(encrypted_payload.encode('utf-8'))
            nonce = raw[:12]
            ciphertext = raw[12:]
            decrypted_bytes = self.aesgcm.decrypt(nonce, ciphertext, None)
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Vault decryption failure: {str(e)}")

vault_service = VaultService()
