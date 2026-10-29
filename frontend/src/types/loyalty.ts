export type LoyaltyCategory = 'airline' | 'hotel' | 'retail' | 'credit_card' | 'dining';

export interface LoyaltyProgram {
  id: string;
  name: string;
  category: LoyaltyCategory;
  primaryColor: string;
  accentColor: string;
  logo: string;
  currencyName: string; // e.g. "Miles", "Points", "Stars"
  averageValuationCent: number; // e.g. 1.4 cents per point
  supportsOAuth: boolean;
  popular: boolean;
}

export interface LoyaltyAccount {
  id: string;
  programId: string;
  programName: string;
  category: LoyaltyCategory;
  accountNumberMasked: string; // e.g. "•••• •••• 9104"
  accountNumberFull: string;
  memberTier: string;
  pointsBalance: number;
  estimatedValueUsd: number;
  currencyName: string;
  brandGradient: string;
  accentColor: string;
  tierProgress?: {
    currentTier: string;
    nextTier: string;
    pointsEarned: number;
    pointsNeeded: number;
  };
  expirationDate?: string; // ISO date
  isExpiringSoon?: boolean;
  expiringPoints?: number;
  lastSyncedAt: string;
  syncStatus: 'active' | 'syncing' | 'action_required' | 'error';
  barcodeValue: string;
}

export interface PointsTransaction {
  id: string;
  accountId: string;
  programName: string;
  type: 'earned' | 'redeemed' | 'transferred' | 'expired';
  points: number;
  description: string;
  date: string;
  valueUsd?: number;
}

export interface TransferPartner {
  id: string;
  sourceProgramId: string;
  targetProgramId: string;
  sourceProgramName: string;
  targetProgramName: string;
  ratio: number; // e.g., 1.0 (1:1) or 0.8
  bonusPercentage?: number; // e.g. 25% promo
  bonusExpiresAt?: string;
  minTransfer: number;
  transferTimeEstimate: string;
}

export interface RewardRecommendation {
  id: string;
  title: string;
  partner: string;
  category: 'travel' | 'hotel' | 'shopping' | 'dining';
  requiredPoints: number;
  cashEquivalentUsd: number;
  valuePerPointCent: number;
  description: string;
  badge?: string;
  sourceProgramName: string;
  expirationDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'expiry' | 'bonus' | 'sync' | 'security';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  urgency: 'high' | 'medium' | 'low';
}

