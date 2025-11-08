/**
 * AdminDashboard - Modular exports
 */

// ✅ SECURITY FIX: Removed SUPER_ADMIN_EMAIL export (hardcoded email removed)
export { INITIAL_STATS, PWA_SUB_TABS } from './constants';
export { DesktopSidebar } from './DesktopSidebar';
export { MobileSidebar } from './MobileSidebar';
export { OverviewTab } from './OverviewTab';
export { QuickActions } from './QuickActions';
export { StatsCard } from './StatsCard';
export { SystemStatus } from './SystemStatus';
export type {
	AdminDashboardProps,
	AdminStats,
	MenuItem,
	MobileSidebarProps,
	OverviewTabProps,
	PWASubTab,
	SidebarProps,
	TabId,
} from './types';
export { isSuperAdmin, loadAdminStats } from './utils';
