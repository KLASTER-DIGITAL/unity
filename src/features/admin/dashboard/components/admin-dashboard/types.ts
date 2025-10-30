import type { LucideIcon } from 'lucide-react';

/**
 * AdminDashboard - Type definitions
 */

export type AdminDashboardProps = {
	userData?: any;
	onLogout: () => void;
};

export type AdminStats = {
	totalUsers: number;
	activeUsers: number;
	premiumUsers: number;
	totalRevenue: number;
	newUsersToday: number;
	activeToday: number;
	totalEntries: number;
	pwaInstalls: number;
};

export type TabId =
	| 'overview'
	| 'users'
	| 'subscriptions'
	| 'ai-analytics'
	| 'pwa'
	| 'developer'
	| 'settings'
	| 'test-lab';
export type PWASubTab = 'overview' | 'settings' | 'push' | 'analytics' | 'cache';

export type MenuItem = {
	id: TabId;
	label: string;
	icon: LucideIcon;
};

export type SidebarProps = {
	menuItems: MenuItem[];
	activeTab: TabId;
	userData?: any;
	onTabChange: (tab: TabId) => void;
	onLogout: () => void;
};

export interface MobileSidebarProps extends SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export type OverviewTabProps = {
	stats: AdminStats;
	isLoading: boolean;
	onRefresh: () => void;
};
