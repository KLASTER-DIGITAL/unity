/**
 * AdminDashboard - Constants
 */

export const SUPER_ADMIN_EMAIL = "diary@leadshunter.biz";

export const INITIAL_STATS = {
  totalUsers: 0,
  activeUsers: 0,
  premiumUsers: 0,
  totalRevenue: 0,
  newUsersToday: 0,
  activeToday: 0,
  totalEntries: 0,
  pwaInstalls: 0
};

export const PWA_SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'settings', label: 'Settings' },
  { id: 'push', label: 'Push Notifications' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'cache', label: 'Cache' },
] as const;

