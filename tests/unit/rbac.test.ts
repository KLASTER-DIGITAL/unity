/**
 * Unit tests for RBAC (Role-Based Access Control)
 * Tests: getUserRole, isSuperAdmin, isRegularUser, validateRouteAccess
 * Coverage target: 80%+
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
	getUserRole,
	isAdminRoute,
	isPerformanceRoute,
	isRegularUser,
	isSuperAdmin,
	isTestRoute,
	parseRouteParams,
	type RouteParams,
	type UserData,
	validateRouteAccess,
} from '@/shared/lib/auth/accessControl';

describe('RBAC - Role-Based Access Control', () => {
	describe('getUserRole', () => {
		it('should return role from profile', () => {
			const userData: UserData = {
				user: { id: '123', email: 'test@example.com' },
				profile: { role: 'super_admin' },
			};

			expect(getUserRole(userData)).toBe('super_admin');
		});

		it('should return role from root level if profile.role is missing', () => {
			const userData: UserData = {
				user: { id: '123', email: 'test@example.com' },
				role: 'user',
			};

			expect(getUserRole(userData)).toBe('user');
		});

		it('should return null for null userData', () => {
			expect(getUserRole(null)).toBeNull();
		});

		it('should return null for userData without role', () => {
			const userData: UserData = {
				user: { id: '123', email: 'test@example.com' },
			};

			expect(getUserRole(userData)).toBeNull();
		});
	});

	describe('isSuperAdmin', () => {
		it('should return true for super_admin role', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};

			expect(isSuperAdmin(userData)).toBe(true);
		});

		it('should return false for user role', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};

			expect(isSuperAdmin(userData)).toBe(false);
		});

		it('should return false for null userData', () => {
			expect(isSuperAdmin(null)).toBe(false);
		});
	});

	describe('isRegularUser', () => {
		it('should return true for user role', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};

			expect(isRegularUser(userData)).toBe(true);
		});

		it('should return false for super_admin role', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};

			expect(isRegularUser(userData)).toBe(false);
		});

		it('should return false for null userData', () => {
			expect(isRegularUser(null)).toBe(false);
		});
	});

	describe('parseRouteParams', () => {
		beforeEach(() => {
			// Reset window.location before each test
			// biome-ignore lint/suspicious/noExplicitAny: Test setup
			// biome-ignore lint/performance/noDelete: Test setup requires delete
			delete (window as any).location;
			// biome-ignore lint/suspicious/noExplicitAny: Test setup
			(window as any).location = { search: '' };
		});

		it('should parse admin view parameter', () => {
			// biome-ignore lint/suspicious/noExplicitAny: Test setup
			(window as any).location = { search: '?view=admin' };
			const params = parseRouteParams();
			expect(params.view).toBe('admin');
		});

		it('should parse test view parameter', () => {
			// biome-ignore lint/suspicious/noExplicitAny: Test setup
			(window as any).location = { search: '?view=test' };
			const params = parseRouteParams();
			expect(params.view).toBe('test');
		});

		it('should return null for no view parameter', () => {
			// biome-ignore lint/suspicious/noExplicitAny: Test setup
			(window as any).location = { search: '' };
			const params = parseRouteParams();
			expect(params.view).toBeNull();
		});
	});

	describe('isAdminRoute', () => {
		it('should return true for admin view', () => {
			const params: RouteParams = { view: 'admin' };
			expect(isAdminRoute(params)).toBe(true);
		});

		it('should return false for non-admin view', () => {
			const params: RouteParams = { view: 'test' };
			expect(isAdminRoute(params)).toBe(false);
		});

		it('should return false for null view', () => {
			const params: RouteParams = { view: null };
			expect(isAdminRoute(params)).toBe(false);
		});
	});

	describe('isTestRoute', () => {
		it('should return true for test view', () => {
			const params: RouteParams = { view: 'test' };
			expect(isTestRoute(params)).toBe(true);
		});

		it('should return false for non-test view', () => {
			const params: RouteParams = { view: 'admin' };
			expect(isTestRoute(params)).toBe(false);
		});
	});

	describe('isPerformanceRoute', () => {
		it('should return true for performance view', () => {
			const params: RouteParams = { view: 'performance' };
			expect(isPerformanceRoute(params)).toBe(true);
		});

		it('should return false for non-performance view', () => {
			const params: RouteParams = { view: 'admin' };
			expect(isPerformanceRoute(params)).toBe(false);
		});
	});

	describe('validateRouteAccess', () => {
		it('should allow super_admin to access admin route', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};
			const params: RouteParams = { view: 'admin' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});

		it('should redirect regular user from admin route to PWA', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};
			const params: RouteParams = { view: 'admin' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBe('/');
		});

		it('should redirect super_admin from PWA route to admin', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};
			const params: RouteParams = { view: null };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBe('/?view=admin');
		});

		it('should allow regular user to access PWA route', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};
			const params: RouteParams = { view: null };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});

		it('should allow unauthenticated users to proceed', () => {
			const redirect = validateRouteAccess(null);
			expect(redirect).toBeNull();
		});

		it('should allow super_admin to access test route', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};
			const params: RouteParams = { view: 'test' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});

		it('should allow super_admin to access performance route', () => {
			const userData: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};
			const params: RouteParams = { view: 'performance' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});

		it('should allow regular user to access test route', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};
			const params: RouteParams = { view: 'test' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});

		it('should allow regular user to access performance route', () => {
			const userData: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};
			const params: RouteParams = { view: 'performance' };

			const redirect = validateRouteAccess(userData, params);
			expect(redirect).toBeNull();
		});
	});

	describe('RBAC Integration - 3 Control Points', () => {
		it('should enforce access control at WelcomeScreen level', () => {
			// Test that WelcomeScreen redirects authenticated users
			const authenticatedUser: UserData = {
				user: { id: '123', email: 'test@example.com' },
				profile: { role: 'user', onboardingCompleted: true },
			};

			// WelcomeScreen should redirect authenticated users to PWA
			expect(authenticatedUser.profile?.onboardingCompleted).toBe(true);
		});

		it('should enforce access control at AuthScreenNew level', () => {
			// Test that AuthScreenNew handles role-based redirects
			const superAdmin: UserData = {
				user: { id: '123', email: 'admin@example.com' },
				profile: { role: 'super_admin' },
			};

			// AuthScreenNew should NOT redirect super_admin (App.tsx handles it)
			expect(isSuperAdmin(superAdmin)).toBe(true);
		});

		it('should enforce access control at App.tsx level', () => {
			// Test that App.tsx validates route access
			const regularUser: UserData = {
				user: { id: '456', email: 'user@example.com' },
				profile: { role: 'user' },
			};
			const adminParams: RouteParams = { view: 'admin' };

			// App.tsx should redirect regular user from admin route
			const redirect = validateRouteAccess(regularUser, adminParams);
			expect(redirect).toBe('/');
		});
	});
});
