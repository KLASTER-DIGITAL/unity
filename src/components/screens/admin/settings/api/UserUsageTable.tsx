import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { supabase } from '../../../../../utils/supabase/client';
import { Users, Search, RefreshCw, Loader2, ArrowUpDown } from 'lucide-react';

interface UserUsage {
  user_id: string;
  user_email: string;
  user_name: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  last_activity: string;
}

export function UserUsageTable() {
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Использование по пользователям
            </CardTitle>
            <CardDescription>
              Детальная статистика по каждому пользователю
            </CardDescription>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск пользователя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48"
              />
            </div>

            {/* Период */}
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="90d">90 дней</SelectItem>
                <SelectItem value="all">Все время</SelectItem>
              </SelectContent>
            </Select>

            {/* Экспорт */}
            <Button
              onClick={exportToCSV}
              disabled={sortedData.length === 0}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Экспорт CSV
            </Button>

            {/* Обновить */}
            <Button
              onClick={loadData}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Загрузка...' : 'Обновить'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Итоговая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Всего пользователей</div>
            <div className="text-2xl font-bold text-blue-900">{sortedData.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Всего запросов</div>
            <div className="text-2xl font-bold text-green-900">
              {sortedData.reduce((sum, u) => sum + u.total_requests, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">Всего токенов</div>
            <div className="text-2xl font-bold text-purple-900">
              {sortedData.reduce((sum, u) => sum + u.total_tokens, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 mb-1">Общая стоимость</div>
            <div className="text-2xl font-bold text-orange-900">
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Таблица */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Пользователь
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('requests')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Запросы
                      {sortBy === 'requests' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('tokens')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Токены
                      {sortBy === 'tokens' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('cost')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Стоимость
                      {sortBy === 'cost' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Последняя активность
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedData.map((user) => (
                  <tr key={user.user_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{user.user_name}</div>
                        <div className="text-xs text-muted-foreground">{user.user_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {user.total_requests.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {user.total_tokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${user.total_cost.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
