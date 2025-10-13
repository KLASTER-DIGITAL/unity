import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface APISettingsTabProps {
  onSave?: (apiKey: string) => void;
}

export function APISettingsTab({ onSave }: APISettingsTabProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);

  // Загрузка текущего API ключа из localStorage или env
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    setIsLoading(true);
    try {
      // Загружаем из Supabase через make-server-9729c493
      const response = await fetch(
        'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings/openai_api_key',
        {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.setting?.value) {
          setApiKey(data.setting.value);
          setIsKeyValid(true);
          setLastSaved(new Date(data.setting.updated_at || data.setting.created_at));
          // Также сохраняем в localStorage для быстрого доступа
          localStorage.setItem('admin_openai_api_key', data.setting.value);
          return;
        }
      }

      // Fallback: загружаем из localStorage
      const savedKey = localStorage.getItem('admin_openai_api_key');
      const savedTime = localStorage.getItem('admin_openai_api_key_saved_at');
      
      if (savedKey) {
        setApiKey(savedKey);
        setIsKeyValid(true);
        
        if (savedTime) {
          setLastSaved(new Date(savedTime));
        } else {
          setLastSaved(new Date());
        }
      } else {
        setApiKey('');
        setIsKeyValid(null);
        setLastSaved(null);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      toast.error('Ошибка загрузки API ключа');
    } finally {
      setIsLoading(false);
    }
  };

  const validateApiKey = (key: string): boolean => {
    // Базовая валидация формата OpenAI API ключа
    return key.startsWith('sk-') && key.length > 20;
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('API ключ не может быть пустым');
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast.error('Неверный формат API ключа. Должен начинаться с "sk-"');
      setIsKeyValid(false);
      return;
    }

    setIsSaving(true);
    try {
      // Сохраняем в Supabase через make-server-9729c493
      const response = await fetch(
        'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
          },
          body: JSON.stringify({
            key: 'openai_api_key',
            value: apiKey
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save API key to database');
      }

      const result = await response.json();
      
      // Также сохраняем в localStorage для быстрого доступа
      const now = new Date();
      localStorage.setItem('admin_openai_api_key', apiKey);
      localStorage.setItem('admin_openai_api_key_saved_at', now.toISOString());
      
      setLastSaved(now);
      setIsKeyValid(true);
      
      toast.success('API ключ успешно сохранен!', {
        description: 'Изменения применятся при следующем запросе к AI'
      });

      if (onSave) {
        onSave(apiKey);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Ошибка сохранения API ключа');
      setIsKeyValid(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Введите API ключ для тестирования');
      return;
    }

    setIsSaving(true);
    try {
      // Тестовый запрос к OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        setIsKeyValid(true);
        toast.success('API ключ валиден!', {
          description: 'Подключение к OpenAI успешно'
        });
      } else {
        const error = await response.json();
        setIsKeyValid(false);
        toast.error('API ключ невалиден', {
          description: error.error?.message || 'Проверьте правильность ключа'
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setIsKeyValid(false);
      toast.error('Ошибка тестирования API ключа');
    } finally {
      setIsSaving(false);
    }
  };

  const maskApiKey = (key: string): string => {
    if (key.length < 12) return key;
    return `${key.substring(0, 7)}${'•'.repeat(key.length - 11)}${key.substring(key.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Key className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="!text-[17px]">OpenAI API Configuration</CardTitle>
              <CardDescription className="!text-[13px] !font-normal">
                Управление API ключом для интеграции с OpenAI GPT-4
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* API Key Input */}
          <div className="space-y-3">
            <Label htmlFor="api-key" className="!text-[15px]">
              OpenAI API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setIsKeyValid(null);
                  }}
                  placeholder="sk-proj-..."
                  className="pr-24 !text-[15px] font-mono"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <AnimatePresence>
                    {isKeyValid !== null && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isKeyValid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground">
              API ключ используется для генерации AI-ответов, анализа записей и создания мотивационных карточек.
              Получите ключ на{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>

          {/* Current Key Display */}
          {apiKey && !showApiKey && (
            <div className="p-3 bg-muted rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] text-muted-foreground">Текущий ключ (приоритет):</p>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[11px] rounded-full font-medium">
                      АКТИВЕН
                    </span>
                  </div>
                  <p className="text-[15px] font-mono">{maskApiKey(apiKey)}</p>
                </div>
                {lastSaved && (
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">Сохранен:</p>
                    <p className="text-[13px]">
                      {lastSaved.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {lastSaved ? 'Обновить ключ' : 'Сохранить ключ'}
            </Button>
            <Button
              onClick={handleTest}
              variant="outline"
              disabled={isSaving || !apiKey.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Проверить ключ
            </Button>
          </div>
          
          {/* Кнопка использовать приоритет */}
          {lastSaved && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="!text-[15px] font-medium text-green-900 dark:text-green-100 mb-1">
                    API ключ активен
                  </h4>
                  <p className="!text-[13px] text-green-800 dark:text-green-200 mb-3">
                    Этот ключ будет использоваться для всех AI-запросов с ПРИОРИТЕТОМ над серверным ключом.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('admin_openai_api_key');
                        localStorage.removeItem('admin_openai_api_key_saved_at');
                        setApiKey('');
                        setLastSaved(null);
                        setIsKeyValid(null);
                        toast.success('API ключ удален. Теперь используется серверный ключ.');
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Удалить и использовать серверный ключ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="!text-[15px] font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Важно: Безопасность API ключа
                </h4>
                <p className="!text-[13px] text-yellow-800 dark:text-yellow-200">
                  API ключ хранится локально в браузере. Не делитесь им с другими пользователями. 
                  Для продакшн-среды рекомендуется использовать серверные переменные окружения.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics (будущая функциональность) */}
      <Card className="border-border opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle className="!text-[17px]">Статистика использования</CardTitle>
          <CardDescription className="!text-[13px] !font-normal">
            Скоро: мониторинг расхода токенов и стоимости запросов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-[13px] text-muted-foreground mb-1">Запросов сегодня</p>
              <p className="text-[20px] font-semibold">--</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-[13px] text-muted-foreground mb-1">Токенов использовано</p>
              <p className="text-[20px] font-semibold">--</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-[13px] text-muted-foreground mb-1">Ориент. стоимость</p>
              <p className="text-[20px] font-semibold">$--</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

