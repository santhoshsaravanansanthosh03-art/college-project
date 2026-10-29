import React, { useState } from 'react';
import { PlusCircle, Search, ShieldCheck } from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { LoyaltyProgram } from '../types/loyalty';

export const AccountLinkingPage: React.FC = () => {
  const { availablePrograms, accounts, setIsLinkingModalOpen } = useLoyalty();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const linkedProgramIds = new Set(accounts.map((a: { programId: string }) => a.programId));

  const filteredPrograms = availablePrograms.filter((prog: LoyaltyProgram) => {
    const matchesSearch = prog.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <PlusCircle className="w-7 h-7 text-brand-400" />
            <span>Loyalty Account Linking Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect your loyalty accounts to enable universal point aggregation, auto-sync, and smart transfers.
          </p>
        </div>

        <button
          onClick={() => setIsLinkingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Connect New Program</span>
        </button>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="text-xs text-slate-300">
          <strong className="text-white">Bank-Grade 256-bit AES Encryption:</strong> All accounts are connected via official OAuth 2.0 or isolated zero-trust API credential vaults. Your passwords are never stored in plaintext.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search airlines, hotel chains, retail clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'airline', 'hotel', 'credit_card', 'dining', 'retail'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((prog: LoyaltyProgram) => {
          const isLinked = linkedProgramIds.has(prog.id);
          return (
            <div
              key={prog.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isLinked
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {prog.logo}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{prog.name}</h3>
                    <span className="text-xs text-slate-400 capitalize">
                      {prog.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {isLinked ? (
                  <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Linked
                  </span>
                ) : (
                  <button
                    onClick={() => setIsLinkingModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Avg: {prog.averageValuationCent}¢ per {prog.currencyName.toLowerCase()}</span>
                <span>{prog.supportsOAuth ? 'OAuth 2.0' : 'PIN / ID'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
