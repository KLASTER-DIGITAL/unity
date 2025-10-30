import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

/**
 * System Status Component
 * Displays system health indicators
 */

export function SystemStatus() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[17px]!">
          <Activity className="w-5 h-5" />
          Статус системы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[15px]! text-foreground">База данных</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
              Работает
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[15px]! text-foreground">API сервер</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
              Работает
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[15px]! text-foreground">Service Worker</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
              Активен v1.0.3
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[15px]! text-foreground">Push-уведомления</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
              Включено
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

