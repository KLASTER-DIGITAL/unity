import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Bell, Send, TestTube, History, FileText } from 'lucide-react';
import { PushNotificationManager } from '@/components/screens/admin/settings/PushNotificationManager';
import { PushNotificationTester } from '@/components/screens/admin/settings/PushNotificationTester';

export function PushNotifications() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Push Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление push уведомлениями для пользователей
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Отправить
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Тестирование
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            История
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Шаблоны
          </TabsTrigger>
        </TabsList>

        {/* Send Push */}
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Отправка Push Уведомлений
              </CardTitle>
              <CardDescription>
                Отправить уведомление всем пользователям или выбранным сегментам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Push */}
        <TabsContent value="test" className="space-y-6">
          <PushNotificationTester />
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                История отправок
              </CardTitle>
              <CardDescription>
                Все отправленные push уведомления
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>История отправок будет реализована в следующей версии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Шаблоны уведомлений
              </CardTitle>
              <CardDescription>
                Мультиязычные шаблоны для разных типов уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Управление шаблонами будет реализовано в следующей версии</p>
                <p className="text-sm mt-2">Сейчас используются встроенные шаблоны для 7 языков</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

