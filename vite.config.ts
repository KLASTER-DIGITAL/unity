
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/unity/' : '/',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      // Figma assets
      'figma:asset/fcf7bda2bc5cf545d6d545c7042de6d122912d16.png': path.resolve(__dirname, './src/assets/fcf7bda2bc5cf545d6d545c7042de6d122912d16.png'),
      'figma:asset/f48e377c0fcf558b97c231da78042faf188b1434.png': path.resolve(__dirname, './src/assets/f48e377c0fcf558b97c231da78042faf188b1434.png'),
      'figma:asset/e1bf67a0bc286419100543f7db5357cc81e2982f.png': path.resolve(__dirname, './src/assets/e1bf67a0bc286419100543f7db5357cc81e2982f.png'),
      'figma:asset/e006c6a01653e356a02cfba3753d730d262bdb9f.png': path.resolve(__dirname, './src/assets/e006c6a01653e356a02cfba3753d730d262bdb9f.png'),
      'figma:asset/c1e2c1fcaac39561517810b80632d4db4c5f6233.png': path.resolve(__dirname, './src/assets/c1e2c1fcaac39561517810b80632d4db4c5f6233.png'),
      'figma:asset/bd383d77e5f7766d755b15559de65d5ccfa62e27.png': path.resolve(__dirname, './src/assets/bd383d77e5f7766d755b15559de65d5ccfa62e27.png'),
      'figma:asset/bbacbe45760530f87ab791097144e6fe9bbe34f5.png': path.resolve(__dirname, './src/assets/bbacbe45760530f87ab791097144e6fe9bbe34f5.png'),
      'figma:asset/b2002b38b2d924feb3019b5bff762c3474b4177f.png': path.resolve(__dirname, './src/assets/b2002b38b2d924feb3019b5bff762c3474b4177f.png'),
      'figma:asset/a1915e0b173ceec2fe20f3b00950a974f9e187c2.png': path.resolve(__dirname, './src/assets/a1915e0b173ceec2fe20f3b00950a974f9e187c2.png'),
      'figma:asset/958cd222afa9d90cf839e3ffc1f20931f7b16c91.png': path.resolve(__dirname, './src/assets/958cd222afa9d90cf839e3ffc1f20931f7b16c91.png'),
      'figma:asset/8426669a5b89fa50e47ff55f7fe04ef644f3a410.png': path.resolve(__dirname, './src/assets/8426669a5b89fa50e47ff55f7fe04ef644f3a410.png'),
      'figma:asset/78d9c3a031dfb1675f631c641d0528b868cf502e.png': path.resolve(__dirname, './src/assets/78d9c3a031dfb1675f631c641d0528b868cf502e.png'),
      'figma:asset/736016e166046f272f78e1138e2ad74ea8cc8e58.png': path.resolve(__dirname, './src/assets/736016e166046f272f78e1138e2ad74ea8cc8e58.png'),
      'figma:asset/72da5d113b90b9d00183dfa3c75107849e1f4759.png': path.resolve(__dirname, './src/assets/72da5d113b90b9d00183dfa3c75107849e1f4759.png'),
      'figma:asset/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.png': path.resolve(__dirname, './src/assets/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.png'),
      'figma:asset/61ee1b938078bdee53664108367ad387382ae647.png': path.resolve(__dirname, './src/assets/61ee1b938078bdee53664108367ad387382ae647.png'),
      'figma:asset/609655ca0da0377eccc6f25de2c4d7e1d652296b.png': path.resolve(__dirname, './src/assets/609655ca0da0377eccc6f25de2c4d7e1d652296b.png'),
      'figma:asset/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png': path.resolve(__dirname, './src/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png'),
      'figma:asset/36ea1460940abc3502be382c9fa5f04faf7d01cf.png': path.resolve(__dirname, './src/assets/36ea1460940abc3502be382c9fa5f04faf7d01cf.png'),
      'figma:asset/03eee47db01accd8ec132e41a8b23825a0fe0ef4.png': path.resolve(__dirname, './src/assets/03eee47db01accd8ec132e41a8b23825a0fe0ef4.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    sourcemap: false, // Отключаем sourcemap для production
    minify: 'esbuild', // Используем esbuild вместо terser
    rollupOptions: {
      output: {
        manualChunks: undefined, // Отключаем разделение на чанки для исправления проблемы с порядком загрузки
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
  },
});