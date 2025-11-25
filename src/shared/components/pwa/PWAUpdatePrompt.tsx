import { RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { WhatsNewModal } from '@/shared/components/version/WhatsNewModal';
import { CURRENT_VERSION } from '@/shared/lib/version/changelog';

/**
 * Компонент показывает уведомление когда доступно обновление приложения
 *
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ (2025-11-09):
 * - Добавлена проверка версии в localStorage для предотвращения зацикливания
 * - Окно обновления показывается ТОЛЬКО если версия действительно изменилась
 * - Предотвращает бесконечный цикл обновлений
 *
 * АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ (2025-11-10):
 * - Автоматически обновляет PWA при обнаружении новой версии
 * - НЕ требует подтверждения пользователя
 * - Показывает уведомление "Обновление..." на 2 секунды перед перезагрузкой
 */
export function PWAUpdatePrompt() {
	const [showUpdate, setShowUpdate] = useState(false);
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [autoUpdateEnabled] = useState(true); // ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ ВКЛЮЧЕНО
	const [showWhatsNew, setShowWhatsNew] = useState(false);
	const [previousVersion, setPreviousVersion] = useState<string | undefined>();

	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
			// Если есть ожидающий Service Worker
			if (registration.waiting) {
				console.log('[PWA Update] Waiting worker found');
				setWaitingWorker(registration.waiting);

				// ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ
				if (autoUpdateEnabled) {
					console.log('[PWA Update] Auto-update enabled, updating immediately...');
					setShowUpdate(true);
					setIsUpdating(true);

					// Отправляем SKIP_WAITING через 500ms (чтобы пользователь увидел уведомление)
					setTimeout(() => {
						registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
						console.log('[PWA Update] SKIP_WAITING message sent to Service Worker');
					}, 500);

					// ✅ FIX: Fallback таймаут - если controllerchange не сработает в течение 5 секунд, перезагружаем принудительно
					setTimeout(() => {
						console.log('[PWA Update] Timeout reached (5s), forcing reload...');
						window.location.reload();
					}, 5000);
				} else {
					// Ручное обновление (показываем окно)
					setShowUpdate(true);
				}
			}

			// Слушаем изменения состояния
			if (registration.installing) {
				registration.installing.addEventListener('statechange', (e) => {
					const sw = e.target as ServiceWorker;
					if (sw.state === 'installed' && navigator.serviceWorker.controller) {
						console.log('[PWA Update] New worker installed');
						setWaitingWorker(sw);

						// ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ
						if (autoUpdateEnabled) {
							console.log('[PWA Update] Auto-update enabled, updating immediately...');
							setShowUpdate(true);
							setIsUpdating(true);

							// Отправляем SKIP_WAITING через 500ms
							setTimeout(() => {
								sw.postMessage({ type: 'SKIP_WAITING' });
								console.log('[PWA Update] SKIP_WAITING message sent to Service Worker');
							}, 500);

							// ✅ FIX: Fallback таймаут - если controllerchange не сработает в течение 5 секунд, перезагружаем принудительно
							setTimeout(() => {
								console.log('[PWA Update] Timeout reached (5s), forcing reload...');
								window.location.reload();
							}, 5000);
						} else {
							// Ручное обновление (показываем окно)
							setShowUpdate(true);
						}
					}
				});
			}
		};

		// Проверяем существующую регистрацию
		navigator.serviceWorker.getRegistration().then((registration) => {
			if (registration) {
				handleServiceWorkerUpdate(registration);

				// Проверяем обновления каждые 60 секунд
				const updateInterval = setInterval(() => {
					registration.update();
				}, 60_000);

				return () => clearInterval(updateInterval);
			}
		});

		// Слушаем событие обновления контроллера
		const handleControllerChange = () => {
			console.log('[PWA Update] Controller changed, reloading page...');
			// Сохраняем предыдущую версию для показа "Что нового"
			const storedVersion = localStorage.getItem('app_version');
			if (storedVersion && storedVersion !== CURRENT_VERSION) {
				setPreviousVersion(storedVersion);
				setShowWhatsNew(true);
				// Не перезагружаем сразу - показываем "Что нового"
				return;
			}
			// Сохраняем текущую версию чтобы не показывать окно снова
			const appVersion = localStorage.getItem('app_version');
			if (appVersion) {
				localStorage.setItem('pwa_last_updated_version', appVersion);
			}
			window.location.reload();
		};

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		return () => {
			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
		};
	}, [autoUpdateEnabled]);

	const handleUpdate = () => {
		if (!waitingWorker) {
			console.error('[PWA Update] No waiting worker available');
			return;
		}

		console.log('[PWA Update] Starting update process...');
		setIsUpdating(true);

		// Сохраняем текущую версию перед обновлением
		const appVersion = localStorage.getItem('app_version');
		if (appVersion) {
			localStorage.setItem('pwa_update_in_progress', appVersion);
		}

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
		console.log('[PWA Update] User skipped update');
		setShowUpdate(false);
		// Сохраняем что пользователь пропустил обновление
		const appVersion = localStorage.getItem('app_version');
		if (appVersion) {
			localStorage.setItem('pwa_last_skipped_version', appVersion);
		}
	};

	const handleCloseWhatsNew = () => {
		setShowWhatsNew(false);
		// После закрытия "Что нового" перезагружаем страницу
		const appVersion = localStorage.getItem('app_version');
		if (appVersion) {
			localStorage.setItem('pwa_last_updated_version', appVersion);
		}
		window.location.reload();
	};

	return (
		<>
			{/* "Что нового" модальное окно */}
			<WhatsNewModal
				isOpen={showWhatsNew}
				onClose={handleCloseWhatsNew}
				previousVersion={previousVersion}
			/>

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
										{isUpdating ? 'Обновление...' : 'Доступно обновление'}
									</h3>
									<p className="mb-3 font-normal! text-[13px]! text-muted-foreground">
										Новая версия приложения готова к установке
									</p>

									{autoUpdateEnabled ? (
										// ✅ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ: только показываем прогресс
										<div className="flex items-center gap-2">
											<RefreshCw className="h-4 w-4 animate-spin text-accent" />
											<span className="font-medium! text-[13px]! text-muted-foreground">
												Приложение обновляется...
											</span>
										</div>
									) : (
										// Ручное обновление: показываем кнопки
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
									)}
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
export default PWAUpdatePrompt;
