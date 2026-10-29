import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { LoyaltyAccount } from '../../types/loyalty';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceAccount: LoyaltyAccount | null;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  initialSourceAccount,
}) => {
  const { accounts, partners, executeTransfer } = useLoyalty();

  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [targetProgramId, setTargetProgramId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(10000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ targetPoints: number } | null>(null);

  useEffect(() => {
    if (initialSourceAccount) {
      setSourceAccountId(initialSourceAccount.id);
    } else if (accounts.length > 0 && !sourceAccountId) {
      setSourceAccountId(accounts[0].id);
    }
  }, [initialSourceAccount, accounts]);

  const sourceAccount = accounts.find(a => a.id === sourceAccountId);

  // Available transfer partners for selected source
  const availablePartners = partners.filter(
    p => p.sourceProgramId === sourceAccount?.programId
  );

  useEffect(() => {
    if (availablePartners.length > 0) {
      setTargetProgramId(availablePartners[0].targetProgramId);
    } else {
      setTargetProgramId('');
    }
  }, [sourceAccountId, availablePartners.length]);

  const selectedPartner = availablePartners.find(
    p => p.targetProgramId === targetProgramId
  );

  if (!isOpen) return null;

  const bonusMultiplier = selectedPartner?.bonusPercentage
    ? 1 + selectedPartner.bonusPercentage / 100
    : 1;

  const calculatedTargetPoints = selectedPartner
    ? Math.round(transferAmount * selectedPartner.ratio * bonusMultiplier)
    : 0;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceAccount || !targetProgramId || transferAmount <= 0) return;

    setIsSubmitting(true);
    const result = await executeTransfer(sourceAccount.id, targetProgramId, transferAmount);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessInfo({ targetPoints: result.targetPoints });
      setTimeout(() => {
        setSuccessInfo(null);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-brand-500/20 text-brand-400 border border-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Points Transfer Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert rewards between eligible airlines, hotels, & card partners.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {successInfo ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Transfer Completed!</h3>
              <p className="text-sm text-slate-300">
                <span className="font-bold text-emerald-400">
                  +{successInfo.targetPoints.toLocaleString()} points
                </span>{' '}
                have been deposited into your target account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTransfer} className="space-y-5">
              {/* Source Account Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Transfer From
                </label>
                <select
                  value={sourceAccountId}
                  onChange={e => setSourceAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.programName} ({acc.pointsBalance.toLocaleString()} {acc.currencyName} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Partner Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Transfer To
                </label>
                {availablePartners.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>No direct 1:1 transfer partners configured for this program. Select an Amex or Chase account.</span>
                  </div>
                ) : (
                  <select
                    value={targetProgramId}
                    onChange={e => setTargetProgramId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
                  >
                    {availablePartners.map(partner => (
                      <option key={partner.targetProgramId} value={partner.targetProgramId}>
                        {partner.targetProgramName} (Rate: 1 to {partner.ratio}
                        {partner.bonusPercentage ? ` + ${partner.bonusPercentage}% BONUS` : ''})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPartner && (
                <>
                  {/* Promotional Bonus Banner */}
                  {selectedPartner.bonusPercentage ? (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-transparent border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>{selectedPartner.bonusPercentage}% Promotional Bonus Active!</strong> Expires {selectedPartner.bonusExpiresAt}.
                      </span>
                    </div>
                  ) : null}

                  {/* Transfer Amount Input */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      <span>Points Amount</span>
                      <button
                        type="button"
                        onClick={() => setTransferAmount(sourceAccount ? sourceAccount.pointsBalance : 0)}
                        className="text-brand-400 hover:text-brand-300 capitalize text-xs"
                      >
                        Max ({sourceAccount?.pointsBalance.toLocaleString()})
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={selectedPartner.minTransfer}
                        max={sourceAccount?.pointsBalance}
                        step={500}
                        value={transferAmount}
                        onChange={e => setTransferAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Visual Conversion Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">You Transfer</div>
                      <div className="text-base font-bold text-white">
                        {transferAmount.toLocaleString()} {sourceAccount?.currencyName}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-brand-400" />
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">You Receive</div>
                      <div className="text-base font-bold text-emerald-400">
                        {calculatedTargetPoints.toLocaleString()} Points
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Est. arrival: {selectedPartner.transferTimeEstimate}</span>
                    <span>Fee: $0.00</span>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedPartner || transferAmount <= 0 || (sourceAccount ? transferAmount > sourceAccount.pointsBalance : true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-brand-600/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Conversion on Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Transfer Points</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
