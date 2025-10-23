import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Database } from 'lucide-react';
import { CacheManager } from '@/components/screens/admin/settings/CacheManager';

export function PWACache() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Cache Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление кэшем Service Worker
          </p>
        </div>
      </div>

      {/* Cache Manager */}
      <CacheManager />
    </div>
  );
}

