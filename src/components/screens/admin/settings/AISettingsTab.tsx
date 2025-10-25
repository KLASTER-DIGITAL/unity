"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Save, AlertCircle, CheckCircle, DollarSign, Zap, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
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
      const { data: { session } } = await supabase.auth.getSession();

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
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Save model configs
      const { error: configError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'ai_model_configs',
          value: JSON.stringify(modelConfigs),
          updated_at: new Date().toISOString(),
        });

      if (configError) throw configError;

      // Save budget config
      const { error: budgetError } = await supabase
        .from('admin_settings')
        .upsert({
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
          <h3 className="text-[26px]! text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent" />
            AI Settings
          </h3>
          <p className="text-[15px]! text-muted-foreground font-normal!">
            Управление моделями, лимитами и бюджетом AI
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>

      {/* Budget Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[17px]! flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Бюджет AI
              </CardTitle>
              <CardDescription className="text-[13px]! font-normal!">
                Месячный лимит и текущие расходы
              </CardDescription>
            </div>
            <Badge variant={isOverBudget ? 'destructive' : 'outline'} className="text-[13px]!">
              {budgetPercentage.toFixed(1)}% использовано
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthly_budget" className="text-[13px]!">Месячный бюджет ($)</Label>
              <Input
                id="monthly_budget"
                type="number"
                value={budgetConfig.monthly_budget}
                onChange={(e) => setBudgetConfig({ ...budgetConfig, monthly_budget: parseFloat(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="alert_threshold" className="text-[13px]!">Порог уведомления (%)</Label>
              <Input
                id="alert_threshold"
                type="number"
                value={budgetConfig.alert_threshold}
                onChange={(e) => setBudgetConfig({ ...budgetConfig, alert_threshold: parseFloat(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[13px]!">Текущие расходы</Label>
              <div className="mt-1.5 h-10 px-3 rounded-md border border-input bg-muted flex items-center text-[15px]! font-semibold! text-foreground">
                ${budgetConfig.current_spend.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px]!">
              <span className="text-muted-foreground">Использовано</span>
              <span className={isOverBudget ? 'text-red-500 font-semibold!' : 'text-foreground'}>
                ${budgetConfig.current_spend.toFixed(2)} / ${budgetConfig.monthly_budget.toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Test Mode */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-accent" />
              <div>
                <p className="text-[15px]! font-medium! text-foreground">Тестовый режим</p>
                <p className="text-[13px]! text-muted-foreground">Использование sandbox-ключа без реальных затрат</p>
              </div>
            </div>
            <Switch
              checked={budgetConfig.test_mode}
              onCheckedChange={(checked) => setBudgetConfig({ ...budgetConfig, test_mode: checked })}
            />
          </div>

          {isOverBudget && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-[15px]! font-medium! text-red-600">Превышен порог бюджета!</p>
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
          <CardTitle className="text-[17px]! flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Назначение моделей по операциям
          </CardTitle>
          <CardDescription className="text-[13px]! font-normal!">
            Выберите оптимальную модель для каждого типа AI операции
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Brain className="w-6 h-6 animate-spin text-accent" />
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
                            <p className="text-[15px]! font-medium! text-foreground">{opType.label}</p>
                            <p className="text-[13px]! text-muted-foreground">{opType.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={config.model}
                            onValueChange={(value) => updateModelConfig(opType.value, 'model', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AI_MODELS.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  <div className="flex items-center gap-2">
                                    {model.label}
                                    {model.recommended && (
                                      <Badge variant="outline" className="text-[10px]! bg-green-500/10 text-green-600 border-green-500/20">
                                        ✓
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={config.max_tokens}
                            onChange={(e) => updateModelConfig(opType.value, 'max_tokens', parseInt(e.target.value))}
                            className="w-[100px]"
                            disabled={config.model === 'whisper-1'}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={config.temperature}
                            onChange={(e) => updateModelConfig(opType.value, 'temperature', parseFloat(e.target.value))}
                            className="w-[80px]"
                            disabled={config.model === 'whisper-1'}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-accent/10 text-accent">
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
          <CardTitle className="text-[17px]! flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Рекомендации по оптимизации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <span className="text-[15px]!">💡</span>
            </div>
            <div>
              <p className="text-[15px]! font-medium! text-foreground">Используйте GPT-4o-mini для массовых операций</p>
              <p className="text-[13px]! text-muted-foreground">
                Для мотивационных карточек и анализа эмоций GPT-4o-mini обеспечивает отличное качество при стоимости в 8 раз ниже GPT-4o
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="text-[15px]!">📊</span>
            </div>
            <div>
              <p className="text-[15px]! font-medium! text-foreground">Оптимизируйте max_tokens</p>
              <p className="text-[13px]! text-muted-foreground">
                Установите разумные лимиты токенов для каждой операции. Для карточек достаточно 500 токенов, для отчетов - 2000
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <span className="text-[15px]!">⚡</span>
            </div>
            <div>
              <p className="text-[15px]! font-medium! text-foreground">Настройте temperature правильно</p>
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

