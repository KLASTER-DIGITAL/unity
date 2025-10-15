import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Создаем singleton instance Supabase клиента для фронтенда
export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey);

// Экспортируем функцию создания клиента
export function createClient() {
  return supabase;
}
