import React, { useState } from 'react';
import { PlusCircle, Search, Wallet, QrCode } from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { DigitalLoyaltyCard } from '../components/loyalty/DigitalLoyaltyCard';
import { LoyaltyAccount } from '../types/loyalty';

interface WalletProps {
  onOpenCardPass: (account: LoyaltyAccount) => void;
}

export const WalletPage: React.FC<WalletProps> = ({ onOpenCardPass }) => {
  const { accounts, setIsLinkingModalOpen } = useLoyalty();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredAccounts = accounts.filter((acc: LoyaltyAccount) => {
    const matchesCategory = categoryFilter === 'all' || acc.category === categoryFilter;
    const matchesSearch = acc.programName.toLowerCase().includes(search.toLowerCase()) ||
                          acc.accountNumberFull.includes(search);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-brand-400" />
            <span>Digital Loyalty Wallet</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your membership cards, generate instant checkout barcodes, and monitor tier status.
          </p>
        </div>

        <button
          onClick={() => setIsLinkingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Loyalty Card</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by program name or membership number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'credit_card', 'airline', 'hotel', 'dining', 'retail'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No loyalty cards found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or link a new loyalty program to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((account: LoyaltyAccount) => (
            <DigitalLoyaltyCard
              key={account.id}
              account={account}
              onOpenPass={onOpenCardPass}
            />
          ))}
        </div>
      )}
    </div>
  );
};
