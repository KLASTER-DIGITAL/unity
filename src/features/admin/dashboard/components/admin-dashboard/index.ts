/**
 * AdminDashboard - Modular exports
 */

export { DesktopSidebar } from "./DesktopSidebar";
export { MobileSidebar } from "./MobileSidebar";
export { OverviewTab } from "./OverviewTab";
export { loadAdminStats, isSuperAdmin } from "./utils";
export { SUPER_ADMIN_EMAIL, INITIAL_STATS, PWA_SUB_TABS } from "./constants";
export type {
  AdminDashboardProps,
  AdminStats,
  MenuItem,
  SidebarProps,
  MobileSidebarProps,
  OverviewTabProps,
  TabId,
  PWASubTab
} from "./types";

