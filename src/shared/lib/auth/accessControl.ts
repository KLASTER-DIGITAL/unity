/**
 * Access Control Utilities
 * Centralized role-based access control for UNITY-v2
 */

export type UserRole = 'user' | 'super_admin';

export interface UserData {
  user?: {
    id: string;
    email: string;
  };
  profile?: {
    role?: UserRole;
    name?: string;
    language?: string;
    onboardingCompleted?: boolean;
  };
  role?: UserRole;
  success?: boolean;
}

export interface RouteParams {
  view?: string | null;
}

/**
 * Get user role from userData
 */
export function getUserRole(userData: UserData | null): UserRole | null {
  if (!userData) return null;
  return userData.profile?.role || userData.role || null;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userData: UserData | null): boolean {
  return getUserRole(userData) === 'super_admin';
}

/**
 * Check if user is regular user
 */
export function isRegularUser(userData: UserData | null): boolean {
  return getUserRole(userData) === 'user';
}

/**
 * Parse route parameters from URL
 */
export function parseRouteParams(): RouteParams {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    view: urlParams.get('view')
  };
}

/**
 * Check if current route is admin panel
 */
export function isAdminRoute(params?: RouteParams): boolean {
  const routeParams = params || parseRouteParams();
  return routeParams.view === 'admin';
}

/**
 * Check if current route is test route
 */
export function isTestRoute(params?: RouteParams): boolean {
  const routeParams = params || parseRouteParams();
  return routeParams.view === 'test';
}

/**
 * Check if current route is performance route
 */
export function isPerformanceRoute(params?: RouteParams): boolean {
  const routeParams = params || parseRouteParams();
  return routeParams.view === 'performance';
}

/**
 * Validate access to route based on user role
 * Returns null if access is allowed, or redirect URL if access is denied
 */
export function validateRouteAccess(
  userData: UserData | null,
  params?: RouteParams
): string | null {
  if (!userData) return null; // Not authenticated yet, allow to proceed

  const routeParams = params || parseRouteParams();
  const userRole = getUserRole(userData);
  const isAdmin = isAdminRoute(routeParams);
  const isTest = isTestRoute(routeParams);
  const isPerf = isPerformanceRoute(routeParams);

  // Super admin trying to access PWA (not admin/test/performance)
  if (userRole === 'super_admin' && !isAdmin && !isTest && !isPerf) {
    console.log("🚫 Access denied: super_admin cannot access PWA, redirecting to admin panel");
    return '/?view=admin';
  }

  // Regular user trying to access admin panel
  if (isAdmin && userRole !== 'super_admin') {
    console.log("🚫 Access denied: user role is not super_admin, redirecting to PWA");
    return '/';
  }

  return null; // Access allowed
}

/**
 * Redirect to URL if needed
 */
export function redirectIfNeeded(redirectUrl: string | null): boolean {
  if (redirectUrl) {
    window.location.href = redirectUrl;
    return true;
  }
  return false;
}

/**
 * Check access and redirect if needed
 * Returns true if redirected, false if access is allowed
 */
export function checkAccessAndRedirect(
  userData: UserData | null,
  params?: RouteParams
): boolean {
  const redirectUrl = validateRouteAccess(userData, params);
  return redirectIfNeeded(redirectUrl);
}

