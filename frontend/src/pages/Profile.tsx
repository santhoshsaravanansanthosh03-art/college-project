import React from 'react';
import { User, Shield, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, toggleMfa } = useAuth();
  const { accounts, totalPoints } = useLoyalty();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-brand-400" />
          <span>Profile & Security Vault</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your universal loyalty settings, connected vault credentials, and security preferences.
        </p>
      </div>

      {/* User Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-500/20"
        />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Member since {user.memberSince}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              OmniPoints Pro Tier
            </span>
          </div>
        </div>
      </div>

      {/* Security Vault Section */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Security & Vault Protections</h3>
        </div>

        <div className="divide-y divide-slate-800">
          {/* Two-Factor Authentication Toggle */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Two-Factor Authentication (MFA)</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Require biometric or authenticator app approval for point transfers.
              </div>
            </div>
            <button
              onClick={toggleMfa}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                user.mfaEnabled ? 'bg-brand-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  user.mfaEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Credential Encryption */}
          <div className="py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Hardware Encrypted Vault</div>
              <div className="text-xs text-slate-400 mt-0.5">
                All 3rd-party partner tokens are protected with AES-256 GCM envelope encryption.
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Portfolio Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Default Valuation Currency
            </label>
            <select
              value={user.preferredCurrency}
              onChange={e => updateUser({ preferredCurrency: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="USD">USD ($ United States Dollar)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
              <option value="INR">INR (₹ Indian Rupee)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">
              Expiry Warning Threshold
            </label>
            <select
              value={user.expiryAlertThresholdDays}
              onChange={e => updateUser({ expiryAlertThresholdDays: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value={15}>15 Days Before Expiry</option>
              <option value={30}>30 Days Before Expiry (Recommended)</option>
              <option value={60}>60 Days Before Expiry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Connected Data Summary */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-white">Platform Health</h3>
        <p className="text-xs text-slate-400">
          Sync status: healthy • {accounts.length} active programs connected • Total {totalPoints.toLocaleString()} aggregated rewards.
        </p>
      </div>
    </div>
  );
};
