from pydantic import BaseModel, EmailStr
from typing import Optional

class UserProfile(BaseModel):
    id: str = "usr_01"
    name: str = "Alex Morgan"
    email: str = "alex.morgan@omnipoints.io"
    avatar: str = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
    memberSince: str = "March 2024"
    preferredCurrency: str = "USD"
    mfaEnabled: bool = True
    autoSyncDaily: bool = True
    expiryAlertThresholdDays: int = 30

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferredCurrency: Optional[str] = None
    mfaEnabled: Optional[bool] = None
    autoSyncDaily: Optional[bool] = None
    expiryAlertThresholdDays: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserProfile
