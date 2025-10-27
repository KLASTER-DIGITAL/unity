/**
 * Babel configuration for React Native Expo
 * 
 * Поддержка:
 * - Expo preset
 * - TypeScript path aliases
 * - React Native Reanimated
 * - Platform-specific code
 */

module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
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

