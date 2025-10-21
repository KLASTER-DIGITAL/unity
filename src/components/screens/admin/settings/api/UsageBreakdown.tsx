import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { supabase } from '../../../../../utils/supabase/client';
import { SimpleChart } from '../../../../../shared/components/SimpleChart';
import { BarChart3, Bot, Globe, Mic, FileText, Package, Loader2 } from 'lucide-react';

interface OperationStats {
  operation_type: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
}

const COLORS = {
  ai_card: '#3b82f6',        // blue
  translation: '#10b981',    // green
  transcription: '#f59e0b',  // orange
  pdf_export: '#8b5cf6',     // purple
  other: '#6b7280'           // gray
};

const OPERATION_LABELS = {
  ai_card: 'AI Анализ',
  translation: 'Переводы',
  transcription: 'Транскрипция',
  pdf_export: 'PDF Экспорт',
  other: 'Другое'
};

const OPERATION_ICONS = {
  ai_card: Bot,
  translation: Globe,
  transcription: Mic,
  pdf_export: FileText,
  other: Package
};

export function UsageBreakdown() {
  const [data, setData] = useState<OperationStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [metric, setMetric] = useState<'requests' | 'tokens' | 'cost'>('requests');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch(period) {
        case '7d': startDate.setDate(endDate.getDate() - 7); break;
        case '30d': startDate.setDate(endDate.getDate() - 30); break;
        case '90d': startDate.setDate(endDate.getDate() - 90); break;
      }

      const { data: rawData, error } = await supabase
        .from('openai_usage')
        .select('operation_type, total_tokens, estimated_cost')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) {
        console.error('Error loading breakdown:', error);
        return;
      }

      if (rawData) {
        // Агрегация по типам операций
        const aggregated = rawData.reduce((acc, item) => {
          const type = item.operation_type;
          if (!acc[type]) {
            acc[type] = {
              operation_type: type,
              total_requests: 0,
              total_tokens: 0,
              total_cost: 0
            };
          }
          acc[type].total_requests += 1;
          acc[type].total_tokens += item.total_tokens;
          acc[type].total_cost += parseFloat(item.estimated_cost);
          return acc;
        }, {} as Record<string, OperationStats>);

        setData(Object.values(aggregated));
      }
    } catch (error) {
      console.error('Error loading breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    return data.map(item => ({
      name: OPERATION_LABELS[item.operation_type as keyof typeof OPERATION_LABELS] || item.operation_type,
      value: metric === 'requests' 
        ? item.total_requests 
        : metric === 'tokens' 
        ? item.total_tokens 
        : item.total_cost,
      color: COLORS[item.operation_type as keyof typeof COLORS] || COLORS.other
    }));
  };

  const formatValue = (value: number) => {
    if (metric === 'cost') return `$${value.toFixed(2)}`;
    return new Intl.NumberFormat('ru-RU').format(Math.round(value));
  };

  const getTotalValue = () => {
    return data.reduce((sum, item) => {
      return sum + (metric === 'requests' 
        ? item.total_requests 
        : metric === 'tokens' 
        ? item.total_tokens 
        : item.total_cost);
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Разбивка использования
            </CardTitle>
            <CardDescription>
              По типам операций
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Переключатель метрики */}
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requests">Запросы</SelectItem>
                <SelectItem value="tokens">Токены</SelectItem>
                <SelectItem value="cost">Стоимость</SelectItem>
              </SelectContent>
            </Select>

            {/* Переключатель периода */}
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="90d">90 дней</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <div>
              <SimpleChart
                data={getChartData()}
                dataKey="value"
                xAxisKey="name"
                title={`Распределение по типам операций (${metric === 'requests' ? 'запросы' : metric === 'tokens' ? 'токены' : 'стоимость'})`}
                type="pie"
              />
            </div>

            {/* Детальная таблица */}
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">
                  Всего {metric === 'requests' ? 'запросов' : metric === 'tokens' ? 'токенов' : 'стоимость'}
                </div>
                <div className="text-3xl font-bold">
                  {formatValue(getTotalValue())}
                </div>
              </div>

              <div className="space-y-3">
                {data.map((item) => {
                  const percentage = (
                    (metric === 'requests'
                      ? item.total_requests
                      : metric === 'tokens'
                      ? item.total_tokens
                      : item.total_cost) / getTotalValue() * 100
                  );
                  const Icon = OPERATION_ICONS[item.operation_type as keyof typeof OPERATION_ICONS] || Package;

                  return (
                    <div key={item.operation_type} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[item.operation_type as keyof typeof COLORS] || COLORS.other }}
                          />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {OPERATION_LABELS[item.operation_type as keyof typeof OPERATION_LABELS] || item.operation_type}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[item.operation_type as keyof typeof COLORS] || COLORS.other
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">{item.total_requests}</span> запросов
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{item.total_tokens.toLocaleString()}</span> токенов
                        </div>
                        <div>
                          <span className="font-medium text-foreground">${item.total_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
