import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/shared/lib/platform/env';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): Uses import.meta.env (Vite) via Platform Adapter
 * - React Native build (/app/): Uses process.env.EXPO_PUBLIC_* via Platform Adapter
 *
 * @see src/shared/lib/platform/env/index.ts
 */

// Get Supabase credentials from Platform Adapter
const supabaseUrl = env.SUPABASE_URL;
const publicAnonKey = env.SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !publicAnonKey) {
	console.error('❌ Supabase credentials validation failed!');
	console.error('SUPABASE_URL:', supabaseUrl);
	console.error('SUPABASE_ANON_KEY:', publicAnonKey ? 'present' : 'missing');
}

// Создаем singleton instance Supabase клиента для фронтенда
// Fix: Add auth options to persist session in localStorage
export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: window.localStorage,
		storageKey: 'supabase.auth.token',
	},
});

// Handle auth state changes and errors
supabase.auth.onAuthStateChange((event, session) => {
	console.log('[Supabase Auth] Event:', event, 'Session:', session ? 'present' : 'null');

	// Handle token refresh errors
	if (event === 'TOKEN_REFRESHED') {
		if (!session) {
			// ✅ FIX: Token refresh failed (invalid refresh token)
			console.warn('[Supabase Auth] ⚠️ Token refresh failed - clearing invalid token');
			// Clear localStorage to prevent repeated 400 errors
			try {
				localStorage.removeItem('supabase.auth.token');
				localStorage.removeItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
			} catch (error) {
				console.error('[Supabase Auth] Error clearing localStorage:', error);
			}
		} else {
			console.log('[Supabase Auth] ✅ Token refreshed successfully');
		}
	}

	if (event === 'SIGNED_OUT') {
		console.log('[Supabase Auth] 🚪 User signed out');
		// Clear any cached data if needed
	}

	if (event === 'USER_UPDATED') {
		console.log('[Supabase Auth] 🔄 User updated');
	}
});

// Экспортируем функцию создания клиента
export function createClient() {
	return supabase;
}
