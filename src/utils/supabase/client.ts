import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

// Validate credentials
if (!supabaseUrl || !publicAnonKey) {
  console.error('❌ Supabase credentials are missing!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', publicAnonKey ? 'present' : 'missing');
}

// Создаем singleton instance Supabase клиента для фронтенда
// Fix: Add auth options to persist session in localStorage
export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token'
  }
});

// Экспортируем функцию создания клиента
export function createClient() {
  return supabase;
}
