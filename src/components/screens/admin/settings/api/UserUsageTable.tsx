import { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabase/client';

interface UserUsage {
  user_id: string;
  user_email: string;
  user_name: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  last_activity: string;
}

export const UserUsageTable = () => {
  const [data, setData] = useState<UserUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [sortBy, setSortBy] = useState<'requests' | 'tokens' | 'cost'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('openai_usage')
        .select(`
          user_id,
          total_tokens,
          estimated_cost,
          created_at
        `);

      // Фильтр по периоду
      if (period !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch(period) {
          case '7d': startDate.setDate(endDate.getDate() - 7); break;
          case '30d': startDate.setDate(endDate.getDate() - 30); break;
          case '90d': startDate.setDate(endDate.getDate() - 90); break;
        }

        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      }

      const { data: usageData, error: usageError } = await query;
      
      if (usageError) {
        console.error('Error loading user usage:', usageError);
        return;
      }

      if (usageData) {
        // Агрегация по пользователям
        const userMap = usageData.reduce((acc, item) => {
          const userId = item.user_id;
          if (!userId) return acc;

          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              user_email: '',
              user_name: '',
              total_requests: 0,
              total_tokens: 0,
              total_cost: 0,
              last_activity: item.created_at
            };
          }

          acc[userId].total_requests += 1;
          acc[userId].total_tokens += item.total_tokens;
          acc[userId].total_cost += parseFloat(item.estimated_cost);
          
          // Обновить последнюю активность
          if (new Date(item.created_at) > new Date(acc[userId].last_activity)) {
            acc[userId].last_activity = item.created_at;
          }

          return acc;
        }, {} as Record<string, UserUsage>);

        // Получить информацию о пользователях
        const userIds = Object.keys(userMap);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, name')
            .in('id', userIds);

          if (profiles) {
            profiles.forEach(profile => {
              if (userMap[profile.id]) {
                userMap[profile.id].user_email = profile.email || 'Неизвестно';
                userMap[profile.id].user_name = profile.name || 'Пользователь';
              }
            });
          }
        }

        setData(Object.values(userMap));
      }
    } catch (error) {
      console.error('Error loading user usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: 'requests' | 'tokens' | 'cost') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortedData = () => {
    let sorted = [...data];

    // Фильтрация по поиску
    if (searchQuery) {
      sorted = sorted.filter(user => 
        user.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Сортировка
    sorted.sort((a, b) => {
      let aValue = 0, bValue = 0;
      
      switch(sortBy) {
        case 'requests': 
          aValue = a.total_requests; 
          bValue = b.total_requests; 
          break;
        case 'tokens': 
          aValue = a.total_tokens; 
          bValue = b.total_tokens; 
          break;
        case 'cost': 
          aValue = a.total_cost; 
          bValue = b.total_cost; 
          break;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const exportToCSV = () => {
    const sortedData = getSortedData();
    const headers = ['Email', 'Имя', 'Запросы', 'Токены', 'Стоимость ($)', 'Последняя активность'];
    const rows = sortedData.map(user => [
      user.user_email,
      user.user_name,
      user.total_requests,
      user.total_tokens,
      user.total_cost.toFixed(4),
      new Date(user.last_activity).toLocaleString('ru-RU')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user-usage-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedData = getSortedData();
  const totalCost = sortedData.reduce((sum, user) => sum + user.total_cost, 0);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-flex admin-justify-between admin-items-center admin-flex-wrap admin-gap-4">
          <div>
            <h3 className="admin-card-title">👥 Использование по пользователям</h3>
            <p className="admin-card-description">
              Детальная статистика по каждому пользователю
            </p>
          </div>
          
          <div className="admin-flex admin-gap-2 admin-flex-wrap">
            {/* Поиск */}
            <input
              type="text"
              placeholder="Поиск пользователя..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input admin-py-2 admin-px-3 admin-text-sm admin-w-48"
            />

            {/* Период */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="admin-input admin-py-2 admin-px-3 admin-text-sm"
            >
              <option value="7d">7 дней</option>
              <option value="30d">30 дней</option>
              <option value="90d">90 дней</option>
              <option value="all">Все время</option>
            </select>

            {/* Экспорт */}
            <button
              onClick={exportToCSV}
              disabled={sortedData.length === 0}
              className="admin-btn admin-btn-outline admin-btn-sm admin-flex admin-items-center admin-gap-2"
            >
              <span>📊</span>
              Экспорт CSV
            </button>

            {/* Обновить */}
            <button
              onClick={loadData}
              disabled={isLoading}
              className="admin-btn admin-btn-primary admin-btn-sm admin-flex admin-items-center admin-gap-2"
            >
              <span>🔄</span>
              {isLoading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card-content">
        {/* Итоговая статистика */}
        <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-4 admin-gap-4 admin-mb-6">
          <div className="admin-bg-blue-50 admin-border admin-border-blue-200 admin-rounded-lg admin-p-4">
            <div className="admin-text-sm admin-text-blue-600 admin-mb-1">Всего пользователей</div>
            <div className="admin-text-2xl admin-font-bold admin-text-blue-900">{sortedData.length}</div>
          </div>
          <div className="admin-bg-green-50 admin-border admin-border-green-200 admin-rounded-lg admin-p-4">
            <div className="admin-text-sm admin-text-green-600 admin-mb-1">Всего запросов</div>
            <div className="admin-text-2xl admin-font-bold admin-text-green-900">
              {sortedData.reduce((sum, u) => sum + u.total_requests, 0).toLocaleString()}
            </div>
          </div>
          <div className="admin-bg-purple-50 admin-border admin-border-purple-200 admin-rounded-lg admin-p-4">
            <div className="admin-text-sm admin-text-purple-600 admin-mb-1">Всего токенов</div>
            <div className="admin-text-2xl admin-font-bold admin-text-purple-900">
              {sortedData.reduce((sum, u) => sum + u.total_tokens, 0).toLocaleString()}
            </div>
          </div>
          <div className="admin-bg-orange-50 admin-border admin-border-orange-200 admin-rounded-lg admin-p-4">
            <div className="admin-text-sm admin-text-orange-600 admin-mb-1">Общая стоимость</div>
            <div className="admin-text-2xl admin-font-bold admin-text-orange-900">
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Таблица */}
        {isLoading ? (
          <div className="admin-flex admin-justify-center admin-items-center admin-h-64">
            <div className="admin-spinner admin-w-8 admin-h-8" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="admin-text-center admin-py-12 admin-text-gray-500">
            <div className="admin-text-4xl admin-mb-4">👥</div>
            <p>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="admin-overflow-x-auto">
            <table className="admin-w-full admin-text-sm">
              <thead className="admin-bg-gray-50 admin-border-b admin-border-gray-200">
                <tr>
                  <th className="admin-px-4 admin-py-3 admin-text-left admin-font-semibold admin-text-gray-700">
                    Пользователь
                  </th>
                  <th 
                    className="admin-px-4 admin-py-3 admin-text-right admin-font-semibold admin-text-gray-700 admin-cursor-pointer hover:admin-bg-gray-100"
                    onClick={() => handleSort('requests')}
                  >
                    Запросы {sortBy === 'requests' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="admin-px-4 admin-py-3 admin-text-right admin-font-semibold admin-text-gray-700 admin-cursor-pointer hover:admin-bg-gray-100"
                    onClick={() => handleSort('tokens')}
                  >
                    Токены {sortBy === 'tokens' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="admin-px-4 admin-py-3 admin-text-right admin-font-semibold admin-text-gray-700 admin-cursor-pointer hover:admin-bg-gray-100"
                    onClick={() => handleSort('cost')}
                  >
                    Стоимость {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="admin-px-4 admin-py-3 admin-text-right admin-font-semibold admin-text-gray-700">
                    Последняя активность
                  </th>
                </tr>
              </thead>
              <tbody className="admin-divide-y admin-divide-gray-200">
                {sortedData.map((user) => (
                  <tr key={user.user_id} className="hover:admin-bg-gray-50 admin-transition-colors">
                    <td className="admin-px-4 admin-py-3">
                      <div>
                        <div className="admin-font-medium admin-text-gray-900">{user.user_name}</div>
                        <div className="admin-text-xs admin-text-gray-500">{user.user_email}</div>
                      </div>
                    </td>
                    <td className="admin-px-4 admin-py-3 admin-text-right admin-font-medium admin-text-gray-900">
                      {user.total_requests.toLocaleString()}
                    </td>
                    <td className="admin-px-4 admin-py-3 admin-text-right admin-font-medium admin-text-gray-900">
                      {user.total_tokens.toLocaleString()}
                    </td>
                    <td className="admin-px-4 admin-py-3 admin-text-right admin-font-medium admin-text-gray-900">
                      ${user.total_cost.toFixed(4)}
                    </td>
                    <td className="admin-px-4 admin-py-3 admin-text-right admin-text-xs admin-text-gray-600">
                      {new Date(user.last_activity).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
