/**
 * Universal Navigation Adapter for UNITY-v2
 *
 * Provides cross-platform navigation that works with both
 * React Router (Web) and React Navigation (React Native)
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import { navigation as platformNavigation } from "./navigation/index";

/**
 * Navigation route parameters
 */
export type RouteParams = {
	[key: string]: string | number | boolean | undefined;
};

/**
 * Navigation options
 */
export type NavigationOptions = {
	replace?: boolean;
	reset?: boolean;
	animate?: boolean;
	params?: RouteParams;
};

/**
 * Universal navigation interface
 */
export type NavigationAdapter = {
	/**
	 * Navigate to a route
	 * @param route - Route name or path
	 * @param options - Navigation options
	 */
	navigate(route: string, options?: NavigationOptions): void;

	/**
	 * Go back to previous route
	 */
	goBack(): void;

	/**
	 * Replace current route
	 * @param route - Route name or path
	 * @param options - Navigation options
	 */
	replace(route: string, options?: NavigationOptions): void;

	/**
	 * Reset navigation stack
	 * @param route - Route name or path
	 * @param options - Navigation options
	 */
	reset(route: string, options?: NavigationOptions): void;

	/**
	 * Get current route name
	 * @returns Current route name
	 */
	getCurrentRoute(): string;

	/**
	 * Check if can go back
	 * @returns True if can go back
	 */
	canGoBack(): boolean;

	/**
	 * Add navigation listener
	 * @param event - Event type
	 * @param callback - Callback function
	 * @returns Unsubscribe function
	 */
	addListener(event: string, callback: (data?: any) => void): () => void;
};

/**
 * Universal navigation instance
 * Re-exported from platform/navigation for backward compatibility
 */
export const navigation: NavigationAdapter = platformNavigation;

/**
 * UNITY app routes
 */
const ROUTES = {
	// Auth routes
	WELCOME: "/",
	ONBOARDING: "/onboarding",
	AUTH: "/auth",

	// Main app routes
	HOME: "/home",
	HISTORY: "/history",
	ACHIEVEMENTS: "/achievements",
	REPORTS: "/reports",
	SETTINGS: "/settings",

	// Admin routes
	ADMIN_LOGIN: "/admin",
	ADMIN_DASHBOARD: "/admin/dashboard",

	// Utility routes
	NOT_FOUND: "/404",
} as const;

type RouteKey = keyof typeof ROUTES;

/**
 * Navigation utilities and route definitions
 */
export const NavigationUtils = {
	routes: ROUTES,

	/**
	 * Navigate to route with type safety
	 */
	navigateTo(route: RouteKey, options?: NavigationOptions): void {
		const routePath = ROUTES[route];
		navigation.navigate(routePath, options);
	},

	/**
	 * Check if current route matches
	 */
	isCurrentRoute(route: RouteKey): boolean {
		const routePath = ROUTES[route];
		const currentRoute = navigation.getCurrentRoute();

		// Handle exact match and path prefix match
		return (
			currentRoute === routePath || currentRoute.startsWith(`${routePath}/`)
		);
	},

	/**
	 * Get route with parameters
	 */
	buildRoute(route: string, params: RouteParams): string {
		let builtRoute = route;

		// Replace path parameters (e.g., /user/:id)
		Object.entries(params).forEach(([key, value]) => {
			builtRoute = builtRoute.replace(`:${key}`, String(value));
		});

		return builtRoute;
	},

	/**
	 * Parse route parameters from current URL
	 */
	getRouteParams(): RouteParams {
		if (typeof window === "undefined") {
			return {};
		}

		const params: RouteParams = {};
		const searchParams = new URLSearchParams(window.location.search);

		searchParams.forEach((value, key) => {
			// Try to parse as number or boolean
			if (value === "true") {
				params[key] = true;
			} else if (value === "false") {
				params[key] = false;
			} else if (!Number.isNaN(Number(value))) {
				params[key] = Number(value);
			} else {
				params[key] = value;
			}
		});

		return params;
	},
};
