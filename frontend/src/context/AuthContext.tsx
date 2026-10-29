import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  preferredCurrency: string; // 'USD' | 'EUR' | 'GBP' | 'INR'
  mfaEnabled: boolean;
  autoSyncDaily: boolean;
  expiryAlertThresholdDays: number;
}

interface AuthContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleMfa: () => void;
}

const defaultUser: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@omnipoints.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  memberSince: 'March 2024',
  preferredCurrency: 'USD',
  mfaEnabled: true,
  autoSyncDaily: true,
  expiryAlertThresholdDays: 30,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const toggleMfa = () => {
    setUser(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }));
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, toggleMfa }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

