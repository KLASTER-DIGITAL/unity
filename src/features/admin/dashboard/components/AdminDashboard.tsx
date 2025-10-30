import {
  Brain,
  Code,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Smartphone,
  TestTube,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { AIAnalyticsTab } from '@/features/admin/analytics';
import { PerformanceDashboard } from '@/features/admin/components/PerformanceDashboard';
import { ReactNativeReadinessTest } from '@/features/admin/components/ReactNativeReadinessTest';
import { TestLab } from '@/features/admin/components/TestLab';
import {
  PushNotifications,
  PWAAnalytics,
  PWACache,
  PWAOverview,
  PWASettings,
} from '@/features/admin/pwa';
import { SettingsTab, SubscriptionsTab } from '@/features/admin/settings';
import { CompactErrorBoundary } from '@/shared/components/ErrorBoundary';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useTranslation } from '@/shared/lib/i18n';
import type {
  AdminDashboardProps,
  AdminStats,
  MenuItem,
  PWASubTab,
  TabId,
} from './admin-dashboard';

// Import modular components
import {
  isSuperAdmin as checkSuperAdmin,
  DesktopSidebar,
  INITIAL_STATS,
  loadAdminStats,
  MobileSidebar,
  OverviewTab,
} from './admin-dashboard';
import { UsersManagementTab } from './UsersManagementTab';

// Re-export types for backward compatibility
export type { AdminDashboardProps };

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState('pwa');
  const [pwaSubTab, setPwaSubTab] = useState<PWASubTab>('overview');
  const [stats, setStats] = useState<AdminStats>(INITIAL_STATS);

  // Проверка прав супер-админа
  const isSuperAdmin = checkSuperAdmin(userData);

  // Memoized stats loader to avoid recreation
  const handleLoadStats = useCallback(async () => {
    setIsLoadingStats(true);
    const statsData = await loadAdminStats(t as any);
    setStats(statsData);
    setIsLoadingStats(false);
  }, [t]);

  // Load stats when super admin status changes
  useEffect(() => {
    if (isSuperAdmin) {
      handleLoadStats();
    }
  }, [isSuperAdmin, handleLoadStats]);

  // Логирование изменений activeTab (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[AdminDashboard] activeTab changed:', activeTab);
    }
  }, [activeTab]);

  // Слушаем события навигации - memoized handler
  useEffect(() => {
    const handleAdminNavigate = (event: any) => {
      const { tab, subtab, pwaSubTab: pwaSubTabParam } = event.detail;
      if (import.meta.env.DEV) {
        console.log('[AdminDashboard] admin-navigate event:', {
          tab,
          subtab,
          pwaSubTab: pwaSubTabParam,
        });
      }
      if (tab) {
        setActiveTab(tab);
      }
      if (subtab) {
        setSettingsSubTab(subtab);
      }
      if (pwaSubTabParam) {
        setPwaSubTab(pwaSubTabParam);
      }
    };

    window.addEventListener('admin-navigate', handleAdminNavigate as EventListener);
    return () => {
      window.removeEventListener('admin-navigate', handleAdminNavigate as EventListener);
    };
  }, []); // Empty deps - event handler doesn't depend on state

  // Если не супер-админ, показываем ошибку
  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto mb-4 h-16 w-16 text-destructive" />
              <p className="mb-2 text-foreground">Доступ запрещён</p>
              <p className="mb-6 text-muted-foreground">
                У вас нет прав для доступа к панели администратора
              </p>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={onLogout}
              >
                Выйти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { id: 'overview', label: t('admin_overview', 'Обзор'), icon: LayoutDashboard },
    { id: 'users', label: t('admin_users', 'Пользователи'), icon: Users },
    { id: 'subscriptions', label: t('admin_subscriptions', 'Подписки'), icon: CreditCard },
    { id: 'ai-analytics', label: t('admin_ai_analytics', 'AI Analytics'), icon: Brain },
    { id: 'pwa', label: t('admin_pwa', 'PWA'), icon: Smartphone },
    { id: 'test-lab', label: 'Test Lab', icon: TestTube },
    { id: 'developer', label: t('admin_developer', 'Developer Tools'), icon: Code },
    { id: 'settings', label: t('admin_settings', 'Настройки'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        menuItems={menuItems}
        onLogout={onLogout}
        onTabChange={setActiveTab}
        userData={userData}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        activeTab={activeTab}
        isOpen={isSidebarOpen}
        menuItems={menuItems}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        onTabChange={setActiveTab}
        userData={userData}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-border border-b bg-card">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-(--radius) hover:bg-muted lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
              <h2 className="text-[17px]! text-foreground">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
            </div>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-(--radius) hover:bg-muted lg:hidden"
              onClick={onLogout}
              title="Выход"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key={activeTab}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              <CompactErrorBoundary>
                {(() => {
                  console.log('[AdminDashboard] Rendering content for activeTab:', activeTab);
                  return null;
                })()}
                {activeTab === 'overview' && (
                  <OverviewTab
                    isLoading={isLoadingStats}
                    onRefresh={handleLoadStats}
                    stats={stats}
                  />
                )}
                {activeTab === 'users' && <UsersManagementTab />}
                {activeTab === 'subscriptions' && <SubscriptionsTab />}
                {activeTab === 'ai-analytics' && <AIAnalyticsTab />}
                {activeTab === 'pwa' && (
                  <div className="space-y-6">
                    {/* PWA Sub-navigation */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {[
                        { id: 'overview' as PWASubTab, label: 'Overview' },
                        { id: 'settings' as PWASubTab, label: 'Settings' },
                        { id: 'push' as PWASubTab, label: 'Push Notifications' },
                        { id: 'analytics' as PWASubTab, label: 'Analytics' },
                        { id: 'cache' as PWASubTab, label: 'Cache' },
                      ].map((tab) => (
                        <Button
                          key={tab.id}
                          onClick={() => setPwaSubTab(tab.id)}
                          size="sm"
                          variant={pwaSubTab === tab.id ? 'default' : 'outline'}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>

                    {/* PWA Content */}
                    {pwaSubTab === 'overview' && <PWAOverview />}
                    {pwaSubTab === 'settings' && <PWASettings />}
                    {pwaSubTab === 'push' && <PushNotifications />}
                    {pwaSubTab === 'analytics' && <PWAAnalytics />}
                    {pwaSubTab === 'cache' && <PWACache />}
                  </div>
                )}
                {activeTab === 'test-lab' && <TestLab />}
                {activeTab === 'developer' && (
                  <div className="space-y-6">
                    <PerformanceDashboard />
                    <ReactNativeReadinessTest />
                  </div>
                )}
                {activeTab === 'settings' && (
                  <SettingsTab activeSubTab={settingsSubTab} onSubTabChange={setSettingsSubTab} />
                )}
              </CompactErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
