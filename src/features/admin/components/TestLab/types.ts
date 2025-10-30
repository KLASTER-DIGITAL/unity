/**
 * Device types for testing
 */
export type DeviceType =
	| 'iphone-15-pro'
	| 'android'
	| 'safari'
	| 'chrome-mobile'
	| 'yandex-browser';

/**
 * Platform mode for testing
 */
export type PlatformMode = 'web' | 'react-native';

/**
 * Device configuration
 */
export type DeviceConfig = {
	id: DeviceType;
	name: string;
	icon: string;
	width: number;
	height: number;
	description: string;
};

/**
 * Test Lab state
 */
export type TestLabState = {
	selectedDevice: DeviceType;
	platformMode: PlatformMode;
	previewUrl: string;
	isInspectorOpen: boolean;
};

/**
 * Available devices configuration
 */
export const DEVICES: Record<DeviceType, DeviceConfig> = {
	'iphone-15-pro': {
		id: 'iphone-15-pro',
		name: 'iPhone 15 Pro',
		icon: 'Smartphone',
		width: 393,
		height: 852,
		description: 'iOS 17, Dynamic Island, 6.1" OLED',
	},
	android: {
		id: 'android',
		name: 'Android Phone',
		icon: 'Smartphone',
		width: 412,
		height: 915,
		description: 'Android 14, 6.5" AMOLED',
	},
	safari: {
		id: 'safari',
		name: 'Safari Browser',
		icon: 'Globe',
		width: 1203,
		height: 753,
		description: 'macOS Safari, Desktop',
	},
	'chrome-mobile': {
		id: 'chrome-mobile',
		name: 'Chrome Mobile',
		icon: 'Chrome',
		width: 1203,
		height: 753,
		description: 'Chrome for Android/iOS',
	},
	'yandex-browser': {
		id: 'yandex-browser',
		name: 'Yandex Browser',
		icon: 'Globe',
		width: 1203,
		height: 753,
		description: 'Yandex Browser, Desktop/Mobile',
	},
};

/**
 * Default Test Lab state
 */
export const DEFAULT_TEST_LAB_STATE: TestLabState = {
	selectedDevice: 'iphone-15-pro',
	platformMode: 'web',
	previewUrl: import.meta.env.DEV ? 'http://localhost:3000' : 'https://unity-wine.vercel.app',
	isInspectorOpen: false,
};
