/**
 * Cache Manager Component
 *
 * Admin panel component for managing Service Worker caches.
 * Shows cache statistics and provides controls for invalidation.
 */

import { Database, HardDrive, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { DangerousActionDialog } from '@/shared/components/ui/DangerousActionDialog';
import {
	type CacheInfo,
	clearAllCaches,
	clearCache,
	formatCacheSize,
	getCacheStats,
	invalidateAPICache,
} from '@/shared/lib/cache/cacheManager';

export function CacheManager() {
	const [caches, setCaches] = useState<CacheInfo[]>([]);
	const [stats, setStats] = useState({
		totalCaches: 0,
		totalEntries: 0,
		totalSize: 0,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isClearing, setIsClearing] = useState<string | null>(null);
	const [showClearAllDialog, setShowClearAllDialog] = useState(false);

	// Load cache stats
	const loadCacheStats = useCallback(async () => {
		setIsLoading(true);
		try {
			const cacheStats = await getCacheStats();
			setCaches(cacheStats.caches);
			setStats({
				totalCaches: cacheStats.totalCaches,
				totalEntries: cacheStats.totalEntries,
				totalSize: cacheStats.totalSize,
			});
		} catch (error) {
			console.error('[CacheManager] Failed to load cache stats:', error);
			toast.error('Ошибка загрузки статистики кэша');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCacheStats();
	}, [loadCacheStats]);

	// Clear specific cache
	const handleClearCache = async (cacheName: string) => {
		setIsClearing(cacheName);
		try {
			const deleted = await clearCache(cacheName);
			if (deleted) {
				toast.success(`Кэш "${cacheName}" очищен`);
				await loadCacheStats();
			} else {
				toast.error(`Не удалось очистить кэш "${cacheName}"`);
			}
		} catch (error) {
			console.error('[CacheManager] Failed to clear cache:', error);
			toast.error('Ошибка очистки кэша');
		} finally {
			setIsClearing(null);
		}
	};

	// Clear all caches
	const handleClearAllCaches = async () => {
		setIsClearing('all');
		try {
			const deletedCount = await clearAllCaches();
			toast.success(`Очищено ${deletedCount} кэшей`);
			await loadCacheStats();
		} catch (error) {
			console.error('[CacheManager] Failed to clear all caches:', error);
			toast.error('Ошибка очистки всех кэшей');
		} finally {
			setIsClearing(null);
		}
	};

	// Invalidate API cache
	const handleInvalidateAPICache = async () => {
		setIsClearing('api');
		try {
			const deleted = await invalidateAPICache();
			if (deleted) {
				toast.success('API кэш инвалидирован');
				await loadCacheStats();
			} else {
				toast.info('API кэш уже пуст');
			}
		} catch (error) {
			console.error('[CacheManager] Failed to invalidate API cache:', error);
			toast.error('Ошибка инвалидации API кэша');
		} finally {
			setIsClearing(null);
		}
	};

	return (
		<>
			<div className="space-y-6">
			{/* Statistics Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Database className="h-4 w-4" />
							Всего кэшей
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.totalCaches}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<HardDrive className="h-4 w-4" />
							Всего записей
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.totalEntries}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<HardDrive className="h-4 w-4" />
							Размер кэша
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{formatCacheSize(stats.totalSize)}</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Быстрые действия</CardTitle>
					<CardDescription>Управление кэшами приложения</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-wrap gap-3">
						<Button disabled={isLoading} onClick={loadCacheStats} variant="outline">
							<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
							Обновить статистику
						</Button>

						<Button
							disabled={isClearing === 'api'}
							onClick={handleInvalidateAPICache}
							variant="outline"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Инвалидировать API кэш
						</Button>

						<Button
							disabled={isClearing === 'all'}
							onClick={() => setShowClearAllDialog(true)}
							variant="destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Очистить все кэши
						</Button>
					</div>

					<p className="text-muted-foreground text-sm">
						💡 <strong>Stale-While-Revalidate:</strong> API запросы возвращают кэш мгновенно и
						обновляются в фоне. TTL: API 5 мин, статика 24 часа, изображения 7 дней.
					</p>
				</CardContent>
			</Card>

			{/* Cache List */}
			<Card>
				<CardHeader>
					<CardTitle>Список кэшей</CardTitle>
					<CardDescription>Детальная информация о каждом кэше</CardDescription>
				</CardHeader>
				<CardContent>
					{caches.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Database className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
							<h3 className="mb-2 font-semibold text-lg">Нет активных кэшей</h3>
							<p className="mb-4 max-w-md text-center text-muted-foreground text-sm">
								Кэши будут созданы автоматически при первом использовании PWA. Service Worker начнёт
								кэшировать ресурсы после установки.
							</p>
							<Button disabled={isLoading} onClick={loadCacheStats} size="sm" variant="outline">
								<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								Обновить
							</Button>
						</div>
					) : (
						<div className="space-y-3">
							{caches.map((cache) => (
								<div
									className="flex items-center justify-between rounded-lg border p-4"
									key={cache.name}
								>
									<div className="flex-1">
										<div className="font-medium">{cache.name}</div>
										<div className="text-muted-foreground text-sm">
											{cache.entries} записей • {formatCacheSize(cache.size)}
										</div>
									</div>

									<Button
										disabled={isClearing === cache.name}
										onClick={() => handleClearCache(cache.name)}
										size="sm"
										variant="outline"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Очистить
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Cache Strategy Info */}
			<Card>
				<CardHeader>
					<CardTitle>Стратегии кэширования</CardTitle>
					<CardDescription>Как работает кэширование в приложении</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<h4 className="mb-2 font-medium">🔄 Stale-While-Revalidate (API)</h4>
							<p className="text-muted-foreground text-sm">
								API запросы возвращают кэш мгновенно, затем обновляются в фоне. Если кэш устарел
								(TTL 5 мин), ждем сетевой запрос.
							</p>
						</div>

						<div>
							<h4 className="mb-2 font-medium">📦 Cache-First (Статика)</h4>
							<p className="text-muted-foreground text-sm">
								Статические файлы (CSS, JS, изображения) берутся из кэша. Обновляются только при
								истечении TTL или ручной инвалидации.
							</p>
						</div>

						<div>
							<h4 className="mb-2 font-medium">🌐 Network-First (HTML)</h4>
							<p className="text-muted-foreground text-sm">
								HTML страницы всегда загружаются из сети. Кэш используется только при отсутствии
								соединения.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<DangerousActionDialog
			open={showClearAllDialog}
			onOpenChange={setShowClearAllDialog}
			onConfirm={handleClearAllCaches}
			title="Очистить все кэши?"
			description={
				<>
					<p className="font-semibold text-destructive">⚠️ Это очистит ВСЕ кэши приложения!</p>
					<p>После очистки приложение может работать медленнее до повторного кэширования данных.</p>
				</>
			}
			confirmButtonText="Очистить все"
		/>
	</>
);
}
