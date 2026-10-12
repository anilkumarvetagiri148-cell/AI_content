import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CreatorProfileData,
  NotificationItem,
  PortfolioProject,
  Profile,
} from '../types';
import { apiRequest, getStoredToken, setStoredToken } from '../lib/api';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
}

interface AuthContextValue {
  user: Profile | null;
  creatorProfile: CreatorProfileData | null;
  portfolio: PortfolioProject[];
  savedCreatorIds: string[];
  notifications: NotificationItem[];
  loading: boolean;
  login: (email: string, password: string) => Promise<Profile>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'creator' | 'brand';
    company_name?: string;
    specialization?: string;
    location?: string;
  }) => Promise<Profile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleFavorite: (creatorId: string) => Promise<boolean>;
  markAllNotificationsRead: () => Promise<void>;
  showToast: (title: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfileData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadAuxData = useCallback(async () => {
    try {
      const [favRes, notifRes] = await Promise.all([
        apiRequest<{ savedCreatorIds: string[] }>('/api/favorites'),
        apiRequest<{ notifications: NotificationItem[] }>('/api/notifications'),
      ]);
      setSavedCreatorIds(favRes.savedCreatorIds || []);
      setNotifications(notifRes.notifications || []);
    } catch {
      // Ignore if unauthenticated
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setCreatorProfile(null);
      setPortfolio([]);
      setSavedCreatorIds([]);
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const data = await apiRequest<{
        user: Profile;
        creatorProfile: CreatorProfileData | null;
        portfolio: PortfolioProject[];
      }>('/api/auth/me');
      setUser(data.user);
      setCreatorProfile(data.creatorProfile);
      setPortfolio(data.portfolio || []);
      await loadAuxData();
    } catch {
      setStoredToken(null);
      setUser(null);
      setCreatorProfile(null);
    } finally {
      setLoading(false);
    }
  }, [loadAuxData]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<Profile> => {
    const res = await apiRequest<{
      token: string;
      user: Profile;
      creatorProfile: CreatorProfileData | null;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    setUser(res.user);
    setCreatorProfile(res.creatorProfile);
    await refreshUser();
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    return res.user;
  };

  const signup = async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'creator' | 'brand';
    company_name?: string;
    specialization?: string;
    location?: string;
  }): Promise<Profile> => {
    const res = await apiRequest<{
      token: string;
      user: Profile;
      creatorProfile: CreatorProfileData | null;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    setUser(res.user);
    setCreatorProfile(res.creatorProfile);
    await refreshUser();
    showToast(`Account created! Welcome to CreatorConnect AI, ${res.user.name}.`, 'success');
    return res.user;
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    setCreatorProfile(null);
    setPortfolio([]);
    setSavedCreatorIds([]);
    setNotifications([]);
    showToast('You have been signed out.', 'info');
  };

  const toggleFavorite = async (creatorId: string): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in to save creators to your favorites list.', 'info');
      return false;
    }
    try {
      const res = await apiRequest<{ saved: boolean; creatorId: string }>(
        `/api/favorites/${creatorId}`,
        { method: 'POST' }
      );
      if (res.saved) {
        setSavedCreatorIds((prev) => [...prev, creatorId]);
        showToast('Creator saved to your favorites!', 'success');
      } else {
        setSavedCreatorIds((prev) => prev.filter((id) => id !== creatorId));
        showToast('Creator removed from favorites.', 'info');
      }
      return res.saved;
    } catch (err: any) {
      showToast(err.message || 'Could not update favorites.', 'error');
      return false;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        creatorProfile,
        portfolio,
        savedCreatorIds,
        notifications,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        toggleFavorite,
        markAllNotificationsRead,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-[#17132E]/95 border-emerald-500/40 text-white'
                : t.type === 'error'
                ? 'bg-[#17132E]/95 border-rose-500/50 text-white'
                : 'bg-[#17132E]/95 border-[#7C4DFF]/50 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#9D7BFF] shrink-0" />}
              <span className="text-sm font-medium leading-snug">{t.title}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-[#B9B3D0] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
