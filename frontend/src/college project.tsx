import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { WalletPage } from './pages/Wallet';
import { RewardsPage } from './pages/Rewards';
import { AccountLinkingPage } from './pages/AccountLinking';
import { NotificationsPage } from './pages/Notifications';
import { ProfilePage } from './pages/Profile';
import { LoyaltyAccount } from './types/loyalty';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { setSelectedCardModal, setIsTransferModalOpen, setActiveTransferSource } = useLoyalty();

  const handleOpenCardPass = (account: LoyaltyAccount) => {
    setSelectedCardModal(account);
  };

  const handleOpenTransfer = (account?: LoyaltyAccount) => {
    if (account) setActiveTransferSource(account);
    setIsTransferModalOpen(true);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setActiveTab}
            onOpenCardPass={handleOpenCardPass}
            onOpenTransfer={handleOpenTransfer}
          />
        );
      case 'wallet':
        return <WalletPage onOpenCardPass={handleOpenCardPass} />;
      case 'rewards':
        return <RewardsPage onOpenTransfer={() => handleOpenTransfer()} />;
      case 'linking':
        return <AccountLinkingPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <Dashboard
            onNavigate={setActiveTab}
            onOpenCardPass={handleOpenCardPass}
            onOpenTransfer={handleOpenTransfer}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveScreen()}
    </Layout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LoyaltyProvider>
        <AppContent />
      </LoyaltyProvider>
    </AuthProvider>
  );
}

export default App;

