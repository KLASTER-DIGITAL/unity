import { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
  ai_card: '🤖 AI Анализ',
  translation: '🌍 Переводы',
  transcription: '🎤 Транскрипция',
  pdf_export: '📄 PDF Экспорт',
  other: '📦 Другое'
};

export const UsageBreakdown = () => {
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
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-flex admin-justify-between admin-items-center">
          <div>
            <h3 className="admin-card-title">📊 Разбивка использования</h3>
            <p className="admin-card-description">
              По типам операций
            </p>
          </div>
          <div className="admin-flex admin-gap-2">
            {/* Переключатель метрики */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="admin-input admin-py-2 admin-px-3 admin-text-sm"
            >
              <option value="requests">Запросы</option>
              <option value="tokens">Токены</option>
              <option value="cost">Стоимость</option>
            </select>
            
            {/* Переключатель периода */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="admin-input admin-py-2 admin-px-3 admin-text-sm"
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
          <div className="admin-flex admin-justify-center admin-items-center admin-h-64">
            <div className="admin-spinner admin-w-8 admin-h-8" />
          </div>
        ) : data.length === 0 ? (
          <div className="admin-text-center admin-py-12 admin-text-gray-500">
            <div className="admin-text-4xl admin-mb-4">📊</div>
            <p>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-2 admin-gap-8">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatValue(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Детальная таблица */}
            <div className="admin-space-y-4">
              <div className="admin-text-center admin-mb-6">
                <div className="admin-text-sm admin-text-gray-600 admin-mb-1">
                  Всего {metric === 'requests' ? 'запросов' : metric === 'tokens' ? 'токенов' : 'стоимость'}
                </div>
                <div className="admin-text-3xl admin-font-bold admin-text-gray-900">
                  {formatValue(getTotalValue())}
                </div>
              </div>

              <div className="admin-space-y-3">
                {data.map((item) => {
                  const percentage = (
                    (metric === 'requests' 
                      ? item.total_requests 
                      : metric === 'tokens' 
                      ? item.total_tokens 
                      : item.total_cost) / getTotalValue() * 100
                  );

                  return (
                    <div key={item.operation_type} className="admin-border admin-border-gray-200 admin-rounded-lg admin-p-4">
                      <div className="admin-flex admin-justify-between admin-items-center admin-mb-2">
                        <div className="admin-flex admin-items-center admin-gap-2">
                          <div 
                            className="admin-w-3 admin-h-3 admin-rounded-full"
                            style={{ backgroundColor: COLORS[item.operation_type as keyof typeof COLORS] || COLORS.other }}
                          />
                          <span className="admin-font-medium admin-text-gray-900">
                            {OPERATION_LABELS[item.operation_type as keyof typeof OPERATION_LABELS] || item.operation_type}
                          </span>
                        </div>
                        <span className="admin-text-sm admin-text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2 admin-mb-2">
                        <div
                          className="admin-h-2 admin-rounded-full admin-transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[item.operation_type as keyof typeof COLORS] || COLORS.other
                          }}
                        />
                      </div>

                      <div className="admin-grid admin-grid-cols-3 admin-gap-2 admin-text-xs admin-text-gray-600">
                        <div>
                          <span className="admin-font-medium">{item.total_requests}</span> запросов
                        </div>
                        <div>
                          <span className="admin-font-medium">{item.total_tokens.toLocaleString()}</span> токенов
                        </div>
                        <div>
                          <span className="admin-font-medium">${item.total_cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
