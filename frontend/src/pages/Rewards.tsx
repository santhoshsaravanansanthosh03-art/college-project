import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { RewardRecommendation, TransferPartner } from '../types/loyalty';

interface RewardsProps {
  onOpenTransfer: () => void;
}

export const RewardsPage: React.FC<RewardsProps> = ({ onOpenTransfer }) => {
  const { partners, recommendations } = useLoyalty();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredRecommendations = recommendations.filter(
    (rec: RewardRecommendation) => filterCategory === 'all' || rec.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ArrowLeftRight className="w-7 h-7 text-brand-400" />
            <span>Rewards, Transfers & Optimization</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Convert points between partner ecosystems and unlock maximum value per point.
          </p>
        </div>

        <button
          onClick={onOpenTransfer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-brand-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Points Converter</span>
        </button>
      </div>

      {/* Active Transfer Bonuses Showcase */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-amber-950/40 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Percent className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white">Live Transfer Bonuses</h3>
          </div>
          <span className="text-xs text-amber-300 font-semibold">Limited Time Promotions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {partners.filter((p: TransferPartner) => (p.bonusPercentage || 0) > 0).map((partner: TransferPartner) => (
            <div
              key={partner.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{partner.sourceProgramName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-brand-300">{partner.targetProgramName}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Base 1:{partner.ratio} • Promo ends {partner.bonusExpiresAt}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +{partner.bonusPercentage}% BONUS
                </span>
                <button
                  onClick={onOpenTransfer}
                  className="block text-[11px] font-semibold text-brand-400 hover:text-brand-300 mt-1.5"
                >
                  Transfer Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation Engine Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Smart Redemption Deals (High Yields)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Curated sweet-spot redemptions yielding 2x to 4x the standard point valuation.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'travel', 'hotel', 'dining'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecommendations.map((deal: RewardRecommendation) => (
            <div
              key={deal.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {deal.badge || 'Sweet Spot'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {deal.valuePerPointCent}¢ / point
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{deal.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {deal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Required Points</div>
                  <div className="text-base font-black text-white">
                    {deal.requiredPoints.toLocaleString()} <span className="text-xs font-normal text-slate-400">{deal.sourceProgramName}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Cash value: ${deal.cashEquivalentUsd.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={onOpenTransfer}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 transition-colors"
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
