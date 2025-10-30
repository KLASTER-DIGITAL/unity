import { AlertTriangle, CloudOff, RefreshCw, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useOfflineMode } from '@/shared/lib/offline';
import { SettingsRow, SettingsSection } from '../../SettingsRow';

type OfflineSettingsModalProps = {
	isOpen: boolean;
	onClose: () => void;
	t: any;
};

type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';

export function OfflineSettingsModal({ isOpen, onClose, t }: OfflineSettingsModalProps) {
	const { isOnline, pendingCount, syncInProgress, sync, clearOfflineData } = useOfflineMode();

	// Local state для настроек
	const [autoSync, setAutoSync] = useState(true);
	const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('server-wins');
	const [_cacheSizeLimit, setCacheSizeLimit] = useState(100); // MB - Reserved for future use

	// Load settings from localStorage
	useEffect(() => {
		if (isOpen) {
			const savedAutoSync = localStorage.getItem('offline_auto_sync');
			const savedStrategy = localStorage.getItem('offline_conflict_strategy');
			const savedCacheLimit = localStorage.getItem('offline_cache_limit');

			if (savedAutoSync !== null) {
				setAutoSync(savedAutoSync === 'true');
			}
			if (savedStrategy) {
				setConflictStrategy(savedStrategy as ConflictStrategy);
			}
			if (savedCacheLimit) {
				setCacheSizeLimit(Number.parseInt(savedCacheLimit, 10));
			}
		}
	}, [isOpen]);

	const handleAutoSyncChange = (checked: boolean) => {
		setAutoSync(checked);
		localStorage.setItem('offline_auto_sync', checked.toString());
	};

	const handleConflictStrategyChange = (strategy: ConflictStrategy) => {
		setConflictStrategy(strategy);
		localStorage.setItem('offline_conflict_strategy', strategy);
	};

	const handleManualSync = async () => {
		try {
			await sync();
			toast.success('Синхронизация завершена');
		} catch (error) {
			toast.error('Ошибка синхронизации');
			console.error('[OfflineSettings] Sync error:', error);
		}
	};

	const handleClearOfflineData = async () => {
		if (confirm('Вы уверены? Все несинхронизированные данные будут удалены.')) {
			try {
				await clearOfflineData();
				toast.success('Offline данные очищены');
			} catch (error) {
				toast.error('Ошибка очистки данных');
				console.error('[OfflineSettings] Clear error:', error);
			}
		}
	};

	const getConflictStrategyDescription = (strategy: ConflictStrategy) => {
		switch (strategy) {
			case 'server-wins':
				return 'Данные с сервера имеют приоритет';
			case 'client-wins':
				return 'Локальные данные имеют приоритет';
			case 'merge':
				return 'Автоматическое объединение данных';
			case 'manual':
				return 'Ручное разрешение конфликтов';
			default:
				return '';
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/50"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
						exit={{ opacity: 0, y: 100 }}
						initial={{ opacity: 0, y: 100 }}
					>
						{/* Header */}
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-responsive-sm">
								<CloudOff className="h-6 w-6 text-[var(--ios-purple)]" />
								<h3 className="text-foreground text-title-2">
									{t.offlineSettings || 'Настройки Offline'}
								</h3>
							</div>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10"
								onClick={onClose}
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						{/* Status */}
						<div className="mb-6 rounded-lg border border-border bg-accent/5 p-4">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-footnote text-muted-foreground">Статус подключения:</span>
								<span
									className={`font-semibold text-footnote ${isOnline ? 'text-green-600' : 'text-orange-600'}`}
								>
									{isOnline ? '🟢 Online' : '🔴 Offline'}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-footnote text-muted-foreground">Ожидают синхронизации:</span>
								<span className="font-semibold text-footnote text-foreground">
									{pendingCount} записей
								</span>
							</div>
						</div>

						{/* Auto Sync */}
						<SettingsSection title="Синхронизация">
							<SettingsRow
								description="Синхронизировать при появлении сети"
								icon={RefreshCw}
								iconBgColor="bg-[var(--ios-blue)]/10"
								iconColor="text-[var(--ios-blue)]"
								onSwitchChange={handleAutoSyncChange}
								rightElement="switch"
								switchChecked={autoSync}
								title="Автоматическая синхронизация"
							/>
						</SettingsSection>

						{/* Conflict Resolution */}
						<SettingsSection title="Разрешение конфликтов">
							<div className="space-y-2">
								{(['server-wins', 'client-wins', 'merge', 'manual'] as ConflictStrategy[]).map(
									(strategy) => (
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors ${
												conflictStrategy === strategy
													? 'border-[var(--ios-blue)] bg-[var(--ios-blue)]/5'
													: 'border-border hover:bg-accent/5'
											}`}
											key={strategy}
											onClick={() => handleConflictStrategyChange(strategy)}
										>
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2">
														{conflictStrategy === strategy && (
															<div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary transition-colors duration-300">
																<div className="h-2 w-2 rounded-full bg-primary-foreground transition-colors duration-300" />
															</div>
														)}
														<span className="font-medium text-footnote text-foreground">
															{strategy === 'server-wins' && 'Приоритет сервера'}
															{strategy === 'client-wins' && 'Приоритет клиента'}
															{strategy === 'merge' && 'Автоматическое слияние'}
															{strategy === 'manual' && 'Ручное разрешение'}
														</span>
													</div>
													<p className="mt-1 ml-6 text-caption-1 text-muted-foreground">
														{getConflictStrategyDescription(strategy)}
													</p>
												</div>
											</div>
										</button>
									)
								)}
							</div>
						</SettingsSection>

						{/* Actions */}
						<div className="mt-6 space-y-3">
							{/* Manual Sync */}
							<Button
								className="w-full"
								disabled={syncInProgress || pendingCount === 0}
								onClick={handleManualSync}
								variant="outline"
							>
								<RefreshCw className={`mr-2 h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
								{syncInProgress ? 'Синхронизация...' : `Синхронизировать сейчас (${pendingCount})`}
							</Button>

							{/* Clear Offline Data */}
							<Button
								className="w-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
								onClick={handleClearOfflineData}
								variant="outline"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Очистить offline данные
							</Button>
						</div>

						{/* Warning */}
						<div className="mt-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
							<div className="flex items-start gap-2">
								<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
								<p className="text-caption-1 text-orange-600">
									Offline режим использует локальное хранилище браузера. Не очищайте данные
									браузера, чтобы не потерять несинхронизированные записи.
								</p>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
