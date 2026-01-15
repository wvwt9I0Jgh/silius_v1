import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { db } from '../db';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'transgender' | 'lesbian' | 'gay' | 'bisexual_male' | 'bisexual_female' | 'prefer_not_to_say';
  role: 'user' | 'admin';
  hasAcceptedTerms?: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  banInfo: { reason: string; bannedAt: string } | null;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// localStorage cache keys
const PROFILE_CACHE_KEY = 'silius_profile_cache';
const CACHE_EXPIRY_KEY = 'silius_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// LocalStorage'dan profil cache'i oku
const getProfileFromCache = (userId: string): UserProfile | null => {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      const profile = JSON.parse(cached);
      if (profile.id === userId) return profile;
    }
  } catch { }
  return null;
};

// Profil'i localStorage'a kaydet
const saveProfileToCache = (profile: UserProfile) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
  } catch { }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ reason: string; bannedAt: string } | null>(null);

  const fetchProfile = async (userId: string, useCache = true): Promise<UserProfile | null> => {
    // Önce cache'den kontrol et
    if (useCache) {
      const cached = getProfileFromCache(userId);
      if (cached) {
        return cached;
      }
    }

    try {
      // Kısa timeout - 5 saniye
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      );

      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (!result) {
        return null;
      }

      const { data, error } = result as any;

      if (error) {
        console.warn('Profile fetch warning:', error.message);
        return null;
      }

      const profileData = data as UserProfile;
      saveProfileToCache(profileData);
      return profileData;
    } catch (err: any) {
      if (err.message === 'TIMEOUT') {
        console.warn('Profile fetch timed out');
      }
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, false); // Cache'i bypass et
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Hızlı başlangıç: Session'ı al
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Ban kontrolü
          const banned = await db.isUserBanned(session.user.id);
          if (banned) {
            const banData = await db.getBanInfo(session.user.id);
            if (mounted) {
              setIsBanned(true);
              setBanInfo(banData);
              setLoading(false);
            }
            return;
          }
          setIsBanned(false);
          setBanInfo(null);

          // Önce cache'den profil yükle (anında göster)
          const cachedProfile = getProfileFromCache(session.user.id);
          if (cachedProfile) {
            setProfile(cachedProfile);
            setLoading(false);

            // Arka planda güncel profili al
            fetchProfile(session.user.id, false).then(freshProfile => {
              if (mounted && freshProfile) {
                setProfile(freshProfile);
              }
            });
          } else {
            // Cache yoksa normal yükle
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
              setLoading(false);
            }
          }
        } else {
          setIsBanned(false);
          setBanInfo(null);
          setLoading(false);
        }
      } catch (error) {
        console.warn('⚠️ Auth check failed:', error);
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Ban kontrolü
          const banned = await db.isUserBanned(session.user.id);
          if (banned) {
            const banData = await db.getBanInfo(session.user.id);
            setIsBanned(true);
            setBanInfo(banData);
          } else {
            setIsBanned(false);
            setBanInfo(null);
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }
        } else {
          setProfile(null);
          setIsBanned(false);
          setBanInfo(null);
          // Logout'ta cache'i temizle
          localStorage.removeItem(PROFILE_CACHE_KEY);
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ): Promise<{ error: Error | null }> => {
    try {
      // Auth'a kayıt - trigger otomatik profil oluşturacak
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || email.split('@')[0],
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
          }
        }
      });

      if (authError) {
        console.error('🔴 Sign up error:', authError.message, authError);
        throw authError;
      }
      if (!authData.user) throw new Error('Kayıt başarısız');

      console.log('✅ Sign up success:', authData.user.id);
      return { error: null };
    } catch (error) {
      console.error('🔴 Sign up catch:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    // Landing sayfasına yönlendir (HashRouter için)
    window.location.hash = '#/';
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    try {
      if (!user) throw new Error('Oturum açık değil');

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Profili yenile
      await refreshProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.role === 'admin',
    isBanned,
    banInfo,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
