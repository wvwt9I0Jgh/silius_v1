
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { db } from './database';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Users from './pages/Users';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import About from './pages/About';
import Security from './pages/Security';
import Guidelines from './pages/Guidelines';
import Contact from './pages/Contact';
import HowToUse from './pages/HowToUse';
import Vibeler from './pages/Vibeler';
import Topluluk from './pages/Topluluk';
import Mekanlar from './pages/Mekanlar';
import Navbar from './components/Navbar';
import Admin from './pages/Admin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVibes from './pages/admin/AdminVibes';
import AdminPages from './pages/admin/AdminPages';
import AdminBans from './pages/admin/AdminBans';
import PageEditor from './pages/admin/PageEditor';
import CMSPageView from './pages/CMSPageView';
import ProfileSetup from './pages/ProfileSetup';
import CheckInPage from './pages/CheckInPage'; // QR Check-in Page
import MyQR from './pages/MyQR';
import BanScreen from './components/BanScreen';
import { Moon, Sun, Loader2 } from 'lucide-react';


// Protected Route Component - Profil tamamlanmamış kullanıcıları yönlendirir
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Profil henüz yüklenmediyse loading göster (flash önleme)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Profili tamamlanmamış kullanıcıları ProfileSetup'a yönlendir
  // Sadece ilk kayıtta gösterilir (isProfileComplete false ise)
  if (profile.isProfileComplete === false) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component - Supabase auth OR secret admin auth
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  // Secret admin auth kontrolü (localStorage)
  const hasSecretAdminAuth = localStorage.getItem('silius_admin_auth') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Secret admin auth varsa veya normal admin kullanıcısıysa erişime izin ver
  if (hasSecretAdminAuth || (user && profile?.role === 'admin')) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const { user, profile, loading, signOut, isBanned, banInfo } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [forceShow, setForceShow] = useState(false);
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // GÜVENLİK: App seviyesinde de timeout - 4 saniye sonra zorla göster
    const forceShowTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ App: Force showing UI after 4s');
        setForceShow(true);
      }
    }, 4000);

    return () => clearTimeout(forceShowTimeout);
  }, [loading]);

  // Vibe Score - Platformda geçirilen süre takibi
  useEffect(() => {
    if (user && profile) {
      // Her 5 dakikada bir süreyi güncelle (0.10 puan = 5 dk)
      const TIME_TRACKING_INTERVAL = 5 * 60 * 1000; // 5 dakika

      timeTrackingRef.current = setInterval(() => {
        db.updateTimeSpent(user.id, 5); // 5 dakika ekle
        console.log('📊 Vibe Score: +5 dk eklendi');
      }, TIME_TRACKING_INTERVAL);

      // Sayfa kapatıldığında veya kullanıcı çıkış yaptığında temizle
      return () => {
        if (timeTrackingRef.current) {
          clearInterval(timeTrackingRef.current);
        }
      };
    }
  }, [user, profile]);

  const handleLogout = async () => {
    await signOut();
  };

  // Loading ekranı - ama forceShow true ise atla
  if (loading && !forceShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Banlı kullanıcı kontrolü
  if (isBanned && banInfo) {
    return <BanScreen reason={banInfo.reason} bannedAt={banInfo.bannedAt} onLogout={handleLogout} />;
  }

  // Profile'ı User tipine dönüştür - veya user varsa minimal profil oluştur
  const currentUser = profile ? {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    bio: profile.bio,
    avatar: profile.avatar,
    age: profile.age,
    gender: profile.gender,
    role: profile.role,
    hasAcceptedTerms: profile.hasAcceptedTerms,
    isProfileComplete: profile.isProfileComplete
  } : user ? {
    // Fallback: Auth user varsa minimal profil oluştur
    id: user.id,
    email: user.email || '',
    firstName: user.user_metadata?.firstName || user.user_metadata?.full_name?.split(' ')[0] || 'User',
    lastName: user.user_metadata?.lastName || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
    bio: 'Profil yükleniyor...',
    avatar: user.user_metadata?.avatar || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    age: undefined,
    gender: undefined,
    role: 'user' as const,
    hasAcceptedTerms: true,
    isProfileComplete: false
  } : null;

  // Profil yüklenememe durumunu sessizce yönet
  // (currentUser fallback mekanizması ile çalışır)

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-500 bg-bg-deep text-text-main">

        {/* Global Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 md:top-8 md:right-12 z-[200] w-12 h-12 md:w-14 md:h-14 flex items-center justify-center glass rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 group"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={user ? <Navigate to="/home" /> : <Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/security" element={<Security />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/nasil-kullanilir" element={<HowToUse />} />
          <Route path="/vibeler" element={<Vibeler />} />
          <Route path="/topluluk" element={<Topluluk />} />
          <Route path="/mekanlar" element={<Mekanlar />} />

          {/* QR Check-in Route */}
          <Route path="/checkin/:eventId" element={<CheckInPage />} />

          {/* CMS Pages (Public) */}
          <Route path="/page/:slug" element={<CMSPageView />} />

          {/* Profile Setup - TÜM yeni kullanıcılar için (ilk girişte) */}
          <Route
            path="/profile-setup"
            element={
              user ? (
                profile?.isProfileComplete ? (
                  <Navigate to="/home" replace />
                ) : (
                  <ProfileSetup />
                )
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                {currentUser && <Home user={currentUser} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                {currentUser && <EventDetail user={currentUser} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                {currentUser && <Users user={currentUser} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                {currentUser && <Friends user={currentUser} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {currentUser && <Profile user={currentUser} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-qr"
            element={
              <ProtectedRoute>
                <MyQR />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vibes"
            element={
              <AdminRoute>
                <AdminVibes />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <AdminRoute>
                <AdminPages />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pages/:id"
            element={
              <AdminRoute>
                <PageEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bans"
            element={
              <AdminRoute>
                <AdminBans />
              </AdminRoute>
            }
          />
          {/* 404 - Bilinmeyen URL → Landing sayfasına yönlendir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
