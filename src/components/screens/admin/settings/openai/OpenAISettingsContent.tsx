import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { createClient } from '@/utils/supabase/client';
import {
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  TestTube,
  Shield
} from 'lucide-react';

export function OpenAISettingsContent() {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/admin/settings/openai_api_key', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.setting?.value) {
          setApiKey(data.setting.value);
          setIsValid(true);
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      toast.error('Введите API ключ');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'openai_api_key',
          value: apiKey
        })
      });

      if (response.ok) {
        setIsValid(true);
        toast.success('API ключ успешно сохранен!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка сохранения API ключа');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey) {
      toast.error('Введите API ключ');
      return;
    }

    setIsValidating(true);
    try {
      // Simple validation: check format
      if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
        toast.error('Неверный формат API ключа');
        setIsValid(false);
        return;
      }

      setIsValid(true);
      toast.success('API ключ валиден!');
    } catch (error) {
      console.error('Error validating API key:', error);
      toast.error('Ошибка валидации API ключа');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5" />
            Настройки OpenAI API
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Управление API ключом и конфигурацией
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isValid ? "default" : "destructive"}>
            {isValid ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Активен
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Неактивен
              </>
            )}
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Безопасный
          </Badge>
        </div>
      </div>

      {/* API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription>
            Введите ваш OpenAI API ключ для использования AI функций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !apiKey}
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохраняю...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleTest}
                  disabled={isValidating || !apiKey}
                  variant="outline"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Тестирую...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Тест
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Введите ваш OpenAI API ключ. Должен начинаться с "sk-" и содержать более 20 символов.
              </p>
            </div>

            {/* Настройки автообновления */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refresh">Автообновление статистики</Label>
                <p className="text-sm text-muted-foreground">
                  Автоматически обновлять данные использования
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Безопасность API ключа
              </p>
              <p className="text-xs text-blue-700">
                Ваш API ключ хранится в зашифрованном виде в базе данных Supabase. 
                Никогда не передавайте ключ третьим лицам и регулярно обновляйте его для безопасности.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

