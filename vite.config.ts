import path from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type Plugin } from 'vite';

/**
 * ✅ PWA + React Native Architecture: Custom Vite Plugin
 * Блокирует ЛЮБЫЕ импорты react-native в PWA build
 * React Native код находится в /app/shared/ и обрабатывается Metro bundler
 */
function blockReactNativePlugin(): Plugin {
	return {
		name: 'block-react-native',
		enforce: 'pre', // Выполняется ДО других плагинов
		resolveId(source) {
			// Блокируем ЛЮБЫЕ импорты react-native
			if (
				source === 'react-native' ||
				source.startsWith('react-native/') ||
				source.startsWith('@react-native/') ||
				source.startsWith('expo-') ||
				source.startsWith('@react-navigation/')
			) {
				// Возвращаем пустой модуль вместо реального
				return '\0virtual:react-native-stub';
			}
			return null;
		},
		load(id) {
			// Возвращаем пустой модуль для заблокированных импортов
			if (id === '\0virtual:react-native-stub') {
				return 'export default {};';
			}
			return null;
		},
	};
}

export default defineConfig(({ mode }) => ({
	base: '/',
	plugins: [
		// ✅ КРИТИЧЕСКИ ВАЖНО: blockReactNativePlugin ДОЛЖЕН быть ПЕРВЫМ
		// чтобы заблокировать react-native импорты ДО того как Vite попытается их парсить
		blockReactNativePlugin(),
		react(),
		// Bundle analyzer для анализа размера (только при ANALYZE=true)
		...(process.env.ANALYZE
			? [
					visualizer({
						filename: 'build/stats.html',
						open: true,
						gzipSize: true,
						brotliSize: true,
						template: 'treemap', // treemap, sunburst, network
					}),
				]
			: []),
		// Sentry plugin для загрузки source maps (только в production)
		...(mode === 'production'
			? [
					sentryVitePlugin({
						org: 'klaster-js',
						project: 'unity-v2',
						authToken: process.env.SENTRY_AUTH_TOKEN,
						sourcemaps: {
							assets: './build/assets/**',
							filesToDeleteAfterUpload: './build/assets/**/*.map',
						},
						release: {
							name: `unity-v2@${process.env.VITE_APP_VERSION || '2.0.0'}`,
						},
						telemetry: false,
					}),
				]
			: []),
	],
	// Оптимизация esbuild для production
	esbuild: {
		drop: mode === 'production' ? ['console', 'debugger'] : [],
		legalComments: 'none',
	},
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
		// ✅ КРИТИЧЕСКИ ВАЖНО: Дедупликация React для предотвращения Invalid Hook Call Error
		// Проблема: Vite может создать multiple React copies в dev mode
		// Решение: Принудительная дедупликация всех React модулей
		dedupe: [
			'react',
			'react-dom',
			'react/jsx-runtime',
			'react/jsx-dev-runtime',
			'react-dom/client',
			'react-dom/server',
		],
		alias: {
			// ✅ КРИТИЧЕСКИ ВАЖНО: Принудительно использовать React 18.3.1 из корневого node_modules
			// Проблема: @expo/cli содержит React 19.2.0-canary в node_modules/@expo/cli/static/canary-full/node_modules/react
			// Vite может случайно импортировать canary версию вместо 18.3.1
			// Решение: Явно указываем путь к React 18.3.1
			react: path.resolve(__dirname, './node_modules/react'),
			'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
			'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
			'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),

			// ✅ PWA + React Native Architecture: Alias react-native to react-native-web
			// Это позволяет использовать react-native-web для PWA build
			// вместо настоящего react-native (который требует React 19)
			'react-native': 'react-native-web',
			'@': path.resolve(__dirname, './src'),
			'@/pwa': path.resolve(__dirname, './src/pwa'),
			'@/features': path.resolve(__dirname, './src/features'),
			'@/shared': path.resolve(__dirname, './src/shared'),
			// Figma assets - WebP optimized versions with PNG fallback
			'figma:asset/fcf7bda2bc5cf545d6d545c7042de6d122912d16.png': path.resolve(
				__dirname,
				'./src/assets/fcf7bda2bc5cf545d6d545c7042de6d122912d16.webp'
			),
			'figma:asset/f48e377c0fcf558b97c231da78042faf188b1434.png': path.resolve(
				__dirname,
				'./src/assets/f48e377c0fcf558b97c231da78042faf188b1434.webp'
			),
			'figma:asset/e1bf67a0bc286419100543f7db5357cc81e2982f.png': path.resolve(
				__dirname,
				'./src/assets/e1bf67a0bc286419100543f7db5357cc81e2982f.webp'
			),
			'figma:asset/e006c6a01653e356a02cfba3753d730d262bdb9f.png': path.resolve(
				__dirname,
				'./src/assets/e006c6a01653e356a02cfba3753d730d262bdb9f.webp'
			),
			'figma:asset/c1e2c1fcaac39561517810b80632d4db4c5f6233.png': path.resolve(
				__dirname,
				'./src/assets/c1e2c1fcaac39561517810b80632d4db4c5f6233.webp'
			),
			'figma:asset/bd383d77e5f7766d755b15559de65d5ccfa62e27.png': path.resolve(
				__dirname,
				'./src/assets/bd383d77e5f7766d755b15559de65d5ccfa62e27.webp'
			),
			'figma:asset/bbacbe45760530f87ab791097144e6fe9bbe34f5.png': path.resolve(
				__dirname,
				'./src/assets/bbacbe45760530f87ab791097144e6fe9bbe34f5.webp'
			),
			'figma:asset/b2002b38b2d924feb3019b5bff762c3474b4177f.png': path.resolve(
				__dirname,
				'./src/assets/b2002b38b2d924feb3019b5bff762c3474b4177f.webp'
			),
			'figma:asset/a1915e0b173ceec2fe20f3b00950a974f9e187c2.png': path.resolve(
				__dirname,
				'./src/assets/a1915e0b173ceec2fe20f3b00950a974f9e187c2.webp'
			),
			'figma:asset/958cd222afa9d90cf839e3ffc1f20931f7b16c91.png': path.resolve(
				__dirname,
				'./src/assets/958cd222afa9d90cf839e3ffc1f20931f7b16c91.webp'
			),
			'figma:asset/8426669a5b89fa50e47ff55f7fe04ef644f3a410.png': path.resolve(
				__dirname,
				'./src/assets/8426669a5b89fa50e47ff55f7fe04ef644f3a410.webp'
			),
			'figma:asset/78d9c3a031dfb1675f631c641d0528b868cf502e.png': path.resolve(
				__dirname,
				'./src/assets/78d9c3a031dfb1675f631c641d0528b868cf502e.webp'
			),
			'figma:asset/736016e166046f272f78e1138e2ad74ea8cc8e58.png': path.resolve(
				__dirname,
				'./src/assets/736016e166046f272f78e1138e2ad74ea8cc8e58.webp'
			),
			'figma:asset/72da5d113b90b9d00183dfa3c75107849e1f4759.png': path.resolve(
				__dirname,
				'./src/assets/72da5d113b90b9d00183dfa3c75107849e1f4759.webp'
			),
			'figma:asset/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.png': path.resolve(
				__dirname,
				'./src/assets/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.webp'
			),
			'figma:asset/61ee1b938078bdee53664108367ad387382ae647.png': path.resolve(
				__dirname,
				'./src/assets/61ee1b938078bdee53664108367ad387382ae647.webp'
			),
			'figma:asset/609655ca0da0377eccc6f25de2c4d7e1d652296b.png': path.resolve(
				__dirname,
				'./src/assets/609655ca0da0377eccc6f25de2c4d7e1d652296b.webp'
			),
			'figma:asset/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png': path.resolve(
				__dirname,
				'./src/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp'
			),
			'figma:asset/36ea1460940abc3502be382c9fa5f04faf7d01cf.png': path.resolve(
				__dirname,
				'./src/assets/36ea1460940abc3502be382c9fa5f04faf7d01cf.webp'
			),
			'figma:asset/03eee47db01accd8ec132e41a8b23825a0fe0ef4.png': path.resolve(
				__dirname,
				'./src/assets/03eee47db01accd8ec132e41a8b23825a0fe0ef4.webp'
			),
		},
	},
	// SSR конфигурация для предотвращения парсинга react-native файлов
	ssr: {
		noExternal: [], // Пустой массив - не обрабатываем ничего в SSR
		external: ['react-native', 'expo', '@react-navigation'],
	},
	build: {
		target: 'esnext',
		outDir: 'build',
		sourcemap: mode === 'production' ? 'hidden' : false, // Hidden sourcemaps для Sentry (не доступны в браузере)
		minify: 'esbuild', // Используем esbuild вместо terser
		cssCodeSplit: true, // Разделение CSS по chunks
		assetsInlineLimit: 4096, // Inline assets < 4kb
		chunkSizeWarningLimit: 1000, // Предупреждение для chunks > 1MB
		rollupOptions: {
			// Externalize React Native и Expo модули для web build
			// Эти модули используются только в .native.ts файлах и будут tree-shaken
			external: [
				// React Native core
				/^react-native/,
				/^@react-native/,
				// Expo modules
				/^expo-/,
				'expo-file-system',
				'expo-image-manipulator',
				'expo-av',
				'expo-image-picker',
				'expo-speech',
				// React Navigation
				/^@react-navigation/,
				'@react-navigation/native',
			],
			output: {
				// Настраиваем code splitting для оптимизации производительности
				// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: chunking logic is intentionally exhaustive
				manualChunks: (id) => {
					// Vendor chunks - внешние библиотеки
					if (id.includes('node_modules')) {
						// Charts - отдельный чанк (большой размер ~200KB)
						if (id.includes('recharts') || id.includes('d3-')) {
							return 'vendor-charts';
						}

						// Supabase - отдельный чанк (~140KB)
						if (id.includes('@supabase') || id.includes('postgrest')) {
							return 'vendor-supabase';
						}

						// Framer Motion - отдельный чанк (~150KB)
						if (id.includes('framer-motion') || id.includes('motion')) {
							return 'vendor-motion';
						}

						// Lucide Icons - отдельный чанк (~100KB)
						if (id.includes('lucide-react')) {
							return 'vendor-icons';
						}

						// Radix UI - отдельный чанк (~200KB)
						if (id.includes('@radix-ui')) {
							return 'vendor-radix';
						}

						// Sentry - отдельный чанк (~414KB)
						// Разделяем на core и integrations для уменьшения initial load
						if (id.includes('@sentry/react')) {
							return 'vendor-sentry';
						}
						if (id.includes('@sentry/browser') || id.includes('@sentry/core')) {
							return 'vendor-sentry-core';
						}

						// Lottie - отдельный чанк (~308KB)
						if (id.includes('lottie-web')) {
							return 'vendor-lottie';
						}

						// Chart.js - отдельный чанк для admin dashboard
						if (id.includes('chart.js')) {
							return 'vendor-chartjs';
						}

						// ✅ КРИТИЧЕСКИ ВАЖНО: React и React-DOM ДОЛЖНЫ быть в ОДНОМ chunk
						// Проблема: Vite создает два разных chunks (chunk-QJTFJ6OV.js для React, chunk-YQ5BCTVV.js для React-DOM)
						// Это вызывает Invalid Hook Call Error из-за несинхронизированных копий
						// Решение: Принудительно объединяем React и React-DOM в один vendor-react chunk
						if (
							id.includes('node_modules/react/') ||
							id.includes('node_modules/react-dom/') ||
							id.includes('node_modules/scheduler/')
						) {
							return 'vendor-react';
						}

						// Остальные библиотеки НЕ группируем в vendor-misc
						// чтобы избежать circular dependencies
						return;
					}

					// НЕ используем manualChunks для app code
					// чтобы избежать circular dependencies
					// Vite автоматически разделит код оптимально
				},
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]',
			},
		},
	},
	// Оптимизация зависимостей
	optimizeDeps: {
		// ✅ КРИТИЧЕСКИ ВАЖНО: Принудительное включение React в один chunk
		// Проблема: Vite создает два разных chunks для React и React-DOM в dev mode
		// Решение: Принудительно включаем все React модули в optimizeDeps
		include: [
			'react',
			'react-dom',
			'react-dom/client',
			'react-dom/server',
			'react/jsx-runtime',
			'react/jsx-dev-runtime',
			'react/index.js',
			'react-dom/index.js',
			'@supabase/supabase-js',
			'motion',
			'lucide-react',
			'sonner',
		],
		exclude: [
			// Исключаем большие библиотеки из pre-bundling
			'recharts',
			// ✅ PWA + React Native Architecture: Исключаем ВСЕ React Native пакеты
			// Эти пакеты используются ТОЛЬКО в /app/shared/ и НЕ должны парситься Vite
			'react-native',
			'@react-native/virtualized-lists',
			'@react-native/assets-registry',
			'@react-native/normalize-colors',
			'@react-native/polyfills',
			'expo-file-system',
			'expo-image-manipulator',
			'expo-av',
			'expo-image-picker',
			'expo-speech',
			'@react-navigation/native',
		],
		esbuildOptions: {
			// ✅ КРИТИЧЕСКИ ВАЖНО: Принудительная дедупликация React через alias
			// Проблема: Vite может создать multiple React copies в dev mode
			// Решение: Принудительно указываем путь к React из корневого node_modules
			alias: {
				react: path.resolve(__dirname, './node_modules/react'),
				'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
				'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
				'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
			},
		},
		// ✅ КРИТИЧЕСКИ ВАЖНО: Синхронизация загрузки зависимостей
		// Проблема: Vite загружает зависимости асинхронно, что может создать multiple React copies
		// Решение: Принудительно ждем завершения сканирования всех зависимостей
		holdUntilCrawlEnd: true,
		// ✅ TEMP FIX: Отключаем force для стабильности (может вызывать проблемы с React chunks)
		// force: true,
	},
	server: {
		port: 3000,
		host: '0.0.0.0',
		// Автоматическое открытие браузера
		// Отключено в CI/Builder.io окружении (избегаем ошибки xdg-open ENOENT)
		// Включено локально для удобства разработки
		open: !process.env.CI && !process.env.BUILDER_IO,
		// Оптимизация dev server
		hmr: {
			overlay: false, // Отключаем overlay для лучшей производительности
			// protocol: 'ws', // Let Vite determine protocol
			// host: 'localhost', // Let Vite determine host
		},
		fs: {
			// Разрешаем доступ к файлам вне корня проекта
			allow: ['..'],
		},
		watch: {
			// Игнорируем React Native Expo папки и .native.tsx файлы
			ignored: [
				'**/node_modules/**',
				'**/app/**', // React Native Expo Router (НЕ src/app!)
				'**/index.js', // React Native entry point
				'**/.expo/**',
				'**/.expo-shared/**',
				'**/*.native.tsx', // React Native компоненты
				'**/*.native.ts', // React Native утилиты
			],
		},
	},
	// Предварительная загрузка модулей
	preview: {
		port: 4173,
		host: '0.0.0.0',
	},
}));
