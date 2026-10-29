from typing import Optional, List, Literal
from pydantic import BaseModel, Field

LoyaltyCategory = Literal['airline', 'hotel', 'retail', 'credit_card', 'dining']

class LoyaltyProgram(BaseModel):
    id: str
    name: str
    category: LoyaltyCategory
    primaryColor: str
    accentColor: str
    logo: str
    currencyName: str
    averageValuationCent: float
    supportsOAuth: bool
    popular: bool = True

class TierProgress(BaseModel):
    currentTier: str
    nextTier: str
    pointsEarned: int
    pointsNeeded: int

class LoyaltyAccount(BaseModel):
    id: str
    programId: str
    programName: str
    category: LoyaltyCategory
    accountNumberMasked: str
    accountNumberFull: str
    memberTier: str
    pointsBalance: int
    estimatedValueUsd: float
    currencyName: str
    brandGradient: str
    accentColor: str
    tierProgress: Optional[TierProgress] = None
    expirationDate: Optional[str] = None
    isExpiringSoon: bool = False
    expiringPoints: Optional[int] = None
    lastSyncedAt: str
    syncStatus: Literal['active', 'syncing', 'action_required', 'error'] = 'active'
    barcodeValue: str

class LinkAccountRequest(BaseModel):
    programId: str
    accountNumber: str
    memberPassword: Optional[str] = None
    memberTier: Optional[str] = "Standard Member"
    authMethod: Literal['oauth', 'credentials'] = 'oauth'

class PointsTransaction(BaseModel):
    id: str
    accountId: str
    programName: str
    type: Literal['earned', 'redeemed', 'transferred', 'expired']
    points: int
    description: str
    date: str
    valueUsd: Optional[float] = None

class TransferQuoteRequest(BaseModel):
    sourceAccountId: str
    targetProgramId: str
    pointsAmount: int

class TransferQuoteResponse(BaseModel):
    sourceProgramName: str
    targetProgramName: str
    sourcePoints: int
    targetPoints: int
    ratio: float
    bonusPercentage: float = 0.0
    transferFeeUsd: float = 0.0
    estimatedArrival: str

class TransferExecuteRequest(BaseModel):
    sourceAccountId: str
    targetProgramId: str
    pointsAmount: int

class TransferExecuteResponse(BaseModel):
    success: bool
    transactionId: str
    sourcePointsDeducted: int
    targetPointsCredited: int
    message: str

class RewardRecommendation(BaseModel):
    id: str
    title: str
    partner: str
    category: Literal['travel', 'hotel', 'shopping', 'dining']
    requiredPoints: int
    cashEquivalentUsd: float
    valuePerPointCent: float
    description: str
    badge: Optional[str] = None
    sourceProgramName: str
    expirationDate: Optional[str] = None

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: Literal['expiry', 'bonus', 'sync', 'security']
    timestamp: str
    read: bool = False
    urgency: Literal['high', 'medium', 'low'] = 'low'
