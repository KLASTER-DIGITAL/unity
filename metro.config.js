/**
 * Metro configuration for React Native Expo
 * 
 * Настройка Metro bundler для поддержки:
 * - Web и Native платформ
 * - TypeScript path aliases (@/*)
 * - Platform-specific extensions (.web.tsx, .native.tsx)
 * - Vite-совместимый asset handling
 */

const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ============================================================================
// RESOLVER CONFIGURATION
// ============================================================================

config.resolver = {
  ...config.resolver,
  
  // Platform-specific extensions (порядок важен!)
  sourceExts: [
    'expo.tsx',
    'expo.ts',
    'expo.jsx',
    'expo.js',
    'native.tsx',
    'native.ts',
    'native.jsx',
    'native.js',
    'web.tsx',
    'web.ts',
    'web.jsx',
    'web.js',
    'tsx',
    'ts',
    'jsx',
    'js',
    'json',
  ],
  
  // Asset extensions
  assetExts: [
    ...config.resolver.assetExts,
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif',
    'svg',
    'ttf',
    'otf',
    'woff',
    'woff2',
  ],
  
  // TypeScript path aliases
  extraNodeModules: {
    '@': path.resolve(__dirname, 'src'),
    '@/app': path.resolve(__dirname, 'src/app'),
    '@/features': path.resolve(__dirname, 'src/features'),
    '@/shared': path.resolve(__dirname, 'src/shared'),
  },
};

// ============================================================================
// TRANSFORMER CONFIGURATION
// ============================================================================

config.transformer = {
  ...config.transformer,
  
  // Babel transformer
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  
  // Asset plugins
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Minifier
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    ecma: 8,
    keep_classnames: true,
    keep_fnames: true,
    module: true,
    mangle: {
      module: true,
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// ============================================================================
// WATCHER CONFIGURATION
// ============================================================================

config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'node_modules'),
];

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

config.server = {
  ...config.server,
  port: 8081,
};

module.exports = config;

