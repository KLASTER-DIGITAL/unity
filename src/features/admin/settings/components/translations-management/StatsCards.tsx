import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { TranslationStats } from './types';

interface StatsCardsProps {
  stats: TranslationStats;
}

/**
 * Stats Cards Component
 * Displays translation statistics in card format
 */
export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">Всего ключей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.totalKeys}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">Переводов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.totalTranslations}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">Пропущено</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-destructive">{stats.missingCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">Полнота</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-accent">{stats.completeness}%</div>
        </CardContent>
      </Card>
    </div>
  );
}

