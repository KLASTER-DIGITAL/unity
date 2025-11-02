import { RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * Компонент показывает уведомление когда доступно обновление приложения
 */
export function PWAUpdatePrompt() {
	const [showUpdate, setShowUpdate] = useState(false);
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
			// Если есть ожидающий Service Worker
			if (registration.waiting) {
				console.log('[PWA Update] Waiting worker found, auto-updating...');
				setWaitingWorker(registration.waiting);
				// ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ БЕЗ ЗАПРОСА
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
				setShowUpdate(true);
			}

			// Слушаем изменения состояния
			if (registration.installing) {
				registration.installing.addEventListener('statechange', (e) => {
					const sw = e.target as ServiceWorker;
					if (sw.state === 'installed' && navigator.serviceWorker.controller) {
						console.log('[PWA Update] New worker installed, auto-updating...');
						setWaitingWorker(sw);
						// ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ БЕЗ ЗАПРОСА
						sw.postMessage({ type: 'SKIP_WAITING' });
						setShowUpdate(true);
					}
				});
			}
		};

		// Проверяем существующую регистрацию
		navigator.serviceWorker.getRegistration().then((registration) => {
			if (registration) {
				handleServiceWorkerUpdate(registration);

				// Проверяем обновления каждые 60 секунд
				setInterval(() => {
					registration.update();
				}, 60_000);
			}
		});

		// Слушаем событие обновления контроллера
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			console.log('[PWA Update] Controller changed, reloading page...');
			if (!isUpdating) {
				console.log('[PWA Update] Reloading page (not in update state)');
				window.location.reload();
			} else {
				console.log('[PWA Update] Reloading page (in update state)');
				window.location.reload();
			}
		});
	}, [isUpdating]);

	const handleUpdate = () => {
		if (!waitingWorker) {
			console.error('[PWA Update] No waiting worker available');
			return;
		}

		console.log('[PWA Update] Starting update process...');
		setIsUpdating(true);

		// Отправляем сообщение новому Service Worker для активации
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });
		console.log('[PWA Update] SKIP_WAITING message sent to Service Worker');

		// Fallback: если controllerchange не сработает в течение 3 секунд, перезагружаем принудительно
		setTimeout(() => {
			console.log('[PWA Update] Timeout reached, forcing reload...');
			window.location.reload();
		}, 3000);

		// НЕ закрываем окно сразу - ждем controllerchange события
		// setShowUpdate(false); - убрано, окно закроется после перезагрузки
	};

	const handleSkip = () => {
		setShowUpdate(false);
	};

	return (
		<AnimatePresence>
			{showUpdate && (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="-translate-x-1/2 fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
					exit={{ opacity: 0, y: 100 }}
					initial={{ opacity: 0, y: 100 }}
				>
					<div className="rounded-xl border border-border bg-card p-4 shadow-2xl">
						<div className="flex items-start gap-3">
							<div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
								<RefreshCw className="h-5 w-5 text-accent" />
							</div>

							<div className="flex-1">
								<h3 className="mb-1 font-semibold! text-[15px]! text-foreground">
									Доступно обновление
								</h3>
								<p className="mb-3 font-normal! text-[13px]! text-muted-foreground">
									Новая версия приложения готова к установке
								</p>

								<div className="flex gap-2">
									<button
										className="flex-1 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-all hover:bg-accent/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
										disabled={isUpdating}
										onClick={handleUpdate}
										type="button"
									>
										<span className="font-semibold! text-[13px]!">
											{isUpdating ? 'Обновление...' : 'Обновить'}
										</span>
									</button>
									<button
										className="px-3 text-muted-foreground transition-colors hover:text-foreground"
										onClick={handleSkip}
										type="button"
									>
										<X className="h-5 w-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
export default PWAUpdatePrompt;
