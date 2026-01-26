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
  age?: number;
  gender?: 'male' | 'female' | 'transgender' | 'lesbian' | 'gay' | 'bisexual_male' | 'bisexual_female' | 'prefer_not_to_say';
  role: 'user' | 'admin';
  hasAcceptedTerms?: boolean;
  isProfileComplete?: boolean;
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
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// localStorage cache keys
const PROFILE_CACHE_KEY = 'silius_profile_cache';
const CACHE_EXPIRY_KEY = 'silius_cache_expiry';
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika - Daha uzun cache = Daha hızlı yükleme
const MAX_LOADING_TIME = 2000; // 2 saniye maksimum yükleme süresi - daha hızlı!

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
      // Timeout - 2 saniye (hızlı yükleme)
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2000)
      );

      // maybeSingle() kullan - single() 406 hatası veriyor
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (!result) {
        console.warn('Profile fetch timeout - 2s geçti');
        return null;
      }

      const { data, error } = result as any;

      if (error) {
        // 406 hatası - ignore et çünkü maybeSingle ile çözülmeli
        if (error.code === 'PGRST116') {
          console.warn('Profile not found (expected for new users)');
          return null;
        }
        console.warn('Profile fetch warning:', error.message);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      const profileData = data as UserProfile;
      saveProfileToCache(profileData);
      return profileData;
    } catch (err: any) {
      console.warn('Profile fetch error:', err?.message);
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

    // GÜVENLİK: Maksimum 3 saniye loading - sonra zorla göster
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Max loading time (3s) reached, forcing UI');
        setLoading(false);
      }
    }, 3000);

    const checkAuth = async () => {
      try {
        // 1. Session'ı al - localStorage'dan çok hızlı gelecek
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        // Session ve user'ı hemen set et
        setSession(session);
        setUser(session?.user ?? null);

        // 2. Kullanıcı giriş yapmamışsa hemen bitir
        if (!session?.user) {
          setIsBanned(false);
          setBanInfo(null);
          setProfile(null);
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }

        // 3. Önce cache'den profil yükle - ANINDA göster
        const cachedProfile = getProfileFromCache(session.user.id);
        if (cachedProfile) {
          setProfile(cachedProfile);
          setIsBanned(false);
          setBanInfo(null);
          setLoading(false); // Hemen göster!
          clearTimeout(loadingTimeout);

          // Arka planda güncel veri al (kullanıcı beklemez)
          fetchProfile(session.user.id, false).then(fresh => {
            if (mounted && fresh) setProfile(fresh);
          }).catch(() => { });

          return;
        }

        // 4. Cache yoksa - PARALEL yükle (ban + profile aynı anda)
        const [banResult, profileData] = await Promise.all([
          db.isUserBanned(session.user.id).catch(() => false),
          fetchProfile(session.user.id)
        ]);

        if (!mounted) return;

        // Ban kontrolü
        if (banResult) {
          const banData = await db.getBanInfo(session.user.id);
          setIsBanned(true);
          setBanInfo(banData);
        } else {
          setIsBanned(false);
          setBanInfo(null);
        }

        setProfile(profileData);
        setLoading(false);
        clearTimeout(loadingTimeout);

      } catch (error) {
        console.warn('⚠️ Auth check failed:', error);
        if (mounted) {
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    };

    checkAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Önce cache'den profil kontrol et - HIZLI YÜKLEME
          const cachedProfile = getProfileFromCache(session.user.id);
          if (cachedProfile) {
            setProfile(cachedProfile);
            setIsBanned(false);
            setBanInfo(null);
            setLoading(false);
            // Arka planda güncel veri al
            fetchProfile(session.user.id, false).then(fresh => {
              if (mounted && fresh) setProfile(fresh);
            }).catch(() => {});
            return;
          }

          // Cache yoksa paralel yükle - ban + profil aynı anda
          const [banResult, profileData] = await Promise.all([
            db.isUserBanned(session.user.id).catch(() => false),
            fetchProfile(session.user.id)
          ]);

          if (!mounted) return;

          // Ban kontrolü
          if (banResult) {
            const banData = await db.getBanInfo(session.user.id);
            setIsBanned(true);
            setBanInfo(banData);
            setLoading(false);
            return;
          }

          setIsBanned(false);
          setBanInfo(null);

          // Profil varsa set et, yoksa oluştur
          if (profileData) {
            setProfile(profileData);
          } else {
            // Profil yoksa otomatik oluştur (Google OAuth veya normal kayıt)
            console.log('🆕 No profile found, creating automatically...');

            const userMeta = session.user.user_metadata || {};
            const email = session.user.email || '';
            const fullName = userMeta?.full_name || userMeta?.name || '';
            const nameParts = fullName.split(' ').filter(Boolean);
            const firstName = userMeta?.firstName || nameParts[0] || email.split('@')[0] || 'User';
            const lastName = userMeta?.lastName || nameParts.slice(1).join(' ') || '';
            const username = userMeta?.username || email.split('@')[0] || `user_${Date.now()}`;
            const avatar = userMeta?.avatar_url || userMeta?.picture || userMeta?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

            try {
              const { error: insertError } = await supabase
                .from('users')
                .upsert({
                  id: session.user.id,
                  email: email,
                  firstName: firstName,
                  lastName: lastName,
                  username: username,
                  avatar: avatar,
                  bio: "Silius'ta yeni bir macera başlıyor...",
                  role: 'user',
                  hasAcceptedTerms: true,
                  isProfileComplete: false
                }, { onConflict: 'id' });

              if (!insertError) {
                console.log('✅ Profile created successfully!');
                const newProfile = await fetchProfile(session.user.id, false);
                setProfile(newProfile);
              }
            } catch (createError) {
              console.error('❌ Profile creation error:', createError);
            }
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
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ): Promise<{ error: Error | null }> => {
    try {
      // 1. Auth'a kayıt
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

      console.log('✅ Auth sign up success:', authData.user.id);

      // 2. ✅ YENİ: public.users tablosuna da kayıt ekle
      // isProfileComplete: false ile kaydediyoruz ki ProfileSetup sayfası açılsın
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          username: userData.username || email.split('@')[0],
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          bio: "Silius'ta yeni bir macera başlıyor...",
          role: 'user',
          hasAcceptedTerms: true,
          isProfileComplete: false  // ← Bu sayede ProfileSetup sayfası açılacak!
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('⚠️ Profile creation error (user may need to verify email first):', profileError);
        // E-posta doğrulaması gerekebilir, bu durumda ilk giriş sonrası profil oluşturulacak
      } else {
        console.log('✅ Profile created in users table with isProfileComplete: false');
      }

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

  // Google OAuth ile giriş yapma fonksiyonu
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/#/home' // Başarılı girişten sonra ana sayfaya yönlendir
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('🔴 Google sign in error:', error);
      return { error: error as Error };
    }
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
    signInWithGoogle,
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
