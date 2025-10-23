import { Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { AIRecommendation } from "./types";

/**
 * Recommendations Card Component
 * Displays AI-generated recommendations for optimization
 */
interface RecommendationsCardProps {
  recommendations: AIRecommendation[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="!text-[17px] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI Рекомендации
        </CardTitle>
        <CardDescription className="!text-[13px] !font-normal">
          Автоматические рекомендации по оптимизации
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-center text-muted-foreground !text-[13px] py-8">
            Загрузите данные для получения рекомендаций
          </p>
        ) : (
          recommendations.map((rec, index) => (
            <Alert
              key={index}
              variant={rec.type === 'warning' ? 'destructive' : 'default'}
              className={
                rec.type === 'success'
                  ? 'border-green-500/50 bg-green-500/10'
                  : rec.type === 'info'
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : ''
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="!text-[14px] !font-semibold">
                {rec.title}
                {rec.impact && (
                  <Badge variant="outline" className="ml-2 !text-[11px]">
                    {rec.impact}
                  </Badge>
                )}
              </AlertTitle>
              <AlertDescription className="!text-[13px] !font-normal">
                {rec.description}
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}

