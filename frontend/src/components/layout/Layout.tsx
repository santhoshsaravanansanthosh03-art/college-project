import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLoyalty } from '../../context/LoyaltyContext';
import { CardPassModal } from '../loyalty/CardPassModal';
import { AccountLinkModal } from '../loyalty/AccountLinkModal';
import { TransferModal } from '../loyalty/TransferModal';
import { LoyaltyAccount } from '../../types/loyalty';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    selectedCardModal,
    setSelectedCardModal,
    isLinkingModalOpen,
    setIsLinkingModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    activeTransferSource,
    setActiveTransferSource,
  } = useLoyalty();

  const handleOpenTransfer = (account?: LoyaltyAccount) => {
    setActiveTransferSource(account || null);
    setIsTransferModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CardPassModal
        account={selectedCardModal}
        onClose={() => setSelectedCardModal(null)}
        onOpenTransfer={handleOpenTransfer}
      />

      <AccountLinkModal
        isOpen={isLinkingModalOpen}
        onClose={() => setIsLinkingModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialSourceAccount={activeTransferSource}
      />
    </div>
  );
};

