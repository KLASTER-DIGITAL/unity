import { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabase/client';
import { SimpleChart } from '../../../../../shared/components/SimpleChart';

interface DailyStats {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export const UsageChart = () => {
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
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-flex admin-justify-between admin-items-center admin-flex-wrap admin-gap-4">
          <div>
            <h3 className="admin-card-title">📈 Тренды использования</h3>
            <p className="admin-card-description">
              Динамика за период
            </p>
          </div>
          
          <div className="admin-flex admin-gap-2 admin-flex-wrap">
            {/* Индикатор тренда */}
            {data.length > 0 && (
              <div className={`admin-px-3 admin-py-1 admin-rounded-full admin-text-xs admin-font-medium ${
                trend.direction === 'up' 
                  ? 'admin-bg-green-100 admin-text-green-700'
                  : trend.direction === 'down'
                  ? 'admin-bg-red-100 admin-text-red-700'
                  : 'admin-bg-gray-100 admin-text-gray-700'
              }`}>
                {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'} 
                {' '}{trend.value.toFixed(1)}% за неделю
              </div>
            )}

            {/* Тип графика */}
            <div className="admin-flex admin-gap-1 admin-bg-gray-100 admin-rounded-lg admin-p-1">
              <button
                onClick={() => setChartType('line')}
                className={`admin-px-3 admin-py-1 admin-rounded admin-text-xs admin-font-medium admin-transition-colors ${
                  chartType === 'line'
                    ? 'admin-bg-white admin-text-gray-900 admin-shadow-sm'
                    : 'admin-text-gray-600 hover:admin-text-gray-900'
                }`}
              >
                Линия
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`admin-px-3 admin-py-1 admin-rounded admin-text-xs admin-font-medium admin-transition-colors ${
                  chartType === 'area'
                    ? 'admin-bg-white admin-text-gray-900 admin-shadow-sm'
                    : 'admin-text-gray-600 hover:admin-text-gray-900'
                }`}
              >
                Область
              </button>
            </div>

            {/* Метрика */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="admin-input admin-py-1 admin-px-3 admin-text-xs"
            >
              <option value="requests">Запросы</option>
              <option value="tokens">Токены</option>
              <option value="cost">Стоимость</option>
            </select>
            
            {/* Период */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="admin-input admin-py-1 admin-px-3 admin-text-xs"
            >
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card-content">
        {isLoading ? (
          <div className="admin-flex admin-justify-center admin-items-center admin-h-80">
            <div className="admin-spinner admin-w-8 admin-h-8" />
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
      </div>
    </div>
  );
};
