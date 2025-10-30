// Expo app configuration with environment variables support
// This file is used instead of app.json to enable dynamic env loading

// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  expo: {
    name: 'UNITY - Дневник достижений',
    slug: 'unity',
    version: '2.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'unity',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#007AFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.unity.diary',
      infoPlist: {
        NSCameraUsageDescription: 'UNITY использует камеру для добавления фото к достижениям',
        NSPhotoLibraryUsageDescription:
          'UNITY использует галерею для добавления фото к достижениям',
        NSMicrophoneUsageDescription: 'UNITY использует микрофон для записи голосовых заметок',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.unity.diary',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'RECORD_AUDIO'],
    },
    web: {
      bundler: 'metro',
    },
    plugins: ['expo-router', 'expo-font', 'expo-sqlite'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      // Environment variables for cross-platform access
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN,
      VITE_APP_VERSION: process.env.VITE_APP_VERSION,
    },
  },
};
