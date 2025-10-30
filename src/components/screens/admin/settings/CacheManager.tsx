/**
 * Cache Manager Component
 * 
 * Admin panel component for managing Service Worker caches.
 * Shows cache statistics and provides controls for invalidation.
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Database, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {

  clearCache,
  clearAllCaches,
  invalidateAPICache,
  formatCacheSize,
  getCacheStats,
  type CacheInfo
} from '@/shared/lib/cache/cacheManager';
import { toast } from 'sonner';

export function CacheManager() {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [stats, setStats] = useState({
    totalCaches: 0,
    totalEntries: 0,
    totalSize: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState<string | null>(null);

  // Load cache stats
  const loadCacheStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setCaches(cacheStats.caches);
      setStats({
        totalCaches: cacheStats.totalCaches,
        totalEntries: cacheStats.totalEntries,
        totalSize: cacheStats.totalSize
      });
    } catch (error) {
      console.error('[CacheManager] Failed to load cache stats:', error);
      toast.error('Ошибка загрузки статистики кэша');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

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
    if (!confirm('Вы уверены? Это очистит ВСЕ кэши приложения.')) {
      return;
    }

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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Всего кэшей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCaches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Всего записей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Размер кэша
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCacheSize(stats.totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Управление кэшами приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={loadCacheStats}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить статистику
            </Button>

            <Button
              onClick={handleInvalidateAPICache}
              disabled={isClearing === 'api'}
              variant="outline"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Инвалидировать API кэш
            </Button>

            <Button
              onClick={handleClearAllCaches}
              disabled={isClearing === 'all'}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить все кэши
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            💡 <strong>Stale-While-Revalidate:</strong> API запросы возвращают кэш мгновенно и обновляются в фоне.
            TTL: API 5 мин, статика 24 часа, изображения 7 дней.
          </p>
        </CardContent>
      </Card>

      {/* Cache List */}
      <Card>
        <CardHeader>
          <CardTitle>Список кэшей</CardTitle>
          <CardDescription>
            Детальная информация о каждом кэше
          </CardDescription>
        </CardHeader>
        <CardContent>
          {caches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Нет активных кэшей</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Кэши будут созданы автоматически при первом использовании PWA.
                Service Worker начнёт кэшировать ресурсы после установки.
              </p>
              <Button
                onClick={loadCacheStats}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {caches.map((cache) => (
                <div
                  key={cache.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{cache.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {cache.entries} записей • {formatCacheSize(cache.size)}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleClearCache(cache.name)}
                    disabled={isClearing === cache.name}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
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
          <CardDescription>
            Как работает кэширование в приложении
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🔄 Stale-While-Revalidate (API)</h4>
              <p className="text-sm text-muted-foreground">
                API запросы возвращают кэш мгновенно, затем обновляются в фоне.
                Если кэш устарел (TTL 5 мин), ждем сетевой запрос.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">📦 Cache-First (Статика)</h4>
              <p className="text-sm text-muted-foreground">
                Статические файлы (CSS, JS, изображения) берутся из кэша.
                Обновляются только при истечении TTL или ручной инвалидации.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">🌐 Network-First (HTML)</h4>
              <p className="text-sm text-muted-foreground">
                HTML страницы всегда загружаются из сети.
                Кэш используется только при отсутствии соединения.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

