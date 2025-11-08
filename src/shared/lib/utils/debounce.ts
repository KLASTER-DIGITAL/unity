/**
 * Debounce utility for optimizing INP (Interaction to Next Paint)
 *
 * Delays function execution until after a specified wait time has elapsed
 * since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the function
 *
 * @example
 * ```tsx
 * const handleSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * // In component:
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number = 300
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

/**
 * Throttle utility for limiting function execution frequency
 *
 * Ensures a function is called at most once in a specified time period.
 *
 * @param func - The function to throttle
 * @param limit - The minimum time between function calls in milliseconds (default: 300ms)
 * @returns A throttled version of the function
 *
 * @example
 * ```tsx
 * const handleScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number = 300
): (...args: Parameters<T>) => void {
	let inThrottle: boolean = false;

	return function executedFunction(...args: Parameters<T>) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}
