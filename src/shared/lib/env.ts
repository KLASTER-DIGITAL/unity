/**
 * Environment variables helper
 *
 * Provides cross-platform access to environment variables.
 * Works in both PWA (Vite) and React Native (Expo) environments.
 *
 * В PWA использует import.meta.env (Vite)
 * В React Native использует process.env (Expo)
 */

// Helper function to get environment variable
function getEnv(key: string): string | undefined {
	// Try process.env first (React Native / Expo)
	if (typeof process !== "undefined" && process.env) {
		return process.env[key];
	}

	// Fallback to undefined (will use default values)
	return;
}

// Environment mode
// __DEV__ is a React Native global, need to check if it exists for web compatibility
export const isDev =
	typeof __DEV__ !== "undefined" ? __DEV__ : import.meta.env.DEV;
export const isProd =
	typeof __DEV__ !== "undefined" ? !__DEV__ : import.meta.env.PROD;

// Supabase credentials
export const SUPABASE_URL =
	getEnv("VITE_SUPABASE_URL") || "https://ecuwuzqlwdkkdncampnc.supabase.co";
export const SUPABASE_ANON_KEY =
	getEnv("VITE_SUPABASE_ANON_KEY") ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88";

// Sentry
export const SENTRY_DSN = getEnv("VITE_SENTRY_DSN") || "";

// App version
export const APP_VERSION = getEnv("VITE_APP_VERSION") || "unknown";
export const BUILD_ID = getEnv("VITE_BUILD_ID") || "unknown";

// Mode
export const MODE = getEnv("MODE") || "production";
