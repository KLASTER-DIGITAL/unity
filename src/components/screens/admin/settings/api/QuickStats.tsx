import { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabase/client';

interface Stats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
}

export const QuickStats = () => {
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
    <div className="admin-space-y-6">
      {/* Переключатель периода */}
      <div className="admin-flex admin-justify-between admin-items-center">
        <h3 className="admin-text-lg admin-font-semibold admin-text-gray-900">
          📊 Статистика использования
        </h3>
        <div className="admin-flex admin-gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`admin-px-4 admin-py-2 admin-rounded-lg admin-text-sm admin-font-medium admin-transition-colors ${
                period === p
                  ? 'admin-bg-admin-primary admin-text-white'
                  : 'admin-bg-gray-100 admin-text-gray-700 hover:admin-bg-gray-200'
              }`}
            >
              {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}
            </button>
          ))}
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 lg:admin-grid-cols-4 admin-gap-6">
        {/* Всего запросов */}
        <div className="admin-card admin-p-6 admin-bg-gradient-to-br admin-from-blue-50 admin-to-blue-100 admin-border admin-border-blue-200">
          <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
            <div className="admin-text-3xl">📊</div>
            {isLoading && <div className="admin-spinner admin-w-5 admin-h-5" />}
          </div>
          <div className="admin-text-sm admin-text-blue-600 admin-font-medium admin-mb-1">
            Всего запросов
          </div>
          <div className="admin-text-3xl admin-font-bold admin-text-blue-900">
            {isLoading ? '...' : formatNumber(stats.totalRequests)}
          </div>
          <div className="admin-text-xs admin-text-blue-600 admin-mt-2">
            За последние {period === '7d' ? '7' : period === '30d' ? '30' : '90'} дней
          </div>
        </div>

        {/* Всего токенов */}
        <div className="admin-card admin-p-6 admin-bg-gradient-to-br admin-from-green-50 admin-to-green-100 admin-border admin-border-green-200">
          <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
            <div className="admin-text-3xl">🔢</div>
            {isLoading && <div className="admin-spinner admin-w-5 admin-h-5" />}
          </div>
          <div className="admin-text-sm admin-text-green-600 admin-font-medium admin-mb-1">
            Всего токенов
          </div>
          <div className="admin-text-3xl admin-font-bold admin-text-green-900">
            {isLoading ? '...' : formatNumber(stats.totalTokens)}
          </div>
          <div className="admin-text-xs admin-text-green-600 admin-mt-2">
            Использовано токенов
          </div>
        </div>

        {/* Общая стоимость */}
        <div className="admin-card admin-p-6 admin-bg-gradient-to-br admin-from-purple-50 admin-to-purple-100 admin-border admin-border-purple-200">
          <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
            <div className="admin-text-3xl">💰</div>
            {isLoading && <div className="admin-spinner admin-w-5 admin-h-5" />}
          </div>
          <div className="admin-text-sm admin-text-purple-600 admin-font-medium admin-mb-1">
            Общая стоимость
          </div>
          <div className="admin-text-3xl admin-font-bold admin-text-purple-900">
            {isLoading ? '...' : `$${stats.totalCost.toFixed(2)}`}
          </div>
          <div className="admin-text-xs admin-text-purple-600 admin-mt-2">
            Расходы на API
          </div>
        </div>

        {/* Средняя стоимость */}
        <div className="admin-card admin-p-6 admin-bg-gradient-to-br admin-from-orange-50 admin-to-orange-100 admin-border admin-border-orange-200">
          <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
            <div className="admin-text-3xl">📈</div>
            {isLoading && <div className="admin-spinner admin-w-5 admin-h-5" />}
          </div>
          <div className="admin-text-sm admin-text-orange-600 admin-font-medium admin-mb-1">
            Средняя стоимость
          </div>
          <div className="admin-text-3xl admin-font-bold admin-text-orange-900">
            {isLoading ? '...' : `$${stats.avgCostPerRequest.toFixed(4)}`}
          </div>
          <div className="admin-text-xs admin-text-orange-600 admin-mt-2">
            На один запрос
          </div>
        </div>
      </div>

      {/* Кнопка обновления */}
      <div className="admin-flex admin-justify-end">
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="admin-btn admin-btn-outline admin-btn-sm admin-flex admin-items-center admin-gap-2"
        >
          <span>🔄</span>
          {isLoading ? 'Обновление...' : 'Обновить данные'}
        </button>
      </div>
    </div>
  );
};
