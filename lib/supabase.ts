import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Check your .env file.');
}

// Service key availability checked silently
const _hasServiceKey = !!supabaseServiceKey;

// Normal client for authenticated users
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // sessionStorage: tarayıcı kapanınca oturum temizlenir → her açılışta Landing sayfası
      storage: sessionStorage,
      persistSession: true,        // Aynı sekmede sayfa yenilemelerinde oturum korunur
      autoRefreshToken: true,      // Token otomatik yenilenir
      detectSessionInUrl: true,    // URL'deki OAuth token'ını algıla
      flowType: 'implicit',        // PKCE code exchange sorununu bypass eder
    }
  }
);

// Admin client using service role key (bypasses RLS)
// Completely disable auth features to prevent Multiple GoTrueClient warning
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || '', supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: 'supabase-admin-auth' // Use different storage key to avoid conflicts
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-admin'
      }
    }
  })
  : null; // Return null if no service key, we'll handle this in getAdminClient

// Helper to check if admin client is available
export const hasAdminClient = !!supabaseServiceKey;

// Keep-alive ping: Supabase free tier pauses after inactivity.
// Ping every 4 minutes in production to keep the connection warm.
if (import.meta.env.PROD) {
  setInterval(async () => {
    try {
      await supabase.from('users').select('id').limit(1);
    } catch {
      // silently ignore
    }
  }, 4 * 60 * 1000);
}

