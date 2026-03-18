
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { db } from './database';
import Navbar from './components/Navbar';
import BanScreen from './components/BanScreen';
import { Loader2 } from 'lucide-react';

// Landing ve Auth da lazy yükle - ilk açılışta daha küçük bundle
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));

// Lazy-loaded pages — her sayfa ayrı chunk olarak yüklenir
const Home = lazy(() => import('./pages/Home'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Users = lazy(() => import('./pages/Users'));
const Friends = lazy(() => import('./pages/Friends'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Security = lazy(() => import('./pages/Security'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Contact = lazy(() => import('./pages/Contact'));
const HowToUse = lazy(() => import('./pages/HowToUse'));
const Vibeler = lazy(() => import('./pages/Vibeler'));
const Topluluk = lazy(() => import('./pages/Topluluk'));
const Mekanlar = lazy(() => import('./pages/Mekanlar'));
const Info = lazy(() => import('./pages/Info'));
const Galerimiz = lazy(() => import('./pages/Galerimiz'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminVibes = lazy(() => import('./pages/admin/AdminVibes'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminBans = lazy(() => import('./pages/admin/AdminBans'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const PageEditor = lazy(() => import('./pages/admin/PageEditor'));
const CMSPageView = lazy(() => import('./pages/CMSPageView'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const MyQR = lazy(() => import('./pages/MyQR'));
const CookiePolicy = lazy(() => import('./pages/Cookie'));

// Minimal fallback spinner — Suspense boundary için
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
  </div>
);


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
  const [forceShow, setForceShow] = useState(false);
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // GÜVENLİK: App seviyesinde de timeout - 2.5 saniye sonra zorla göster
    const forceShowTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ App: Force showing UI after 2.5s');
        setForceShow(true);
      }
    }, 2500);

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

        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}

        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={user ? <Navigate to="/home" /> : <Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/security" element={<Security />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/nasil-kullanilir" element={<HowToUse />} />
          <Route path="/vibeler" element={<Vibeler />} />
          <Route path="/topluluk" element={<Topluluk />} />
          <Route path="/mekanlar" element={<Mekanlar />} />
          <Route path="/info" element={<Info />} />
          <Route path="/galerimiz" element={<Galerimiz />} />

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
          <Route
            path="/admin/gallery"
            element={
              <AdminRoute>
                <AdminGallery />
              </AdminRoute>
            }
          />
          {/* 404 - Bilinmeyen URL → Landing sayfasına yönlendir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
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
