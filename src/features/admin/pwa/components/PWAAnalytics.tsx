import { BarChart3, Bell, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { AdvancedPWAAnalytics } from '@/components/screens/admin/analytics/AdvancedPWAAnalytics';
import { PushAnalyticsDashboard } from '@/components/screens/admin/settings/PushAnalyticsDashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function PWAAnalytics() {
  const [activeTab, setActiveTab] = useState('push');

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <BarChart3 className="h-6 w-6" />
            PWA Analytics
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Детальная аналитика PWA и Push уведомлений
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs className="space-y-6" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger className="flex items-center gap-2" value="push">
            <Bell className="h-4 w-4" />
            Push Analytics
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="advanced">
            <TrendingUp className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="cohort">
            <Users className="h-4 w-4" />
            Cohort Retention
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="funnel">
            <BarChart3 className="h-4 w-4" />
            Funnel
          </TabsTrigger>
        </TabsList>

        {/* Push Analytics */}
        <TabsContent className="space-y-6" value="push">
          <PushAnalyticsDashboard />
        </TabsContent>

        {/* Advanced Analytics */}
        <TabsContent className="space-y-6" value="advanced">
          <AdvancedPWAAnalytics />
        </TabsContent>

        {/* Cohort Retention */}
        <TabsContent className="space-y-6" value="cohort">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cohort Retention Analysis
              </CardTitle>
              <CardDescription>Анализ удержания пользователей по когортам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Cohort Retention доступен в Advanced Analytics</p>
                <p className="mt-2 text-sm">Переключитесь на вкладку "Advanced" для просмотра</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Analysis */}
        <TabsContent className="space-y-6" value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Funnel Analysis
              </CardTitle>
              <CardDescription>Анализ конверсии через воронку установки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Funnel Analysis доступен в Advanced Analytics</p>
                <p className="mt-2 text-sm">Переключитесь на вкладку "Advanced" для просмотра</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
