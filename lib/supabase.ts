import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Check your .env file.');
}

// Debug: Check if service key is loaded
if (supabaseServiceKey) {
  console.log('✅ Service role key loaded');
} else {
  console.warn('⚠️ Service role key not found - admin operations may fail');
}

// Normal client for authenticated users
// sessionStorage: Tarayıcı kapanınca session silinir (Kullanıcı iş kuralı)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: sessionStorage,          // 🔑 TARAYICI KAPANINCA ÇIKIŞ YAP
      persistSession: true,             // Aynı sekmede yenilemelerde devam et
      autoRefreshToken: true,           // Token otomatik yenilensin
      detectSessionInUrl: true,         // URL'deki token'ı algıla (OAuth için)
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

