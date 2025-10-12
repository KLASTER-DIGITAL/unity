import { useState, useEffect } from "react";
import { Search, MoreVertical, Mail, Calendar, TrendingUp, Ban, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { createClient } from "../../../utils/supabase/client";

export function UsersManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "premium" | "blocked">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Получаем токен авторизации
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session');
      }
      
      // Загружаем реальных пользователей
      const response = await fetch(
        `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const result = await response.json();
      
      // Преобразуем данные к нужному формату
      const formattedUsers = result.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.isPremium ? "premium" : "active",
        registeredAt: user.createdAt,
        lastActive: user.lastActivity,
        entriesCount: user.entriesCount,
        streak: 0 // TODO: добавить streak в API
      }));
      
      setUsers(formattedUsers);
      setTotalPages(Math.ceil(result.total / 50));
      
      console.log(`Loaded ${formattedUsers.length} users`);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePremium = async (userId: string, currentStatus: string) => {
    try {
      const newIsPremium = currentStatus !== 'premium';
      // await updateUserSubscription(userId, newIsPremium);
      // Заглушка - будет заменено на работу с Edge Function
      
      toast.success(`Подписка ${newIsPremium ? 'активирована' : 'деактивирована'}`);
      loadUsers(); // Перезагружаем список
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Ошибка обновления подписки');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "premium":
        return <Badge className="bg-accent/10 text-accent border-accent">Premium</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Активный</Badge>;
      case "blocked":
        return <Badge variant="destructive">Заблокирован</Badge>;
      default:
        return <Badge variant="outline">Неактивный</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>Просмотр и управление аккаунтами пользователей</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="!text-[13px]"
              >
                Все
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className="!text-[13px]"
              >
                Активные
              </Button>
              <Button
                variant={filterStatus === "premium" ? "default" : "outline"}
                onClick={() => setFilterStatus("premium")}
                className="!text-[13px]"
              >
                Premium
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Зарегистрирован</TableHead>
                  <TableHead>Записей</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="!text-[14px] !font-semibold text-foreground">{user.name}</div>
                        <div className="!text-[12px] !font-normal text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="!text-[13px]">
                      {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString('ru-RU') : '-'}
                    </TableCell>
                    <TableCell className="!text-[13px]">{user.entriesCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-accent/10 text-accent">
                        🔥 {user.streak}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Отправить email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePremium(user.id, user.status)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {user.status === 'premium' ? 'Отменить Premium' : 'Выдать Premium'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="w-4 h-4 mr-2" />
                            Заблокировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Пользователи не найдены</p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперёд
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
