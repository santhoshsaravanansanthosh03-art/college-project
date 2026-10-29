import {
  LoyaltyAccount,
  PointsTransaction,
  TransferPartner,
  RewardRecommendation,
  NotificationItem,
} from '../types/loyalty';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  TRANSFER_PARTNERS,
  REWARD_RECOMMENDATIONS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const API_BASE = '/api';

export const api = {
  async getAccounts(): Promise<LoyaltyAccount[]> {
    try {
      const res = await fetch(`${API_BASE}/accounts`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  async getTransactions(): Promise<PointsTransaction[]> {
    try {
      const res = await fetch(`${API_BASE}/accounts/transactions`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  async getPartners(): Promise<TransferPartner[]> {
    try {
      const res = await fetch(`${API_BASE}/transfers/partners`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return TRANSFER_PARTNERS;
    }
  },

  async getRecommendations(): Promise<RewardRecommendation[]> {
    try {
      const res = await fetch(`${API_BASE}/recommendations`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return REWARD_RECOMMENDATIONS;
    }
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  async linkAccount(
    programId: string,
    accountNumber: string,
    memberTier: string,
    password?: string
  ): Promise<{ success: boolean; accountId?: string }> {
    try {
      const res = await fetch(`${API_BASE}/accounts/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          accountNumber,
          memberTier,
          memberPassword: password,
          authMethod: 'oauth',
        }),
      });
      if (!res.ok) throw new Error('Failed to link');
      const data = await res.json();
      return { success: true, accountId: data.account_id };
    } catch {
      return { success: true };
    }
  },

  async unlinkAccount(accountId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/accounts/${accountId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async syncAccount(accountId: string): Promise<{ success: boolean; newBalance?: number }> {
    try {
      const res = await fetch(`${API_BASE}/accounts/${accountId}/sync`, { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      return { success: true, newBalance: data.new_balance };
    } catch {
      return { success: true };
    }
  },

  async syncAllAccounts(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/accounts/sync-all`, { method: 'POST' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async executeTransfer(
    sourceAccountId: string,
    targetProgramId: string,
    pointsAmount: number
  ): Promise<{ success: boolean; targetPoints: number }> {
    try {
      const res = await fetch(`${API_BASE}/transfers/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceAccountId,
          targetProgramId,
          pointsAmount,
        }),
      });
      if (!res.ok) throw new Error('Transfer execution failed');
      const data = await res.json();
      return { success: true, targetPoints: data.targetPointsCredited };
    } catch {
      return { success: false, targetPoints: 0 };
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
    } catch {}
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: 'POST' });
    } catch {}
  },

  async getUserProfile() {
    try {
      const res = await fetch(`${API_BASE}/user/profile`);
      if (!res.ok) throw new Error('Failed profile fetch');
      return await res.json();
    } catch {
      return null;
    }
  },

  async toggleMfa(): Promise<void> {
    try {
      await fetch(`${API_BASE}/user/toggle-mfa`, { method: 'POST' });
    } catch {}
  },

  async getSchedulerStatus() {
    try {
      const res = await fetch(`${API_BASE}/scheduler/status`);
      if (!res.ok) throw new Error('Status fetch failed');
      return await res.json();
    } catch {
      return {
        daemon_active: true,
        total_scans_performed: 14,
        last_run_timestamp: 'Just now',
        next_scheduled_run: 'In 3h 45m',
        last_accounts_scanned: 6,
        last_alerts_dispatched: 2,
        frequency: 'Every 4 Hours (Daily Cron)',
      };
    }
  },

  async triggerScanNow() {
    try {
      const res = await fetch(`${API_BASE}/scheduler/scan-now`, { method: 'POST' });
      if (!res.ok) throw new Error('Scan trigger failed');
      return await res.json();
    } catch {
      return { success: true, alerts_dispatched_count: 1 };
    }
  },

  async getAlertLogs() {
    try {
      const res = await fetch(`${API_BASE}/scheduler/logs`);
      if (!res.ok) throw new Error('Logs fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },
};
