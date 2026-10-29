import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  PlusCircle,
  Bell,
  UserCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { totalPoints, totalValueUsd, accounts } = useLoyalty();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet & Cards', icon: WalletCards, badge: `${accounts.length}` },
    { id: 'rewards', label: 'Rewards & Transfers', icon: ArrowLeftRight, isHighlight: true },
    { id: 'linking', label: 'Link Program', icon: PlusCircle },
    { id: 'notifications', label: 'Alerts & Expiry', icon: Bell },
    { id: 'profile', label: 'Profile & Security', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              Omni<span className="text-brand-400">Points</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block -mt-1">
              Universal Loyalty
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.isHighlight ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Aggregated Total Balance Card */}
        <div className="p-4 border-t border-slate-900">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Total Portfolio</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {totalPoints.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">
              ≈ ${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {user.preferredCurrency}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{accounts.length} linked accounts</span>
              <button
                onClick={() => {
                  setActiveTab('wallet');
                  onClose();
                }}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
              >
                Cards <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
