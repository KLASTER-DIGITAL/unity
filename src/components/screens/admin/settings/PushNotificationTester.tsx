import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Bell, CheckCircle, XCircle, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import {
  checkPushSupport,
  sendTestNotification,
  getPushRecommendations,
  type PushSupportInfo,
} from '@/shared/lib/pwa/pushNotificationSupport';

/**
 * Компонент для тестирования Push Notifications
 * Показывает поддержку браузера и позволяет отправить тестовое уведомление
 */
export function PushNotificationTester() {
  const [supportInfo, setSupportInfo] = useState<PushSupportInfo | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [testTitle, setTestTitle] = useState('🎉 UNITY Diary');
  const [testBody, setTestBody] = useState('Это тестовое уведомление из админ-панели!');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Проверяем поддержку при монтировании
    const info = checkPushSupport();
    setSupportInfo(info);
    setRecommendations(getPushRecommendations());
  }, []);

  const handleSendTest = async () => {
    setIsSending(true);
    setLastResult(null);

    try {
      await sendTestNotification(testTitle, testBody);
      setLastResult('success');
      console.log('[PushTester] Test notification sent successfully');
    } catch (error) {
      setLastResult('error');
      console.error('[PushTester] Failed to send test notification:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!supportInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Загрузка информации о браузере...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={supportInfo.isSupported ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Тестирование Push Notifications
        </CardTitle>
        <CardDescription>
          Проверка поддержки браузера и отправка тестовых уведомлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Информация о браузере */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {supportInfo.browserInfo.isMobile ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
            Информация о браузере
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Браузер:</span>
              <div className="font-medium">{supportInfo.browserInfo.name} {supportInfo.browserInfo.version}</div>
            </div>
            <div>
              <span className="text-muted-foreground">ОС:</span>
              <div className="font-medium">{supportInfo.browserInfo.os}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Тип:</span>
              <div className="font-medium">{supportInfo.browserInfo.isMobile ? 'Мобильный' : 'Десктоп'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Поддержка:</span>
              <div className={`font-medium ${supportInfo.isSupported ? 'text-green-600' : 'text-red-600'}`}>
                {supportInfo.isSupported ? '✅ Поддерживается' : '❌ Не поддерживается'}
              </div>
            </div>
          </div>
        </div>

        {/* Детали поддержки API */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Поддержка API:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {supportInfo.features.serviceWorker ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              Service Worker
            </div>
            <div className="flex items-center gap-2">
              {supportInfo.features.pushManager ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              Push Manager
            </div>
            <div className="flex items-center gap-2">
              {supportInfo.features.notifications ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              Notifications API
            </div>
            <div className="flex items-center gap-2">
              {supportInfo.features.permissions ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              Permissions API
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        {recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Рекомендации:
              </div>
            </div>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Причина неподдержки */}
        {!supportInfo.isSupported && supportInfo.reason && (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                {supportInfo.reason}
              </div>
            </div>
          </div>
        )}

        {/* Форма тестового уведомления */}
        {supportInfo.isSupported && (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-sm font-medium">Отправить тестовое уведомление:</div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="test-title">Заголовок</Label>
                <Input
                  id="test-title"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Заголовок уведомления"
                />
              </div>
              
              <div>
                <Label htmlFor="test-body">Текст</Label>
                <Input
                  id="test-body"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="Текст уведомления"
                />
              </div>

              <Button
                onClick={handleSendTest}
                disabled={isSending || !testTitle || !testBody}
                className="w-full"
              >
                {isSending ? 'Отправка...' : '📤 Отправить тестовое уведомление'}
              </Button>

              {lastResult === 'success' && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                    <CheckCircle className="w-4 h-4" />
                    Уведомление успешно отправлено!
                  </div>
                </div>
              )}

              {lastResult === 'error' && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                    <XCircle className="w-4 h-4" />
                    Ошибка при отправке уведомления
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Превью уведомления */}
        {supportInfo.isSupported && (
          <div className="p-4 bg-muted rounded-lg border">
            <div className="text-sm font-medium mb-3">📱 Превью уведомления:</div>
            <div className="bg-background rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-start gap-3">
                <img 
                  src="/icon-96x96.png" 
                  alt="App icon" 
                  className="w-10 h-10 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%234F46E5"/></svg>';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{testTitle || 'Заголовок'}</div>
                  <div className="text-sm text-muted-foreground mt-1">{testBody || 'Текст уведомления'}</div>
                  <div className="text-xs text-muted-foreground mt-2">Сейчас</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

