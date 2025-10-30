/**
 * Platform Environment Adapter
 * 
 * Provides unified access to environment variables across web and React Native.
 * 
 * Web: Uses import.meta.env (Vite)
 * React Native: Uses expo-constants
 */

// Web implementation (default)
export const env = {
	SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
	SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
	SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
	VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
	TELEGRAM_BOT_NAME: import.meta.env.VITE_TELEGRAM_BOT_NAME || '',
	OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
	DEEPGRAM_API_KEY: import.meta.env.VITE_DEEPGRAM_API_KEY || '',
	ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
	GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
	FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID || '',
	APPLE_CLIENT_ID: import.meta.env.VITE_APPLE_CLIENT_ID || '',
	YANDEX_CLIENT_ID: import.meta.env.VITE_YANDEX_CLIENT_ID || '',
	VK_APP_ID: import.meta.env.VITE_VK_APP_ID || '',
	NODE_ENV: import.meta.env.MODE || 'development',
	DEV: import.meta.env.DEV || false,
	PROD: import.meta.env.PROD || false,
};

export type Env = typeof env;

