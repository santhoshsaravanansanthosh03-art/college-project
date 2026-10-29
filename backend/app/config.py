import os
import base64

class Settings:
    PROJECT_NAME: str = "OmniPoints Backend API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    # 32-byte secret key for AES-256 GCM envelope encryption
    # In production, this is sourced from AWS KMS / HashiCorp Vault / Azure Key Vault
    VAULT_MASTER_KEY: bytes = os.getenv("VAULT_MASTER_KEY", "omnipoints-master-encryption-key-32b!").encode("utf-8")[:32].ljust(32, b"0")
    DB_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "omnipoints.db")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

settings = Settings()
