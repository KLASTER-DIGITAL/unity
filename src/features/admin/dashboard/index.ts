/**
 * Admin Dashboard feature - Main admin panel with user management
 *
 * Components:
 * - AdminDashboard: Main admin dashboard with tabs and statistics
 * - UsersManagementTab: User management interface with search and filters (lazy loaded)
 */

// Components
export { AdminDashboard } from './components/AdminDashboard';
// ✅ PERFORMANCE: UsersManagementTab is lazy loaded via LazyTabs.tsx
// Do NOT export directly to prevent static import
// export { UsersManagementTab } from './components/UsersManagementTab';
