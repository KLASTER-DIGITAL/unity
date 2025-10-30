/**
 * Babel configuration for React Native Expo
 *
 * Поддержка:
 * - Expo preset
 * - TypeScript path aliases
 * - React Native Reanimated
 * - Platform-specific code
 */

module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Enable import.meta polyfill for React Native (Hermes)
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // TypeScript path aliases
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/app': './src/app',
            '@/features': './src/features',
            '@/shared': './src/shared',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.native.ts',
            '.web.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.native.tsx',
            '.web.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      // React Native Reanimated (должен быть последним!)
      'react-native-reanimated/plugin',
    ],
  };
};
