// Vitest-specific jest-dom matchers
// See: https://github.com/testing-library/jest-dom#with-vitest
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Ensure window exists even in edge cases where environment is not jsdom yet
if (typeof window === 'undefined') {
	// biome-ignore lint/suspicious/noExplicitAny: globalThis typing is limited in test env
	(globalThis as any).window = globalThis;
}

afterEach(() => {
	cleanup();
});

// Global matchMedia mock for jsdom environment (used in mobile components)
if (typeof window !== 'undefined' && !window.matchMedia) {
	// biome-ignore lint/suspicious/noExplicitAny: jsdom window typing is limited
	(window as any).matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
}

// Mock canvas-confetti globally to avoid jsdom canvas errors in tests
vi.mock('canvas-confetti', () => ({
	__esModule: true,
	default: () => ({
		// biome-ignore lint/suspicious/noEmptyBlockStatements: mock function intentionally empty
		fire: () => {},
	}),
}));
