import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { TranslationStats } from './types';

type StatsCardsProps = {
  stats: TranslationStats;
};

/**
 * Stats Cards Component
 * Displays translation statistics in card format
 */
export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-normal text-muted-foreground text-sm">Всего ключей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-2xl">{stats.totalKeys}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-normal text-muted-foreground text-sm">Переводов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-2xl">{stats.totalTranslations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-normal text-muted-foreground text-sm">Пропущено</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-2xl text-destructive">{stats.missingCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-normal text-muted-foreground text-sm">Полнота</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-2xl text-accent">{stats.completeness}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
