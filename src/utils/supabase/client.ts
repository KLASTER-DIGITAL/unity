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

// ✅ FIX: Перехватываем ошибки refresh token ДО onAuthStateChange
// Supabase пытается автоматически обновить токен при инициализации,
// и если refresh token невалидный, ошибка возникает раньше, чем срабатывает onAuthStateChange

// Перехватываем ошибки на уровне fetch для auth endpoints
const originalFetch = window.fetch;
window.fetch = async (...args) => {
	const [url] = args;
	const urlString = typeof url === 'string' ? url : url.toString();

	// Перехватываем запросы к auth endpoints
	if (urlString.includes('/auth/v1/token') && urlString.includes('grant_type=refresh_token')) {
		try {
			const response = await originalFetch(...args);

			// Если получили 400 ошибку - это невалидный refresh token
			if (response.status === 400) {
				const clonedResponse = response.clone();
				try {
					const errorData = await clonedResponse.json();
					if (
						errorData?.error_description?.includes('Invalid Refresh Token') ||
						errorData?.error_description?.includes('Refresh Token Not Found')
					) {
						console.warn(
							'[Supabase Auth] ⚠️ Invalid refresh token detected (400) - clearing tokens'
						);
						try {
							localStorage.removeItem('supabase.auth.token');
							localStorage.removeItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
						} catch (clearError) {
							console.error('[Supabase Auth] Error clearing localStorage:', clearError);
						}
						// Возвращаем успешный ответ с пустой сессией вместо ошибки
						return new Response(
							JSON.stringify({ access_token: null, refresh_token: null, expires_in: 0 }),
							{ status: 200, headers: { 'Content-Type': 'application/json' } }
						);
					}
				} catch {
					// Если не удалось распарсить JSON, все равно очищаем токены
					console.warn('[Supabase Auth] ⚠️ 400 error on refresh token - clearing tokens');
					try {
						localStorage.removeItem('supabase.auth.token');
						localStorage.removeItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
					} catch (clearError) {
						console.error('[Supabase Auth] Error clearing localStorage:', clearError);
					}
				}
			}

			return response;
		} catch (error: any) {
			// Перехватываем сетевые ошибки
			if (
				error?.message?.includes('Invalid Refresh Token') ||
				error?.message?.includes('Refresh Token Not Found')
			) {
				console.warn(
					'[Supabase Auth] ⚠️ Invalid refresh token detected (network error) - clearing tokens'
				);
				try {
					localStorage.removeItem('supabase.auth.token');
					localStorage.removeItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
				} catch (clearError) {
					console.error('[Supabase Auth] Error clearing localStorage:', clearError);
				}
			}
			throw error;
		}
	}

	// Для всех остальных запросов используем оригинальный fetch
	return originalFetch(...args);
};

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

	// ✅ FIX: Handle SIGNED_OUT event to clear invalid tokens
	if (event === 'SIGNED_OUT') {
		console.log('[Supabase Auth] 🚪 User signed out');
		// Clear any cached data if needed
		try {
			localStorage.removeItem('supabase.auth.token');
			localStorage.removeItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
		} catch (error) {
			console.error('[Supabase Auth] Error clearing localStorage on sign out:', error);
		}
	}

	if (event === 'USER_UPDATED') {
		console.log('[Supabase Auth] 🔄 User updated');
	}
});

// ✅ FIX: Singleton pattern - всегда возвращаем один и тот же экземпляр
// Это предотвращает создание множественных GoTrueClient instances
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
	// Если экземпляр уже создан, возвращаем его
	if (clientInstance) {
		return clientInstance;
	}

	// Иначе используем основной singleton
	clientInstance = supabase;
	return clientInstance;
}
