'use client';

import { AlertCircle, Brain, CheckCircle, DollarSign, Save, Settings2, Zap } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Select } from '@/shared/components/ui/universal/Select';
import { createClient } from '@/utils/supabase/client';

interface AIModelConfig {
  operation_type: string;
  model: string;
  max_tokens: number;
  temperature: number;
}

interface AIBudgetConfig {
  monthly_budget: number;
  alert_threshold: number;
  current_spend: number;
  test_mode: boolean;
}

const OPERATION_TYPES = [
  { value: 'ai_card', label: 'Мотивационные карточки', description: 'Генерация AI карточек' },
  { value: 'ai_summary', label: 'Недельные отчеты', description: 'PDF книги достижений' },
  { value: 'emotion_analysis', label: 'Анализ эмоций', description: 'Анализ настроения' },
  { value: 'voice_to_text', label: 'Распознавание речи', description: 'Whisper API' },
  { value: 'ai_coach', label: 'AI Coach', description: 'Диалоговый ассистент' },
];

const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4', cost: '$0.03/1K', recommended: false },
  { value: 'gpt-4o', label: 'GPT-4o', cost: '$0.005/1K', recommended: true },
  { value: 'gpt-4o-mini', label: 'GPT-4o-mini', cost: '$0.0006/1K', recommended: true },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', cost: '$0.0015/1K', recommended: false },
  { value: 'whisper-1', label: 'Whisper-1', cost: '$0.006/min', recommended: true },
];

export const AISettingsTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([
    { operation_type: 'ai_card', model: 'gpt-4o-mini', max_tokens: 500, temperature: 0.7 },
    { operation_type: 'ai_summary', model: 'gpt-4o', max_tokens: 2000, temperature: 0.7 },
    { operation_type: 'emotion_analysis', model: 'gpt-4o-mini', max_tokens: 300, temperature: 0.5 },
    { operation_type: 'voice_to_text', model: 'whisper-1', max_tokens: 0, temperature: 0 },
    { operation_type: 'ai_coach', model: 'gpt-4o', max_tokens: 1000, temperature: 0.8 },
  ]);
  const [budgetConfig, setBudgetConfig] = useState<AIBudgetConfig>({
    monthly_budget: 100,
    alert_threshold: 80,
    current_spend: 0,
    test_mode: false,
  });

  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Load AI model configs from admin_settings
      const { data: settings, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['ai_model_configs', 'ai_budget_config']);

      if (error) throw error;

      if (settings) {
        settings.forEach((setting) => {
          if (setting.key === 'ai_model_configs' && setting.value) {
            setModelConfigs(JSON.parse(setting.value));
          }
          if (setting.key === 'ai_budget_config' && setting.value) {
            setBudgetConfig(JSON.parse(setting.value));
          }
        });
      }

      // Load current month spend
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usageData } = await supabase
        .from('openai_usage')
        .select('estimated_cost')
        .gte('created_at', startOfMonth.toISOString());

      if (usageData) {
        const currentSpend = usageData.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
        setBudgetConfig((prev) => ({ ...prev, current_spend: currentSpend }));
      }

      toast.success('Настройки AI загружены');
    } catch (error: any) {
      console.error('Error loading AI settings:', error);
      toast.error(`Ошибка загрузки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Save model configs
      const { error: configError } = await supabase.from('admin_settings').upsert({
        key: 'ai_model_configs',
        value: JSON.stringify(modelConfigs),
        updated_at: new Date().toISOString(),
      });

      if (configError) throw configError;

      // Save budget config
      const { error: budgetError } = await supabase.from('admin_settings').upsert({
        key: 'ai_budget_config',
        value: JSON.stringify(budgetConfig),
        updated_at: new Date().toISOString(),
      });

      if (budgetError) throw budgetError;

      toast.success('Настройки AI успешно сохранены! 🧠');
    } catch (error: any) {
      console.error('Error saving AI settings:', error);
      toast.error(`Ошибка сохранения: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateModelConfig = (operationType: string, field: keyof AIModelConfig, value: any) => {
    setModelConfigs((prev) =>
      prev.map((config) =>
        config.operation_type === operationType ? { ...config, [field]: value } : config
      )
    );
  };

  const budgetPercentage = (budgetConfig.current_spend / budgetConfig.monthly_budget) * 100;
  const isOverBudget = budgetPercentage >= budgetConfig.alert_threshold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-[26px]! text-foreground">
            <Brain className="h-7 w-7 text-accent" />
            AI Settings
          </h3>
          <p className="font-normal! text-[15px]! text-muted-foreground">
            Управление моделями, лимитами и бюджетом AI
          </p>
        </div>
        <Button className="gap-2" disabled={isSaving} onClick={handleSaveSettings}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>

      {/* Budget Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[17px]!">
                <DollarSign className="h-5 w-5 text-green-500" />
                Бюджет AI
              </CardTitle>
              <CardDescription className="font-normal! text-[13px]!">
                Месячный лимит и текущие расходы
              </CardDescription>
            </div>
            <Badge className="text-[13px]!" variant={isOverBudget ? 'destructive' : 'outline'}>
              {budgetPercentage.toFixed(1)}% использовано
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label className="text-[13px]!" htmlFor="monthly_budget">
                Месячный бюджет ($)
              </Label>
              <Input
                className="mt-1.5"
                id="monthly_budget"
                onChange={(e) =>
                  setBudgetConfig({
                    ...budgetConfig,
                    monthly_budget: Number.parseFloat(e.target.value),
                  })
                }
                type="number"
                value={budgetConfig.monthly_budget}
              />
            </div>
            <div>
              <Label className="text-[13px]!" htmlFor="alert_threshold">
                Порог уведомления (%)
              </Label>
              <Input
                className="mt-1.5"
                id="alert_threshold"
                onChange={(e) =>
                  setBudgetConfig({
                    ...budgetConfig,
                    alert_threshold: Number.parseFloat(e.target.value),
                  })
                }
                type="number"
                value={budgetConfig.alert_threshold}
              />
            </div>
            <div>
              <Label className="text-[13px]!">Текущие расходы</Label>
              <div className="mt-1.5 flex h-10 items-center rounded-md border border-input bg-muted px-3 font-semibold! text-[15px]! text-foreground">
                ${budgetConfig.current_spend.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px]!">
              <span className="text-muted-foreground">Использовано</span>
              <span className={isOverBudget ? 'font-semibold! text-red-500' : 'text-foreground'}>
                ${budgetConfig.current_spend.toFixed(2)} / ${budgetConfig.monthly_budget.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Test Mode */}
          <div className="flex items-center justify-between rounded-lg bg-accent/5 p-3">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium! text-[15px]! text-foreground">Тестовый режим</p>
                <p className="text-[13px]! text-muted-foreground">
                  Использование sandbox-ключа без реальных затрат
                </p>
              </div>
            </div>
            <Switch
              checked={budgetConfig.test_mode}
              onCheckedChange={(checked) =>
                setBudgetConfig({ ...budgetConfig, test_mode: checked })
              }
            />
          </div>

          {isOverBudget && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium! text-[15px]! text-red-600">Превышен порог бюджета!</p>
                <p className="text-[13px]! text-red-600/80">
                  Текущие расходы превысили {budgetConfig.alert_threshold}% от месячного бюджета.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]!">
            <Zap className="h-5 w-5 text-accent" />
            Назначение моделей по операциям
          </CardTitle>
          <CardDescription className="font-normal! text-[13px]!">
            Выберите оптимальную модель для каждого типа AI операции
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Brain className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[13px]!">Тип операции</TableHead>
                    <TableHead className="text-[13px]!">Модель</TableHead>
                    <TableHead className="text-[13px]!">Max токенов</TableHead>
                    <TableHead className="text-[13px]!">Temperature</TableHead>
                    <TableHead className="text-[13px]!">Стоимость</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {OPERATION_TYPES.map((opType) => {
                    const config = modelConfigs.find((c) => c.operation_type === opType.value);
                    if (!config) return null;

                    const selectedModel = AI_MODELS.find((m) => m.value === config.model);

                    return (
                      <TableRow key={opType.value}>
                        <TableCell>
                          <div>
                            <p className="font-medium! text-[15px]! text-foreground">
                              {opType.label}
                            </p>
                            <p className="text-[13px]! text-muted-foreground">
                              {opType.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            className="w-[180px]"
                            onValueChange={(value) =>
                              updateModelConfig(opType.value, 'model', value)
                            }
                            options={AI_MODELS.map((model) => ({
                              value: model.value,
                              label: model.label,
                            }))}
                            renderOption={(option) => {
                              const model = AI_MODELS.find((m) => m.value === option.value);
                              return (
                                <div className="flex items-center gap-2">
                                  {option.label}
                                  {model?.recommended && (
                                    <Badge
                                      className="border-green-500/20 bg-green-500/10 text-[10px]! text-green-600"
                                      variant="outline"
                                    >
                                      ✓
                                    </Badge>
                                  )}
                                </div>
                              );
                            }}
                            value={config.model}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[100px]"
                            disabled={config.model === 'whisper-1'}
                            onChange={(e) =>
                              updateModelConfig(
                                opType.value,
                                'max_tokens',
                                Number.parseInt(e.target.value)
                              )
                            }
                            type="number"
                            value={config.max_tokens}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[80px]"
                            disabled={config.model === 'whisper-1'}
                            max="2"
                            min="0"
                            onChange={(e) =>
                              updateModelConfig(
                                opType.value,
                                'temperature',
                                Number.parseFloat(e.target.value)
                              )
                            }
                            step="0.1"
                            type="number"
                            value={config.temperature}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-accent/10 text-accent" variant="outline">
                            {selectedModel?.cost || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]!">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Рекомендации по оптимизации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-[15px]!">💡</span>
            </div>
            <div>
              <p className="font-medium! text-[15px]! text-foreground">
                Используйте GPT-4o-mini для массовых операций
              </p>
              <p className="text-[13px]! text-muted-foreground">
                Для мотивационных карточек и анализа эмоций GPT-4o-mini обеспечивает отличное
                качество при стоимости в 8 раз ниже GPT-4o
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <span className="text-[15px]!">📊</span>
            </div>
            <div>
              <p className="font-medium! text-[15px]! text-foreground">Оптимизируйте max_tokens</p>
              <p className="text-[13px]! text-muted-foreground">
                Установите разумные лимиты токенов для каждой операции. Для карточек достаточно 500
                токенов, для отчетов - 2000
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
              <span className="text-[15px]!">⚡</span>
            </div>
            <div>
              <p className="font-medium! text-[15px]! text-foreground">
                Настройте temperature правильно
              </p>
              <p className="text-[13px]! text-muted-foreground">
                Для аналитики используйте 0.5-0.7, для креативных задач (AI Coach) - 0.8-1.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
