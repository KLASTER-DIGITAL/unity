/**
 * AdminDashboard - Constants
 */

// ✅ SECURITY FIX: Removed hardcoded SUPER_ADMIN_EMAIL
// Use profile.role === 'super_admin' instead for role checks
// This allows multiple super admins and follows Single Source of Truth principle

export const INITIAL_STATS = {
	totalUsers: 0,
	activeUsers: 0,
	premiumUsers: 0,
	totalRevenue: 0,
	newUsersToday: 0,
	activeToday: 0,
	totalEntries: 0,
	pwaInstalls: 0,
};

export const PWA_SUB_TABS = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'settings', label: 'Settings' },
	{ id: 'push', label: 'Push Notifications' },
	{ id: 'analytics', label: 'Analytics' },
	{ id: 'cache', label: 'Cache' },
] as const;
