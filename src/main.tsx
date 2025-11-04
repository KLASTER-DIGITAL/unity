import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ ПРИНУДИТЕЛЬНАЯ ОЧИСТКА КЕША при обновлении версии
const APP_VERSION = '2.0.1';
const STORED_VERSION = localStorage.getItem('app_version');

if (STORED_VERSION !== APP_VERSION) {
	console.log(`[PWA] Version changed: ${STORED_VERSION} → ${APP_VERSION}. Clearing cache...`);

	// Очистить все кеши
	if ('caches' in window) {
		caches.keys().then((names) => {
			names.forEach((name) => {
				console.log('[PWA] Deleting cache:', name);
				caches.delete(name);
			});
		});
	}

	// Удалить Service Worker и перезагрузить
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			registrations.forEach((registration) => {
				console.log('[PWA] Unregistering Service Worker:', registration);
				registration.unregister();
			});

			// Сохранить новую версию и перезагрузить страницу
			localStorage.setItem('app_version', APP_VERSION);
			console.log('[PWA] Reloading page with new version...');
			window.location.reload();
		});
	} else {
		localStorage.setItem('app_version', APP_VERSION);
		window.location.reload();
	}
} else {
	// ✅ PWA: Регистрация Service Worker (ТОЛЬКО в production)
	// В dev режиме Service Worker вызывает ошибки из-за динамической обработки файлов Vite
	if ('serviceWorker' in navigator && import.meta.env.PROD) {
		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('✅ [PWA] Service Worker registered:', registration.scope);
				})
				.catch((error) => {
					console.error('❌ [PWA] Service Worker registration failed:', error);
				});
		});
	}
}

// ✅ LAZY LOADING: Sentry загружается асинхронно для уменьшения initial bundle на ~83 KB
// Инициализация происходит после первого рендера приложения
if (import.meta.env.PROD) {
	// Используем requestIdleCallback для инициализации Sentry в idle time
	const initSentryLazy = () => {
		import('@/shared/lib/monitoring')
			.then(({ initSentry }) => {
				initSentry();
				console.log('✅ [Sentry] Lazy loaded and initialized');
			})
			.catch((err) => {
				console.error('❌ [Sentry] Failed to lazy load:', err);
			});

		import('@/shared/lib/performance')
			.then(({ initSentryPerformanceIntegration }) => {
				initSentryPerformanceIntegration();
				console.log('✅ [Sentry Performance] Lazy loaded and initialized');
			})
			.catch((err) => {
				console.error('❌ [Sentry Performance] Failed to lazy load:', err);
			});
	};

	// Инициализируем Sentry в idle time или через 2 секунды (что наступит раньше)
	if ('requestIdleCallback' in window) {
		requestIdleCallback(initSentryLazy, { timeout: 2000 });
	} else {
		setTimeout(initSentryLazy, 2000);
	}
} else {
	console.log('ℹ️ [Sentry] Disabled in development');
}

// Обработка ошибок preload для предотвращения белого экрана
window.addEventListener('vite:preloadError', (event) => {
	console.error('Vite preload error:', event);
	// Перезагружаем страницу при ошибке загрузки модулей
	window.location.reload();
});

// Обработка ошибок загрузки модулей
window.addEventListener('error', (event) => {
	if (event.error?.message?.includes('Loading chunk')) {
		console.error('Chunk loading error:', event.error);
		window.location.reload();
	}
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
	console.error('Unhandled promise rejection:', event.reason);
	// Не перезагружаем страницу для промисов, только логируем
});

createRoot(document.getElementById('root')!).render(<App />);
