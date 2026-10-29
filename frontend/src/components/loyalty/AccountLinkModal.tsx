import React, { useState } from 'react';
import { X, Search, ShieldCheck, Lock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { LoyaltyProgram } from '../../types/loyalty';

interface AccountLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountLinkModal: React.FC<AccountLinkModalProps> = ({ isOpen, onClose }) => {
  const { availablePrograms, linkAccount, accounts } = useLoyalty();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'credentials'>('oauth');
  const [accountNumber, setAccountNumber] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [memberTier, setMemberTier] = useState('Standard Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  if (!isOpen) return null;

  const linkedProgramIds = new Set(accounts.map(a => a.programId));

  const filteredPrograms = availablePrograms.filter(prog => {
    const matchesSearch = prog.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartLink = (program: LoyaltyProgram) => {
    setSelectedProgram(program);
    setAuthMethod(program.supportsOAuth ? 'oauth' : 'credentials');
    setAccountNumber('');
    setMemberPassword('');
  };

  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setIsSubmitting(true);
    const success = await linkAccount(
      selectedProgram.id,
      accountNumber || '8491028491',
      memberTier
    );

    setIsSubmitting(false);
    if (success) {
      setLinkSuccess(true);
      setTimeout(() => {
        setLinkSuccess(false);
        setSelectedProgram(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Link Loyalty Program</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect airlines, hotels, dining, and credit card rewards in real time.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedProgram(null);
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {linkSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Program Successfully Linked!</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Your point balance has been synchronized and added to your portfolio dashboard.
              </p>
            </div>
          ) : selectedProgram ? (
            /* Program Link Form */
            <form onSubmit={handleConfirmLink} className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {selectedProgram.logo}
                </div>
                <div>
                  <h4 className="font-bold text-white">{selectedProgram.name}</h4>
                  <span className="text-xs text-slate-400 capitalize">
                    {selectedProgram.category.replace('_', ' ')} • Avg. value {selectedProgram.averageValuationCent}¢ per {selectedProgram.currencyName.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Authentication Type Toggle */}
              {selectedProgram.supportsOAuth && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('oauth')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                      authMethod === 'oauth'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Direct Partner Login (OAuth)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('credentials')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                      authMethod === 'credentials'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Member ID & PIN
                  </button>
                </div>
              )}

              {authMethod === 'oauth' && selectedProgram.supportsOAuth ? (
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>Secure Instant Authorization</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You will be redirected to {selectedProgram.name}'s secure authentication server to approve read-only point tracking. OmniPoints never sees your master password.
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-bit TLS Encrypted Session Token</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">
                      {selectedProgram.name} Member ID or Account Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8492019481"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">
                      Account PIN / Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={memberPassword}
                      onChange={e => setMemberPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1 block">
                      Current Tier Status
                    </label>
                    <select
                      value={memberTier}
                      onChange={e => setMemberTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Standard Member">Standard Member</option>
                      <option value="Silver Elite">Silver Elite</option>
                      <option value="Gold Elite">Gold Elite</option>
                      <option value="Platinum / Diamond">Platinum / Diamond</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back to Directory
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating & Syncing Points...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect {selectedProgram.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Program Directory View */
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search program by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'airline', 'hotel', 'credit_card', 'dining', 'retail'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Programs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {filteredPrograms.map(prog => {
                  const isLinked = linkedProgramIds.has(prog.id);
                  return (
                    <div
                      key={prog.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isLinked
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prog.logo}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{prog.name}</h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {prog.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {isLinked ? (
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          Connected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartLink(prog)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

