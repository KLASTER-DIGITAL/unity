/**
 * Supabase Client for React Native
 *
 * Platform-agnostic Supabase client configuration
 * Работает как в PWA так и в React Native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

/**
 * Create Supabase client with AsyncStorage for React Native
 */
export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper function to create Supabase client (for compatibility with PWA)
 */
export function createClient() {
  return supabase;
}
