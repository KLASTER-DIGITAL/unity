import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CreditCard,
  Settings,
  Smartphone,
  Shield,
  LayoutDashboard,
  Brain,
  Menu,
  LogOut,
  Code
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/lib/i18n";
import { UsersManagementTab } from "./UsersManagementTab";
import { SubscriptionsTab } from "@/features/admin/settings";
import { SettingsTab } from "@/features/admin/settings";
import { AIAnalyticsTab } from "@/features/admin/analytics";
import { PWAOverview, PWASettings, PushNotifications, PWAAnalytics, PWACache } from "@/features/admin/pwa";
import { CompactErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ReactNativeReadinessTest } from "@/features/admin/components/ReactNativeReadinessTest";
import { PerformanceDashboard } from "@/features/admin/components/PerformanceDashboard";

// Import modular components
import {
  DesktopSidebar,
  MobileSidebar,
  OverviewTab,
  loadAdminStats,
  isSuperAdmin as checkSuperAdmin,
  INITIAL_STATS
} from "./admin-dashboard";
import type { AdminDashboardProps, AdminStats, MenuItem, TabId, PWASubTab } from "./admin-dashboard";

// Re-export types for backward compatibility
export type { AdminDashboardProps };

export function AdminDashboard({ userData, onLogout }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState("pwa");
  const [pwaSubTab, setPwaSubTab] = useState<PWASubTab>("overview");
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
        console.log('[AdminDashboard] admin-navigate event:', { tab, subtab, pwaSubTab: pwaSubTabParam });
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

  const menuItems: MenuItem[] = [
    { id: "overview", label: t('admin_overview', 'Обзор'), icon: LayoutDashboard },
    { id: "users", label: t('admin_users', 'Пользователи'), icon: Users },
    { id: "subscriptions", label: t('admin_subscriptions', 'Подписки'), icon: CreditCard },
    { id: "ai-analytics", label: t('admin_ai_analytics', 'AI Analytics'), icon: Brain },
    { id: "pwa", label: t('admin_pwa', 'PWA'), icon: Smartphone },
    { id: "developer", label: t('admin_developer', 'Developer Tools'), icon: Code },
    { id: "settings", label: t('admin_settings', 'Настройки'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        menuItems={menuItems}
        activeTab={activeTab}
        userData={userData}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        menuItems={menuItems}
        activeTab={activeTab}
        userData={userData}
        isOpen={isSidebarOpen}
        onTabChange={setActiveTab}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-(--radius) hover:bg-muted flex items-center justify-center"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-foreground text-[17px]!">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
            </div>

            <button
              onClick={onLogout}
              className="lg:hidden w-10 h-10 rounded-(--radius) hover:bg-muted flex items-center justify-center"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="w-full"
            >
              <CompactErrorBoundary>
                {(() => {
                  console.log('[AdminDashboard] Rendering content for activeTab:', activeTab);
                  return null;
                })()}
                {activeTab === "overview" && <OverviewTab stats={stats} isLoading={isLoadingStats} onRefresh={handleLoadStats} />}
                {activeTab === "users" && <UsersManagementTab />}
                {activeTab === "subscriptions" && <SubscriptionsTab />}
                {activeTab === "ai-analytics" && <AIAnalyticsTab />}
                {activeTab === "pwa" && (
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
                          variant={pwaSubTab === tab.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPwaSubTab(tab.id)}
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
                {activeTab === "developer" && (
                  <div className="space-y-6">
                    <PerformanceDashboard />
                    <ReactNativeReadinessTest />
                  </div>
                )}
                {activeTab === "settings" && (
                  <SettingsTab
                    activeSubTab={settingsSubTab}
                    onSubTabChange={setSettingsSubTab}
                  />
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
