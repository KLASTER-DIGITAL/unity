import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  CreditCard, 
  Settings, 
  Smartphone,
  Shield,
  Database,
  Activity,
  UserCheck,
  DollarSign,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { UsersManagementTab } from "./admin/UsersManagementTab";
import { SubscriptionsTab } from "./admin/SubscriptionsTab";
import { SettingsTab } from "./admin/SettingsTab";
import { createClient } from "../../utils/supabase/client";

interface AdminDashboardProps {
  userData?: any;
  onLogout: () => void;
}

const SUPER_ADMIN_EMAIL = "diary@leadshunter.biz";

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState("pwa");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    activeToday: 0,
    totalEntries: 0,
    pwaInstalls: 0
  });

  // Проверка прав супер-админа
  const isSuperAdmin = userData?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (isSuperAdmin) {
      loadStats();
    }
  }, [isSuperAdmin]);

  // Слушаем события навигации
  useEffect(() => {
    const handleAdminNavigate = (event: any) => {
      const { tab, subtab } = event.detail;
      if (tab) {
        setActiveTab(tab);
      }
      if (subtab) {
        setSettingsSubTab(subtab);
      }
    };

    window.addEventListener('admin-navigate', handleAdminNavigate as EventListener);
    return () => {
      window.removeEventListener('admin-navigate', handleAdminNavigate as EventListener);
    };
  }, []);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Получаем токен авторизации
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session');
      }

      // Загружаем реальные данные с сервера
      const response = await fetch(
        `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.stats);
      
      console.log('Admin stats loaded:', data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Ошибка загрузки статистики');
      
      // Fallback к пустым данным при ошибке
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        totalRevenue: 0,
        newUsersToday: 0,
        activeToday: 0,
        totalEntries: 0,
        pwaInstalls: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Если не супер-админ, показываем ошибку
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
              <p className="text-foreground mb-2">Доступ запрещён</p>
              <p className="text-muted-foreground mb-6">
                У вас нет прав для доступа к панели администратора
              </p>
              <Button onClick={onLogout} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Выйти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Обзор", icon: LayoutDashboard },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "subscriptions", label: "Подписки", icon: CreditCard },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-card lg:border-r lg:border-border">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6 bg-accent">
          <div className="w-10 h-10 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white !text-[17px]">Admin Panel</h1>
            <p className="text-white/80 !text-[13px] !font-normal">Дневник Достижений</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all !text-[15px]
                  ${isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted rounded-[var(--radius)]">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0">
              {userData?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="!text-[14px] text-foreground truncate">{userData?.email}</p>
              <p className="!text-[12px] text-muted-foreground !font-normal">Супер-администратор</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 !text-[15px]"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Выход
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden overflow-y-auto"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-6 bg-accent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white !text-[17px]">Admin</h1>
                    <p className="text-white/80 !text-[13px] !font-normal">Панель управления</p>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all !text-[15px]
                        ${isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted rounded-[var(--radius)]">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0">
                    {userData?.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="!text-[14px] text-foreground truncate">{userData?.email}</p>
                    <p className="!text-[12px] text-muted-foreground !font-normal">Супер-админ</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 !text-[15px]"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Выход
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-[var(--radius)] hover:bg-muted flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-foreground !text-[17px]">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
            </div>

            <button
              onClick={onLogout}
              className="lg:hidden w-10 h-10 rounded-[var(--radius)] hover:bg-muted flex items-center justify-center"
              title="Выход"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <OverviewTab stats={stats} isLoading={isLoadingStats} onRefresh={loadStats} />}
              {activeTab === "users" && <UsersManagementTab />}
              {activeTab === "subscriptions" && <SubscriptionsTab />}
              {activeTab === "settings" && <SettingsTab activeSubTab={settingsSubTab} onSubTabChange={setSettingsSubTab} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, isLoading, onRefresh }: { stats: any, isLoading: boolean, onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="!text-[26px] text-foreground">Обзор системы</h3>
          <p className="!text-[15px] text-muted-foreground !font-normal">Статистика и метрики приложения</p>
        </div>
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Всего пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">{stats.totalUsers}</div>
            <p className="!text-[13px] text-accent !font-normal mt-1">
              +{stats.newUsersToday} сегодня
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Активные пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">{stats.activeUsers}</div>
            <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% от всех
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Premium подписки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">{stats.premiumUsers}</div>
            <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% конверсия
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Общий доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">${stats.totalRevenue}</div>
            <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
              ${stats.premiumUsers > 0 ? Math.round(stats.totalRevenue / stats.premiumUsers) : 0} ARPU
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Всего записей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">{stats.totalEntries}</div>
            <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
              {stats.activeUsers > 0 ? (stats.totalEntries / stats.activeUsers).toFixed(1) : 0} на активного пользователя
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="!text-[13px] !font-normal text-muted-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              PWA установок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="!text-[34px] text-foreground">{stats.pwaInstalls}</div>
            <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.pwaInstalls / stats.totalUsers) * 100) : 0}% от всех пользователей
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="!text-[17px]">Быстрые действия</CardTitle>
          <CardDescription className="!text-[13px] !font-normal">Управление ключевыми функциями приложения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 border-border"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'settings', subtab: 'pwa' } }))}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="!text-[15px] text-foreground">Настройки PWA</p>
                  <p className="!text-[13px] text-muted-foreground !font-normal">
                    Управление установкой и обновлениями
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 border-border"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'settings', subtab: 'push' } }))}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="!text-[15px] text-foreground">Push-уведомления</p>
                  <p className="!text-[13px] text-muted-foreground !font-normal">
                    Отправка уведомлений пользователям
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 border-border"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'users' } }))}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="!text-[15px] text-foreground">Управление пользователями</p>
                  <p className="!text-[13px] text-muted-foreground !font-normal">
                    Просмотр и редактирование пользователей
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-4 border-border"
              onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'subscriptions' } }))}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="!text-[15px] text-foreground">Управление подписками</p>
                  <p className="!text-[13px] text-muted-foreground !font-normal">
                    Premium подписки и платежи
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 !text-[17px]">
            <Activity className="w-5 h-5" />
            Статус системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="!text-[15px] text-foreground">База данных</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 !text-[13px]">
                Работает
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="!text-[15px] text-foreground">API сервер</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 !text-[13px]">
                Работает
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="!text-[15px] text-foreground">Service Worker</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 !text-[13px]">
                Активен v1.0.3
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="!text-[15px] text-foreground">Push-уведомления</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 !text-[13px]">
                Включено
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
