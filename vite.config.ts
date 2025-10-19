
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/unity/' : '/',
  plugins: [
    react(),
    // Bundle analyzer для анализа размера (только при ANALYZE=true)
    ...(process.env.ANALYZE ? [
      visualizer({
        filename: 'build/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // treemap, sunburst, network
      })
    ] : []),
  ],
  // Оптимизация esbuild для production
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      // Figma assets - WebP optimized versions with PNG fallback
      'figma:asset/fcf7bda2bc5cf545d6d545c7042de6d122912d16.png': path.resolve(__dirname, './src/assets/fcf7bda2bc5cf545d6d545c7042de6d122912d16.webp'),
      'figma:asset/f48e377c0fcf558b97c231da78042faf188b1434.png': path.resolve(__dirname, './src/assets/f48e377c0fcf558b97c231da78042faf188b1434.webp'),
      'figma:asset/e1bf67a0bc286419100543f7db5357cc81e2982f.png': path.resolve(__dirname, './src/assets/e1bf67a0bc286419100543f7db5357cc81e2982f.webp'),
      'figma:asset/e006c6a01653e356a02cfba3753d730d262bdb9f.png': path.resolve(__dirname, './src/assets/e006c6a01653e356a02cfba3753d730d262bdb9f.webp'),
      'figma:asset/c1e2c1fcaac39561517810b80632d4db4c5f6233.png': path.resolve(__dirname, './src/assets/c1e2c1fcaac39561517810b80632d4db4c5f6233.webp'),
      'figma:asset/bd383d77e5f7766d755b15559de65d5ccfa62e27.png': path.resolve(__dirname, './src/assets/bd383d77e5f7766d755b15559de65d5ccfa62e27.webp'),
      'figma:asset/bbacbe45760530f87ab791097144e6fe9bbe34f5.png': path.resolve(__dirname, './src/assets/bbacbe45760530f87ab791097144e6fe9bbe34f5.webp'),
      'figma:asset/b2002b38b2d924feb3019b5bff762c3474b4177f.png': path.resolve(__dirname, './src/assets/b2002b38b2d924feb3019b5bff762c3474b4177f.webp'),
      'figma:asset/a1915e0b173ceec2fe20f3b00950a974f9e187c2.png': path.resolve(__dirname, './src/assets/a1915e0b173ceec2fe20f3b00950a974f9e187c2.webp'),
      'figma:asset/958cd222afa9d90cf839e3ffc1f20931f7b16c91.png': path.resolve(__dirname, './src/assets/958cd222afa9d90cf839e3ffc1f20931f7b16c91.webp'),
      'figma:asset/8426669a5b89fa50e47ff55f7fe04ef644f3a410.png': path.resolve(__dirname, './src/assets/8426669a5b89fa50e47ff55f7fe04ef644f3a410.webp'),
      'figma:asset/78d9c3a031dfb1675f631c641d0528b868cf502e.png': path.resolve(__dirname, './src/assets/78d9c3a031dfb1675f631c641d0528b868cf502e.webp'),
      'figma:asset/736016e166046f272f78e1138e2ad74ea8cc8e58.png': path.resolve(__dirname, './src/assets/736016e166046f272f78e1138e2ad74ea8cc8e58.webp'),
      'figma:asset/72da5d113b90b9d00183dfa3c75107849e1f4759.png': path.resolve(__dirname, './src/assets/72da5d113b90b9d00183dfa3c75107849e1f4759.webp'),
      'figma:asset/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.png': path.resolve(__dirname, './src/assets/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.webp'),
      'figma:asset/61ee1b938078bdee53664108367ad387382ae647.png': path.resolve(__dirname, './src/assets/61ee1b938078bdee53664108367ad387382ae647.webp'),
      'figma:asset/609655ca0da0377eccc6f25de2c4d7e1d652296b.png': path.resolve(__dirname, './src/assets/609655ca0da0377eccc6f25de2c4d7e1d652296b.webp'),
      'figma:asset/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png': path.resolve(__dirname, './src/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp'),
      'figma:asset/36ea1460940abc3502be382c9fa5f04faf7d01cf.png': path.resolve(__dirname, './src/assets/36ea1460940abc3502be382c9fa5f04faf7d01cf.webp'),
      'figma:asset/03eee47db01accd8ec132e41a8b23825a0fe0ef4.png': path.resolve(__dirname, './src/assets/03eee47db01accd8ec132e41a8b23825a0fe0ef4.webp'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    sourcemap: false, // Отключаем sourcemap для production
    minify: 'esbuild', // Используем esbuild вместо terser
    cssCodeSplit: true, // Разделение CSS по chunks
    assetsInlineLimit: 4096, // Inline assets < 4kb
    chunkSizeWarningLimit: 1000, // Предупреждение для chunks > 1MB
    rollupOptions: {
      output: {
        // Настраиваем code splitting для оптимизации производительности
        manualChunks: (id) => {
          // Vendor chunks - внешние библиотеки
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul')) {
              return 'vendor-ui';
            }
            // Animation and icons
            if (id.includes('motion') || id.includes('sonner') || id.includes('lucide-react')) {
              return 'vendor-utils';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Supabase
            if (id.includes('@supabase') || id.includes('postgrest')) {
              return 'vendor-supabase';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }

          // App chunks - разделение по функциональности
          if (id.includes('src/app/mobile')) {
            return 'mobile-app';
          }
          if (id.includes('src/app/admin')) {
            return 'admin-app';
          }
          if (id.includes('src/features/mobile')) {
            return 'mobile-features';
          }
          if (id.includes('src/features/admin')) {
            return 'admin-features';
          }
          if (id.includes('src/shared/components')) {
            return 'shared-components';
          }
          if (id.includes('src/shared/lib')) {
            return 'shared-lib';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'motion',
      'lucide-react',
      'sonner',
    ],
    exclude: [
      // Исключаем большие библиотеки из pre-bundling
      'recharts',
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    // Оптимизация dev server
    hmr: {
      overlay: false, // Отключаем overlay для лучшей производительности
    },
    fs: {
      // Разрешаем доступ к файлам вне корня проекта
      allow: ['..'],
    },
  },
  // Предварительная загрузка модулей
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});