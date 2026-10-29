import React from 'react';
import { Bell, Search, RefreshCw, PlusCircle } from 'lucide-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab, onMobileMenuToggle }) => {
  const { notifications, syncAllAccounts, setIsLinkingModalOpen } = useLoyalty();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs, flights, rewards..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-900/80 border border-slate-800 rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Sync Button */}
        <button
          onClick={() => syncAllAccounts()}
          title="Sync all balances"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Refresh All</span>
        </button>

        {/* Link Account CTA */}
        <button
          onClick={() => setIsLinkingModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-lg hover:from-brand-500 hover:to-indigo-500 transition-all shadow-md shadow-brand-600/20"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Link Program</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Mini Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/30"
          />
          <span className="hidden md:inline text-xs font-medium text-slate-200 pr-2">
            {user.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
