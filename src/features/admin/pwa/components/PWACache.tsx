import { Database } from 'lucide-react';
import { CacheManager } from '@/components/screens/admin/settings/CacheManager';

export function PWACache() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <Database className="h-6 w-6" />
            Cache Management
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">Управление кэшем Service Worker</p>
        </div>
      </div>

      {/* Cache Manager */}
      <CacheManager />
    </div>
  );
}
