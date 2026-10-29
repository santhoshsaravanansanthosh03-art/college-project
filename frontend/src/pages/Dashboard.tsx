import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  PlusCircle,
  Sparkles,
  Plane,
  Building2,
  CreditCard,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { useAuth } from '../context/AuthContext';
import { DigitalLoyaltyCard } from '../components/loyalty/DigitalLoyaltyCard';
import { LoyaltyAccount, PointsTransaction } from '../types/loyalty';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenCardPass: (account: LoyaltyAccount) => void;
  onOpenTransfer: (account?: LoyaltyAccount) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenCardPass,
  onOpenTransfer,
}) => {
  const { totalPoints, totalValueUsd, accounts, transactions, expiringAccounts, setIsLinkingModalOpen } = useLoyalty();
  const { user } = useAuth();

  // Calculate points breakdown by category
  const categoryTotals = accounts.reduce((acc: Record<string, number>, curr: LoyaltyAccount) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.pointsBalance;
    return acc;
  }, {} as Record<string, number>);

  const airlinePoints = categoryTotals['airline'] || 0;
  const hotelPoints = categoryTotals['hotel'] || 0;
  const cardPoints = categoryTotals['credit_card'] || 0;
  const retailDiningPoints = (categoryTotals['dining'] || 0) + (categoryTotals['retail'] || 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your aggregated loyalty portfolio is up to date across {accounts.length} active programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTransfer()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-400" />
            <span>Transfer Points</span>
          </button>
          <button
            onClick={() => setIsLinkingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Link Program</span>
          </button>
        </div>
      </div>

      {/* Urgent Expiry Alert Banner */}
      {expiringAccounts.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/40 border border-rose-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-rose-950/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Points Expiring Soon!
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                You have {expiringAccounts[0].expiringPoints?.toLocaleString()} {expiringAccounts[0].currencyName} in {expiringAccounts[0].programName} expiring on {expiringAccounts[0].expirationDate}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('rewards')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shrink-0 shadow-sm"
          >
            Redeem Before Loss
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Points</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {totalPoints.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+19,600 this month</span>
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Portfolio Net Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            Based on current fair market rates
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Linked Programs</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {accounts.length}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
            <span>All accounts synced</span>
          </div>
        </div>

        {/* Transfer Opportunities */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Transfer Deals</span>
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            +25% Bonus
          </div>
          <div className="text-xs font-medium text-amber-300 mt-1">
            Amex to Delta promo active
          </div>
        </div>
      </div>

      {/* Points Distribution Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Portfolio Distribution</h3>
          <span className="text-xs text-slate-400">Total: {totalPoints.toLocaleString()} pts</span>
        </div>

        {/* Visual segmented bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex gap-0.5">
          <div
            style={{ width: `${(cardPoints / totalPoints) * 100}%` }}
            className="bg-indigo-500 h-full transition-all"
            title={`Credit Cards: ${cardPoints.toLocaleString()} pts`}
          />
          <div
            style={{ width: `${(airlinePoints / totalPoints) * 100}%` }}
            className="bg-sky-500 h-full transition-all"
            title={`Airlines: ${airlinePoints.toLocaleString()} pts`}
          />
          <div
            style={{ width: `${(hotelPoints / totalPoints) * 100}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Hotels: ${hotelPoints.toLocaleString()} pts`}
          />
          <div
            style={{ width: `${(retailDiningPoints / totalPoints) * 100}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Dining & Retail: ${retailDiningPoints.toLocaleString()} pts`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-medium">Cards:</span>
            <span className="text-white font-bold">{Math.round((cardPoints / totalPoints) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-medium">Airlines:</span>
            <span className="text-white font-bold">{Math.round((airlinePoints / totalPoints) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Hotels:</span>
            <span className="text-white font-bold">{Math.round((hotelPoints / totalPoints) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">Dining/Retail:</span>
            <span className="text-white font-bold">{Math.round((retailDiningPoints / totalPoints) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Digital Loyalty Cards Rack Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Digital Loyalty Cards</h2>
            <p className="text-xs text-slate-400">Click any card to show barcode pass for store/airport scanning.</p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.slice(0, 3).map((account: LoyaltyAccount) => (
            <DigitalLoyaltyCard
              key={account.id}
              account={account}
              onOpenPass={onOpenCardPass}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Points Activity</h3>
          <span className="text-xs text-slate-400">Live ledger</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {transactions.slice(0, 5).map((tx: PointsTransaction) => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">{tx.description}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {tx.programName} • {tx.date}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold text-sm ${
                    tx.points > 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()} pts
                </div>
                {tx.valueUsd && (
                  <div className="text-[11px] text-slate-400">
                    {tx.valueUsd > 0 ? `≈ +$${tx.valueUsd.toFixed(2)}` : `≈ -$${Math.abs(tx.valueUsd).toFixed(2)}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
