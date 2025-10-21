import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { supabase } from '../../../../../utils/supabase/client';
import { SimpleChart } from '../../../../../shared/components/SimpleChart';
import { TrendingUp, Loader2 } from 'lucide-react';

interface DailyStats {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export function UsageChart() {
  const [data, setData] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
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
        .select('created_at, total_tokens, estimated_cost')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading chart data:', error);
        return;
      }

      if (rawData) {
        // Группировка по дням
        const dailyData = rawData.reduce((acc, item) => {
          const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit'
          });
          
          if (!acc[date]) {
            acc[date] = {
              date,
              requests: 0,
              tokens: 0,
              cost: 0
            };
          }
          
          acc[date].requests += 1;
          acc[date].tokens += item.total_tokens;
          acc[date].cost += parseFloat(item.estimated_cost);
          
          return acc;
        }, {} as Record<string, DailyStats>);

        // Заполнение пропущенных дней нулями
        const filledData: DailyStats[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit'
          });
          
          filledData.push(dailyData[dateStr] || {
            date: dateStr,
            requests: 0,
            tokens: 0,
            cost: 0
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setData(filledData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatYAxis = (value: number) => {
    if (metric === 'cost') return `$${value.toFixed(2)}`;
    if (metric === 'tokens') return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatTooltip = (value: number) => {
    if (metric === 'cost') return `$${value.toFixed(4)}`;
    if (metric === 'tokens') return value.toLocaleString();
    return value.toString();
  };

  const getMetricLabel = () => {
    switch(metric) {
      case 'requests': return 'Запросы';
      case 'tokens': return 'Токены';
      case 'cost': return 'Стоимость ($)';
    }
  };

  const getMetricColor = () => {
    switch(metric) {
      case 'requests': return '#3b82f6'; // blue
      case 'tokens': return '#10b981';   // green
      case 'cost': return '#f59e0b';     // orange
    }
  };

  const getTrend = () => {
    if (data.length < 2) return { value: 0, direction: 'neutral' as const };
    
    const recentData = data.slice(-7);
    const olderData = data.slice(-14, -7);
    
    const recentAvg = recentData.reduce((sum, item) => 
      sum + (metric === 'requests' ? item.requests : metric === 'tokens' ? item.tokens : item.cost), 0
    ) / recentData.length;
    
    const olderAvg = olderData.reduce((sum, item) => 
      sum + (metric === 'requests' ? item.requests : metric === 'tokens' ? item.tokens : item.cost), 0
    ) / (olderData.length || 1);
    
    const change = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;
    
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const trend = getTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Тренды использования
            </CardTitle>
            <CardDescription>
              Динамика за период
            </CardDescription>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Индикатор тренда */}
            {data.length > 0 && (
              <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend.value.toFixed(1)}% за неделю
              </Badge>
            )}

            {/* Тип графика */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                onClick={() => setChartType('line')}
                variant={chartType === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
              >
                Линия
              </Button>
              <Button
                onClick={() => setChartType('area')}
                variant={chartType === 'area' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
              >
                Область
              </Button>
            </div>

            {/* Метрика */}
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requests">Запросы</SelectItem>
                <SelectItem value="tokens">Токены</SelectItem>
                <SelectItem value="cost">Стоимость</SelectItem>
              </SelectContent>
            </Select>

            {/* Период */}
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
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
          <div className="flex justify-center items-center h-80">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SimpleChart
            data={data}
            dataKey={metric}
            xAxisKey="date"
            title={`${getMetricLabel()} за ${period === '7d' ? '7 дней' : period === '30d' ? '30 дней' : '90 дней'}`}
            type={chartType}
          />
        )}
      </CardContent>
    </Card>
  );
}
