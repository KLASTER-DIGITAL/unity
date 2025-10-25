import type { LucideIcon } from "lucide-react";

/**
 * AdminDashboard - Type definitions
 */

export interface AdminDashboardProps {
  userData?: any;
  onLogout: () => void;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  newUsersToday: number;
  activeToday: number;
  totalEntries: number;
  pwaInstalls: number;
}

export type TabId = "overview" | "users" | "subscriptions" | "ai-analytics" | "pwa" | "developer" | "settings";
export type PWASubTab = "overview" | "settings" | "push" | "analytics" | "cache";

export interface MenuItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  menuItems: MenuItem[];
  activeTab: TabId;
  userData?: any;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
}

export interface MobileSidebarProps extends SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OverviewTabProps {
  stats: AdminStats;
  isLoading: boolean;
  onRefresh: () => void;
}
