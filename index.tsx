
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './lib/supabase';

const OAUTH_CALLBACK_PATH = import.meta.env.VITE_GOOGLE_OAUTH_CALLBACK_PATH || '/auth/google/callback';
const OAUTH_REDIRECT_HOME_URL = `${window.location.origin}/#/home`;
const OAUTH_REDIRECT_AUTH_URL = `${window.location.origin}/#/auth`;

// Keep callback path normalized for diagnostics and compatibility.
const _normalizedOAuthCallbackPath = OAUTH_CALLBACK_PATH.startsWith('/')
  ? OAUTH_CALLBACK_PATH
  : `/${OAUTH_CALLBACK_PATH}`;

// 🔑 OAuth Callback Handler — HashRouter ile uyumlu
// Supabase OAuth redirect sonrası URL'deki token/hata parametrelerini işle
// HashRouter "#" kullandığı için Supabase'in hash fragment'ları ile çakışma olur
(async () => {
  const url = new URL(window.location.href);
  const hashFragment = window.location.hash;
  const isOAuthCallbackPath = window.location.pathname === _normalizedOAuthCallbackPath;

  // 1. URL query params'da OAuth hatası var mı kontrol et
  const errorInQuery = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  if (errorInQuery) {
    console.error('🔴 OAuth error:', errorInQuery, errorDescription);
    // Hata parametrelerini temizle ve auth sayfasına yönlendir
    window.history.replaceState({}, '', OAUTH_REDIRECT_AUTH_URL);
    // Hata mesajını sessionStorage'a kaydet (Auth sayfasında gösterilecek)
    sessionStorage.setItem('silius_oauth_error', errorDescription || errorInQuery || 'Google ile giriş başarısız.');
  }

  // 2. Hash fragment'ta access_token varsa (OAuth başarılı)
  // HashRouter'ın "#/" prefix'i olmadan gelen hash'ler = Supabase OAuth token'ları
  if ((isOAuthCallbackPath || (hashFragment && !hashFragment.startsWith('#/'))) && (hashFragment.includes('access_token') || hashFragment.includes('refresh_token'))) {
    console.log('🔑 OAuth token detected in URL hash, processing...');
    try {
      // Supabase'in URL'deki token'ı işlemesini bekle
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('🔴 Session retrieval error:', error);
        sessionStorage.setItem('silius_oauth_error', error.message);
        window.location.replace(OAUTH_REDIRECT_AUTH_URL);
      } else if (data.session) {
        console.log('✅ OAuth session established:', data.session.user.email);
        // Token'ları URL'den temizle ve home'a yönlendir
        window.history.replaceState({}, '', OAUTH_REDIRECT_HOME_URL);
      } else {
        // Session alınamadıysa auth sayfasına gönder
        window.history.replaceState({}, '', OAUTH_REDIRECT_AUTH_URL);
      }
    } catch (err) {
      console.error('🔴 OAuth callback processing error:', err);
      window.history.replaceState({}, '', OAUTH_REDIRECT_AUTH_URL);
    }
  }

  // 3. Hash fragment'ta error varsa (OAuth hatası hash'te)
  if (hashFragment && !hashFragment.startsWith('#/') && hashFragment.includes('error=')) {
    console.error('🔴 OAuth error in hash fragment:', hashFragment);
    const hashParams = new URLSearchParams(hashFragment.replace('#', ''));
    const hashError = hashParams.get('error_description') || hashParams.get('error') || 'Google ile giriş başarısız.';
    sessionStorage.setItem('silius_oauth_error', decodeURIComponent(hashError));
    window.history.replaceState({}, '', OAUTH_REDIRECT_AUTH_URL);
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
