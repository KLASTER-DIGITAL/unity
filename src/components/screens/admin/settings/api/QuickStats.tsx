import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { supabase } from '../../../../../utils/supabase/client';
import { BarChart3, Hash, DollarSign, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';

interface Stats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    avgCostPerRequest: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Расчет диапазона дат
      const endDate = new Date();
      const startDate = new Date();
      
      switch(period) {
        case '7d': startDate.setDate(endDate.getDate() - 7); break;
        case '30d': startDate.setDate(endDate.getDate() - 30); break;
        case '90d': startDate.setDate(endDate.getDate() - 90); break;
      }

      const { data, error } = await supabase
        .from('openai_usage')
        .select('total_tokens, estimated_cost')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) {
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        const totalRequests = data.length;
        const totalTokens = data.reduce((sum, item) => sum + item.total_tokens, 0);
        const totalCost = data.reduce((sum, item) => sum + parseFloat(item.estimated_cost), 0);
        
        setStats({
          totalRequests,
          totalTokens,
          totalCost,
          avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Переключатель периода */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Статистика использования
        </h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
            >
              {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}
            </Button>
          ))}
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Всего запросов */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            </div>
            <div className="text-sm text-blue-600 font-medium mb-1">
              Всего запросов
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {isLoading ? '...' : formatNumber(stats.totalRequests)}
            </div>
            <div className="text-xs text-blue-600 mt-2">
              За последние {period === '7d' ? '7' : period === '30d' ? '30' : '90'} дней
            </div>
          </CardContent>
        </Card>

        {/* Всего токенов */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Hash className="w-8 h-8 text-green-600" />
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
            </div>
            <div className="text-sm text-green-600 font-medium mb-1">
              Всего токенов
            </div>
            <div className="text-3xl font-bold text-green-900">
              {isLoading ? '...' : formatNumber(stats.totalTokens)}
            </div>
            <div className="text-xs text-green-600 mt-2">
              Использовано токенов
            </div>
          </CardContent>
        </Card>

        {/* Общая стоимость */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-600" />
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
            </div>
            <div className="text-sm text-purple-600 font-medium mb-1">
              Общая стоимость
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {isLoading ? '...' : `$${stats.totalCost.toFixed(2)}`}
            </div>
            <div className="text-xs text-purple-600 mt-2">
              Расходы на API
            </div>
          </CardContent>
        </Card>

        {/* Средняя стоимость */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-orange-600" />}
            </div>
            <div className="text-sm text-orange-600 font-medium mb-1">
              Средняя стоимость
            </div>
            <div className="text-3xl font-bold text-orange-900">
              {isLoading ? '...' : `$${stats.avgCostPerRequest.toFixed(4)}`}
            </div>
            <div className="text-xs text-orange-600 mt-2">
              На один запрос
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Кнопка обновления */}
      <div className="flex justify-end">
        <Button
          onClick={loadStats}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Обновление...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить данные
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
