import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

export function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 47280,
    activeSubscriptions: 156,
    churnRate: 3.2,
    mrr: 15600
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // TODO: Загрузка подписок с сервера
      setSubscriptions([
        {
          id: "1",
          userName: "Алексей Иванов",
          userEmail: "alexey@example.com",
          plan: "premium_monthly",
          status: "active",
          startDate: "2024-02-01",
          nextBillingDate: "2024-04-01",
          amount: 399
        },
        {
          id: "2",
          userName: "Мария Петрова",
          userEmail: "maria@example.com",
          plan: "premium_yearly",
          status: "active",
          startDate: "2024-01-15",
          nextBillingDate: "2025-01-15",
          amount: 3990
        },
      ]);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const getPlanBadge = (plan: string) => {
    if (plan === "premium_yearly") {
      return <Badge className="bg-accent/10 text-accent border-accent">Годовая</Badge>;
    }
    return <Badge variant="outline">Месячная</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Активна</Badge>;
    }
    return <Badge variant="outline" className="bg-muted">Отменена</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-[14px] !font-normal text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Общий доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[28px] !font-semibold text-foreground">
              {stats.totalRevenue.toLocaleString()} ₽
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-[14px] !font-normal text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Активных подписок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[28px] !font-semibold text-foreground">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-[14px] !font-normal text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[28px] !font-semibold text-foreground">
              {stats.mrr.toLocaleString()} ₽
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="!text-[14px] !font-normal text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[28px] !font-semibold text-foreground">{stats.churnRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[20px] !font-semibold">Активные подписки</CardTitle>
          <CardDescription>Управление премиум-подписками пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата начала</TableHead>
                  <TableHead>След. платеж</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="!text-[14px] !font-semibold text-foreground">{sub.userName}</div>
                        <div className="!text-[12px] !font-normal text-muted-foreground">{sub.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="!text-[13px]">{sub.startDate}</TableCell>
                    <TableCell className="!text-[13px]">{sub.nextBillingDate}</TableCell>
                    <TableCell className="text-right !text-[14px] !font-semibold">
                      {sub.amount} ₽
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
