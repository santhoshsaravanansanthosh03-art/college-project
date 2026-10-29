import React from 'react';
import { QrCode, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';
import { LoyaltyAccount } from '../../types/loyalty';
import { useLoyalty } from '../../context/LoyaltyContext';

interface DigitalLoyaltyCardProps {
  account: LoyaltyAccount;
  onOpenPass: (account: LoyaltyAccount) => void;
}

export const DigitalLoyaltyCard: React.FC<DigitalLoyaltyCardProps> = ({ account, onOpenPass }) => {
  const { syncAccount } = useLoyalty();

  return (
    <div
      onClick={() => onOpenPass(account)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 select-none flex flex-col justify-between min-h-[210px]"
      style={{
        background: `linear-gradient(135deg, ${getCategoryBackground(account.category)})`,
      }}
    >
      {/* Decorative background glow & chip */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />

      {/* Header: Program Name & Category */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">
            {account.category.replace('_', ' ')}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            {account.programName}
          </h3>
        </div>

        {/* Sync or Status Icon */}
        <div className="flex items-center gap-1.5">
          {account.isExpiringSoon && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white animate-pulse"
              title={`${account.expiringPoints?.toLocaleString()} points expiring soon`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Expiring</span>
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              syncAccount(account.id);
            }}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
            title="Sync this card"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${account.syncStatus === 'syncing' ? 'animate-spin text-brand-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Account Number & Tier */}
      <div className="my-3 relative z-10 flex items-center justify-between">
        <div className="font-mono text-sm tracking-widest text-white/80">
          {account.accountNumberMasked}
        </div>
        <div className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10">
          {account.memberTier}
        </div>
      </div>

      {/* Footer: Balance & Value */}
      <div className="pt-3 border-t border-white/10 flex items-end justify-between relative z-10">
        <div>
          <div className="text-2xl font-black text-white tracking-tight leading-none">
            {account.pointsBalance.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-white/70">
              {account.currencyName}
            </span>
          </div>
          <div className="text-xs font-medium text-emerald-300 mt-1">
            ≈ ${account.estimatedValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-white/80 bg-white/10 px-2.5 py-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
          <QrCode className="w-3.5 h-3.5" />
          <span>Pass</span>
          <ChevronRight className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

function getCategoryBackground(category: string): string {
  switch (category) {
    case 'airline':
      return '#0f172a, #1e3a8a, #0369a1';
    case 'hotel':
      return '#1c1917, #78350f, #92400e';
    case 'credit_card':
      return '#0f172a, #312e81, #1e1b4b';
    case 'dining':
      return '#022c22, #064e3b, #047857';
    case 'retail':
      return '#18181b, #831843, #500724';
    default:
      return '#0f172a, #334155, #1e293b';
  }
}
