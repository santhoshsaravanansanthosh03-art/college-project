import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Smartphone, Trash2, RefreshCw, AlertCircle, ArrowUpRight } from 'lucide-react';
import { LoyaltyAccount } from '../../types/loyalty';
import { useLoyalty } from '../../context/LoyaltyContext';

interface CardPassModalProps {
  account: LoyaltyAccount | null;
  onClose: () => void;
  onOpenTransfer: (account: LoyaltyAccount) => void;
}

export const CardPassModal: React.FC<CardPassModalProps> = ({ account, onClose, onOpenTransfer }) => {
  const { unlinkAccount, syncAccount } = useLoyalty();
  const [copied, setCopied] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);

  if (!account) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account.accountNumberFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToWallet = () => {
    setWalletAdded(true);
    setTimeout(() => setWalletAdded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Pass Top Banner */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
            Digital Membership Pass
          </span>
          <h2 className="text-xl font-bold text-white mt-1">{account.programName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {account.memberTier}
            </span>
            <span className="text-xs text-slate-400">
              Last synced {account.lastSyncedAt}
            </span>
          </div>
        </div>

        {/* Pass Content */}
        <div className="p-6 space-y-6">
          {/* Points Overview Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Available Balance</div>
              <div className="text-2xl font-black text-white tracking-tight">
                {account.pointsBalance.toLocaleString()} {account.currencyName}
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                Valued at ≈ ${account.estimatedValueUsd.toFixed(2)} USD
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenTransfer(account);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors flex items-center gap-1 shadow-md shadow-brand-600/20"
            >
              <span>Transfer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Account Number Copy Field */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">
              Membership Number
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-sm tracking-wider text-slate-200">
                {account.accountNumberFull}
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Barcode / Scan Pass Representation */}
          <div className="p-5 rounded-2xl bg-white flex flex-col items-center justify-center text-slate-900 shadow-md">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Scan at Checkout or Gate
            </div>

            {/* Visual Simulated High-Density Barcode */}
            <div className="w-full flex justify-center py-2">
              <div className="flex items-end gap-0.5 h-14 px-2">
                {[
                  3,1,2,1,4,2,1,3,1,2,3,1,1,4,2,1,2,3,1,1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,3,1,1,4,2
                ].map((width, i) => (
                  <div
                    key={i}
                    className="bg-black h-full rounded-sm"
                    style={{ width: `${width * 2}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="font-mono text-xs tracking-widest font-bold text-slate-700 mt-2">
              {account.barcodeValue}
            </div>
          </div>

          {/* Expiration or Tier Notice */}
          {account.isExpiringSoon && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <span className="font-bold">{account.expiringPoints?.toLocaleString()} {account.currencyName}</span> are set to expire on {account.expirationDate}. Use them or transfer them to prevent expiration.
              </div>
            </div>
          )}

          {/* Apple & Google Wallet Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToWallet}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black border border-slate-700 text-white text-xs font-semibold hover:border-slate-500 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>{walletAdded ? 'Added to Apple Wallet' : 'Apple Wallet'}</span>
            </button>
            <button
              onClick={handleAddToWallet}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>{walletAdded ? 'Pass Saved' : 'Google Wallet'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              syncAccount(account.id);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
            <span>Force Sync</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to unlink ${account.programName}?`)) {
                unlinkAccount(account.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Unlink Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

