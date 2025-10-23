import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { BarChart3, Bell, TrendingUp, Users } from 'lucide-react';
import { PushAnalyticsDashboard } from '@/components/screens/admin/settings/PushAnalyticsDashboard';
import { AdvancedPWAAnalytics } from '@/components/screens/admin/analytics/AdvancedPWAAnalytics';

export function PWAAnalytics() {
  const [activeTab, setActiveTab] = useState('push');

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            PWA Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Детальная аналитика PWA и Push уведомлений
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Push Analytics
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="cohort" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Cohort Retention
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Funnel
          </TabsTrigger>
        </TabsList>

        {/* Push Analytics */}
        <TabsContent value="push" className="space-y-6">
          <PushAnalyticsDashboard />
        </TabsContent>

        {/* Advanced Analytics */}
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedPWAAnalytics />
        </TabsContent>

        {/* Cohort Retention */}
        <TabsContent value="cohort" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Cohort Retention Analysis
              </CardTitle>
              <CardDescription>
                Анализ удержания пользователей по когортам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Cohort Retention доступен в Advanced Analytics</p>
                <p className="text-sm mt-2">Переключитесь на вкладку "Advanced" для просмотра</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Analysis */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Funnel Analysis
              </CardTitle>
              <CardDescription>
                Анализ конверсии через воронку установки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Funnel Analysis доступен в Advanced Analytics</p>
                <p className="text-sm mt-2">Переключитесь на вкладку "Advanced" для просмотра</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

