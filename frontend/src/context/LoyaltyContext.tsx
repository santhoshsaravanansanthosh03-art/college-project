import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LoyaltyAccount,
  PointsTransaction,
  TransferPartner,
  RewardRecommendation,
  NotificationItem,
  LoyaltyProgram,
} from '../types/loyalty';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  TRANSFER_PARTNERS,
  REWARD_RECOMMENDATIONS,
  INITIAL_NOTIFICATIONS,
  POPULAR_PROGRAMS,
} from '../services/mockData';
import { api } from '../services/api';

interface LoyaltyContextType {
  accounts: LoyaltyAccount[];
  transactions: PointsTransaction[];
  partners: TransferPartner[];
  recommendations: RewardRecommendation[];
  notifications: NotificationItem[];
  availablePrograms: LoyaltyProgram[];
  selectedCardModal: LoyaltyAccount | null;
  setSelectedCardModal: (account: LoyaltyAccount | null) => void;
  isLinkingModalOpen: boolean;
  setIsLinkingModalOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  activeTransferSource: LoyaltyAccount | null;
  setActiveTransferSource: (account: LoyaltyAccount | null) => void;
  linkAccount: (programId: string, accountNumber: string, memberTier: string) => Promise<boolean>;
  unlinkAccount: (accountId: string) => void;
  syncAccount: (accountId: string) => Promise<void>;
  syncAllAccounts: () => Promise<void>;
  executeTransfer: (sourceAccountId: string, targetProgramId: string, pointsAmount: number) => Promise<{ success: boolean; targetPoints: number }>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  totalPoints: number;
  totalValueUsd: number;
  expiringAccounts: LoyaltyAccount[];
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<PointsTransaction[]>(INITIAL_TRANSACTIONS);
  const [partners, setPartners] = useState<TransferPartner[]>(TRANSFER_PARTNERS);
  const [recommendations, setRecommendations] = useState<RewardRecommendation[]>(REWARD_RECOMMENDATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [availablePrograms] = useState<LoyaltyProgram[]>(POPULAR_PROGRAMS);
  const [selectedCardModal, setSelectedCardModal] = useState<LoyaltyAccount | null>(null);
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [activeTransferSource, setActiveTransferSource] = useState<LoyaltyAccount | null>(null);

  // Initial load from real backend API
  useEffect(() => {
    async function loadData() {
      const [accs, txs, pts, recs, notifs] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getPartners(),
        api.getRecommendations(),
        api.getNotifications(),
      ]);
      if (accs.length) setAccounts(accs);
      if (txs.length) setTransactions(txs);
      if (pts.length) setPartners(pts);
      if (recs.length) setRecommendations(recs);
      if (notifs.length) setNotifications(notifs);
    }
    loadData();
  }, []);

  const totalPoints = accounts.reduce((acc, curr) => acc + curr.pointsBalance, 0);
  const totalValueUsd = accounts.reduce((acc, curr) => acc + curr.estimatedValueUsd, 0);
  const expiringAccounts = accounts.filter(acc => acc.isExpiringSoon);

  const linkAccount = async (programId: string, accountNumber: string, memberTier: string): Promise<boolean> => {
    const program = availablePrograms.find(p => p.id === programId);
    if (!program) return false;

    // Call backend API
    await api.linkAccount(programId, accountNumber, memberTier);

    // Refresh accounts from API
    const refreshed = await api.getAccounts();
    setAccounts(refreshed);
    const refreshedTxs = await api.getTransactions();
    setTransactions(refreshedTxs);
    const refreshedNotifs = await api.getNotifications();
    setNotifications(refreshedNotifs);

    return true;
  };

  const unlinkAccount = async (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    if (selectedCardModal?.id === accountId) setSelectedCardModal(null);
    await api.unlinkAccount(accountId);
  };

  const syncAccount = async (accountId: string) => {
    setAccounts(prev =>
      prev.map(a => (a.id === accountId ? { ...a, syncStatus: 'syncing' } : a))
    );

    const res = await api.syncAccount(accountId);

    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? {
              ...a,
              syncStatus: 'active',
              lastSyncedAt: 'Just now',
              pointsBalance: res.newBalance || a.pointsBalance + 150,
            }
          : a
      )
    );
  };

  const syncAllAccounts = async () => {
    setAccounts(prev => prev.map(a => ({ ...a, syncStatus: 'syncing' })));
    await api.syncAllAccounts();
    const refreshed = await api.getAccounts();
    setAccounts(refreshed);
  };

  const executeTransfer = async (
    sourceAccountId: string,
    targetProgramId: string,
    pointsAmount: number
  ): Promise<{ success: boolean; targetPoints: number }> => {
    const result = await api.executeTransfer(sourceAccountId, targetProgramId, pointsAmount);

    if (result.success) {
      // Reload updated balances, transactions, and alerts from backend ledger
      const [accs, txs, notifs] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getNotifications(),
      ]);
      setAccounts(accs);
      setTransactions(txs);
      setNotifications(notifs);
    }

    return result;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    api.markNotificationRead(id);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.markAllNotificationsRead();
  };

  return (
    <LoyaltyContext.Provider
      value={{
        accounts,
        transactions,
        partners,
        recommendations,
        notifications,
        availablePrograms,
        selectedCardModal,
        setSelectedCardModal,
        isLinkingModalOpen,
        setIsLinkingModalOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        activeTransferSource,
        setActiveTransferSource,
        linkAccount,
        unlinkAccount,
        syncAccount,
        syncAllAccounts,
        executeTransfer,
        markNotificationRead,
        markAllNotificationsRead,
        totalPoints,
        totalValueUsd,
        expiringAccounts,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) throw new Error('useLoyalty must be used within a LoyaltyProvider');
  return context;
};
