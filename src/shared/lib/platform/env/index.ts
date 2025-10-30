/**
 * Environment Variables Platform Adapter
 *
 * Provides unified access to environment variables across PWA and React Native.
 *
 * PWA (Vite): Uses import.meta.env
 * React Native (Expo): Uses process.env with EXPO_PUBLIC_ prefix
 *
 * @see https://docs.expo.dev/guides/environment-variables/
 */

export type EnvConfig = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SENTRY_DSN?: string;
  APP_VERSION?: string;
};

/**
 * Get environment variable value
 *
 * PWA: import.meta.env.VITE_*
 * React Native: process.env.EXPO_PUBLIC_*
 */
function getEnvVar(key: string, fallback?: string): string | undefined {
  // Check if we're in a browser environment (PWA)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // PWA: Use import.meta.env (Vite)
    const viteKey = `VITE_${key}`;
    return import.meta?.env?.[viteKey] || fallback;
  }

  // React Native: Use process.env with EXPO_PUBLIC_ prefix
  const expoKey = `EXPO_PUBLIC_${key}`;
  return process.env[expoKey] || fallback;
}

/**
 * Environment configuration
 *
 * Automatically selects the correct environment variable source
 * based on the platform (PWA vs React Native)
 */
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('SUPABASE_URL', 'https://ecuwuzqlwdkkdncampnc.supabase.co') as string,

  SUPABASE_ANON_KEY: getEnvVar(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88'
  ) as string,

  SENTRY_DSN: getEnvVar('SENTRY_DSN'),

  APP_VERSION: getEnvVar('APP_VERSION', '2.0.0'),
};

/**
 * Validate environment configuration
 */
export function validateEnv(): boolean {
  const required: (keyof EnvConfig)[] = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  for (const key of required) {
    if (!env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      return false;
    }
  }

  return true;
}

// Validate on module load
if (!validateEnv()) {
  console.warn('⚠️ Some environment variables are missing. Using fallback values.');
}
