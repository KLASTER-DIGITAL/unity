import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { AIRecommendation } from './types';

/**
 * Recommendations Card Component
 * Displays AI-generated recommendations for optimization
 */
type RecommendationsCardProps = {
  recommendations: AIRecommendation[];
};

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[17px]!">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Рекомендации
        </CardTitle>
        <CardDescription className="font-normal! text-[13px]!">
          Автоматические рекомендации по оптимизации
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="py-8 text-center text-[13px]! text-muted-foreground">
            Загрузите данные для получения рекомендаций
          </p>
        ) : (
          recommendations.map((rec, index) => (
            <Alert
              className={
                rec.type === 'success'
                  ? 'border-green-500/50 bg-green-500/10'
                  : rec.type === 'info'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : ''
              }
              key={index}
              variant={rec.type === 'warning' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold! text-[14px]!">
                {rec.title}
                {rec.impact && (
                  <Badge className="ml-2 text-[11px]!" variant="outline">
                    {rec.impact}
                  </Badge>
                )}
              </AlertTitle>
              <AlertDescription className="font-normal! text-[13px]!">
                {rec.description}
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}
