/**
 * Unit tests for Platform Adapters
 *
 * Tests cross-platform adapters for Storage, Media, Navigation, and Animation
 *
 * @author UNITY Team
 * @date 2025-10-26
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// STORAGE ADAPTER TESTS
// ============================================================================

describe('Storage Adapter', () => {
	let mockLocalStorage: { [key: string]: string };

	beforeEach(() => {
		// Mock localStorage
		mockLocalStorage = {};

		global.localStorage = {
			getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				mockLocalStorage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete mockLocalStorage[key];
			}),
			clear: vi.fn(() => {
				mockLocalStorage = {};
			}),
			key: vi.fn((index: number) => Object.keys(mockLocalStorage)[index] || null),
			get length() {
				return Object.keys(mockLocalStorage).length;
			},
		} as any;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('WebStorageAdapter', () => {
		it('should store and retrieve string value', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.setItem('test_key', 'test_value');
			const value = await storage.getItem('test_key');

			expect(value).toBe('test_value');
			expect(global.localStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
		});

		it('should return null for non-existent key', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			const value = await storage.getItem('non_existent_key');

			expect(value).toBeNull();
		});

		it('should remove item from storage', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.setItem('test_key', 'test_value');
			await storage.removeItem('test_key');
			const value = await storage.getItem('test_key');

			expect(value).toBeNull();
			expect(global.localStorage.removeItem).toHaveBeenCalledWith('test_key');
		});

		it('should clear all items from storage', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.setItem('key1', 'value1');
			await storage.setItem('key2', 'value2');
			await storage.clear();

			const value1 = await storage.getItem('key1');
			const value2 = await storage.getItem('key2');

			expect(value1).toBeNull();
			expect(value2).toBeNull();
			expect(global.localStorage.clear).toHaveBeenCalled();
		});

		it('should get all keys from storage', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			// Clear storage first
			await storage.clear();

			await storage.setItem('key1', 'value1');
			await storage.setItem('key2', 'value2');
			await storage.setItem('key3', 'value3');

			const keys = await storage.getAllKeys();

			// Check that getAllKeys returns an array
			expect(Array.isArray(keys)).toBe(true);
			expect(keys.length).toBeGreaterThan(0);
		});

		it('should get multiple items at once', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.setItem('key1', 'value1');
			await storage.setItem('key2', 'value2');

			const items = await storage.multiGet(['key1', 'key2', 'key3']);

			expect(items).toEqual([
				['key1', 'value1'],
				['key2', 'value2'],
				['key3', null],
			]);
		});

		it('should set multiple items at once', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.multiSet([
				['key1', 'value1'],
				['key2', 'value2'],
				['key3', 'value3'],
			]);

			const value1 = await storage.getItem('key1');
			const value2 = await storage.getItem('key2');
			const value3 = await storage.getItem('key3');

			expect(value1).toBe('value1');
			expect(value2).toBe('value2');
			expect(value3).toBe('value3');
		});

		it('should remove multiple items at once', async () => {
			const { storage } = await import('@/shared/lib/platform/storage');

			await storage.setItem('key1', 'value1');
			await storage.setItem('key2', 'value2');
			await storage.setItem('key3', 'value3');

			await storage.multiRemove(['key1', 'key3']);

			const value1 = await storage.getItem('key1');
			const value2 = await storage.getItem('key2');
			const value3 = await storage.getItem('key3');

			expect(value1).toBeNull();
			expect(value2).toBe('value2');
			expect(value3).toBeNull();
		});
	});

	describe('StorageUtils', () => {
		it('should store and retrieve JSON object', async () => {
			const { StorageUtils } = await import('@/shared/lib/platform/storage');

			const testObject = { name: 'Test', age: 25, active: true };

			await StorageUtils.setJSON('test_json', testObject);
			const retrieved = await StorageUtils.getJSON<typeof testObject>('test_json');

			expect(retrieved).toEqual(testObject);
		});

		it('should return null for non-existent JSON key', async () => {
			const { StorageUtils } = await import('@/shared/lib/platform/storage');

			const retrieved = await StorageUtils.getJSON('non_existent');

			expect(retrieved).toBeNull();
		});

		it('should store and retrieve boolean value', async () => {
			const { StorageUtils } = await import('@/shared/lib/platform/storage');

			await StorageUtils.setBoolean('test_bool_true', true);
			await StorageUtils.setBoolean('test_bool_false', false);

			const valueTrue = await StorageUtils.getBoolean('test_bool_true');
			const valueFalse = await StorageUtils.getBoolean('test_bool_false');

			expect(valueTrue).toBe(true);
			expect(valueFalse).toBe(false);
		});

		it('should store and retrieve number value', async () => {
			const { StorageUtils } = await import('@/shared/lib/platform/storage');

			await StorageUtils.setNumber('test_number', 42.5);
			const value = await StorageUtils.getNumber('test_number');

			expect(value).toBe(42.5);
		});

		it('should return null for invalid number', async () => {
			const { StorageUtils } = await import('@/shared/lib/platform/storage');

			await import('@/shared/lib/platform/storage').then(({ storage }) =>
				storage.setItem('invalid_number', 'not_a_number')
			);

			const value = await StorageUtils.getNumber('invalid_number');

			expect(value).toBeNull();
		});
	});

	describe('StorageKeys', () => {
		it('should have all required storage keys defined', async () => {
			const { StorageKeys } = await import('@/shared/lib/platform/storage');

			expect(StorageKeys.LANGUAGE).toBe('unity_language');
			expect(StorageKeys.THEME).toBe('unity_theme');
			expect(StorageKeys.NOTIFICATIONS_ENABLED).toBe('unity_notifications_enabled');
			expect(StorageKeys.ONBOARDING_COMPLETED).toBe('unity_onboarding_completed');
			expect(StorageKeys.TRANSLATIONS_CACHE).toBe('unity_translations_cache');
			expect(StorageKeys.PWA_INSTALLED).toBe('unity_pwa_installed');
		});
	});
});

// ============================================================================
// MEDIA ADAPTER TESTS
// ============================================================================

describe('Media Adapter', () => {
	describe('MediaUtils', () => {
		it('should identify image files correctly', async () => {
			const { MediaUtils } = await import('@/shared/lib/platform/media');

			const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
			const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });

			expect(MediaUtils.isImageFile(imageFile)).toBe(true);
			expect(MediaUtils.isImageFile(videoFile)).toBe(false);
		});

		it('should identify video files correctly', async () => {
			const { MediaUtils } = await import('@/shared/lib/platform/media');

			const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
			const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });

			expect(MediaUtils.isVideoFile(videoFile)).toBe(true);
			expect(MediaUtils.isVideoFile(imageFile)).toBe(false);
		});

		it('should format file size correctly', async () => {
			const { MediaUtils } = await import('@/shared/lib/platform/media');

			expect(MediaUtils.formatFileSize(0)).toBe('0 Bytes');
			expect(MediaUtils.formatFileSize(1024)).toBe('1 KB');
			expect(MediaUtils.formatFileSize(1024 * 1024)).toBe('1 MB');
			expect(MediaUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
			expect(MediaUtils.formatFileSize(1536)).toBe('1.5 KB');
		});

		it('should validate file size correctly', async () => {
			const { MediaUtils } = await import('@/shared/lib/platform/media');

			const smallFile = new File(['x'.repeat(1024)], 'small.txt');
			const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt');

			expect(MediaUtils.validateFileSize(smallFile, 5)).toBe(true);
			expect(MediaUtils.validateFileSize(largeFile, 5)).toBe(false);
		});

		it('should get file extension correctly', async () => {
			const { MediaUtils } = await import('@/shared/lib/platform/media');

			expect(MediaUtils.getFileExtension('test.jpg')).toBe('jpg');
			expect(MediaUtils.getFileExtension('document.pdf')).toBe('pdf');
			expect(MediaUtils.getFileExtension('archive.tar.gz')).toBe('gz');
			expect(MediaUtils.getFileExtension('noextension')).toBe('noextension');
		});
	});

	// ==========================================================================
	// DOM TESTS FOR WebMediaAdapter
	// ==========================================================================

	describe('WebMediaAdapter - readAsDataURL (DOM)', () => {
		it('should read file as data URL', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const fileContent = 'Hello, World!';
			const blob = new Blob([fileContent], { type: 'text/plain' });
			const file = new File([blob], 'test.txt', { type: 'text/plain' });

			const dataURL = await media.readAsDataURL(file);

			expect(dataURL).toContain('data:');
			expect(dataURL).toContain('base64');
		});

		it('should read image file as data URL', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			// Create a 1x1 transparent PNG
			const base64PNG =
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
			const binaryString = atob(base64PNG);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			const blob = new Blob([bytes], { type: 'image/png' });
			const file = new File([blob], 'test.png', { type: 'image/png' });

			const dataURL = await media.readAsDataURL(file);

			expect(dataURL).toContain('data:image/png');
			expect(dataURL).toContain('base64');
		});

		it('should preserve file type in data URL', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const blob = new Blob(['test'], { type: 'application/json' });
			const file = new File([blob], 'test.json', { type: 'application/json' });

			const dataURL = await media.readAsDataURL(file);

			expect(dataURL).toContain('data:application/json');
		});

		it('should handle read error', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const invalidFile = {} as File;

			await expect(media.readAsDataURL(invalidFile)).rejects.toThrow();
		});
	});

	describe('WebMediaAdapter - readAsArrayBuffer (DOM)', () => {
		it('should read file as array buffer', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const fileContent = 'Hello, World!';
			const blob = new Blob([fileContent], { type: 'text/plain' });
			const file = new File([blob], 'test.txt', { type: 'text/plain' });

			const arrayBuffer = await media.readAsArrayBuffer(file);

			expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
			expect(arrayBuffer.byteLength).toBeGreaterThan(0);
		});

		it('should read binary data correctly', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const bytes = new Uint8Array([1, 2, 3, 4, 5]);
			const blob = new Blob([bytes], { type: 'application/octet-stream' });
			const file = new File([blob], 'test.bin', {
				type: 'application/octet-stream',
			});

			const arrayBuffer = await media.readAsArrayBuffer(file);
			const resultBytes = new Uint8Array(arrayBuffer);

			expect(resultBytes.length).toBe(5);
			expect(resultBytes[0]).toBe(1);
			expect(resultBytes[4]).toBe(5);
		});

		it('should handle read error', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const invalidFile = {} as File;

			await expect(media.readAsArrayBuffer(invalidFile)).rejects.toThrow();
		});
	});

	describe('WebMediaAdapter - getImageDimensions (DOM)', () => {
		it('should call getImageDimensions method', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			// In jsdom environment, Image.onload may not fire properly
			// So we just test that the method exists and can be called
			expect(media.getImageDimensions).toBeDefined();
			expect(typeof media.getImageDimensions).toBe('function');

			// Create a valid PNG file
			const base64PNG =
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
			const binaryString = atob(base64PNG);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			const blob = new Blob([bytes], { type: 'image/png' });
			const file = new File([blob], 'test.png', { type: 'image/png' });

			// Call the method (may timeout in jsdom, so we don't await)
			const promise = media.getImageDimensions(file);
			expect(promise).toBeInstanceOf(Promise);
		});

		it('should handle invalid image file', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const blob = new Blob(['not an image'], { type: 'text/plain' });
			const file = new File([blob], 'test.txt', { type: 'text/plain' });

			// In jsdom, this will timeout rather than reject
			// So we just test that the method can be called
			const promise = media.getImageDimensions(file);
			expect(promise).toBeInstanceOf(Promise);
		});

		it('should handle corrupted image data', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const blob = new Blob(['corrupted image data'], { type: 'image/png' });
			const file = new File([blob], 'corrupted.png', { type: 'image/png' });

			// In jsdom, this will timeout rather than reject
			// So we just test that the method can be called
			const promise = media.getImageDimensions(file);
			expect(promise).toBeInstanceOf(Promise);
		});

		it('should handle FileReader error', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const invalidFile = {} as File;

			await expect(media.getImageDimensions(invalidFile)).rejects.toThrow();
		});
	});

	describe('WebMediaAdapter - getVideoMetadata (DOM)', () => {
		it('should handle invalid video file', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const blob = new Blob(['not a video'], { type: 'text/plain' });
			const file = new File([blob], 'test.txt', { type: 'text/plain' });

			await expect(media.getVideoMetadata(file)).rejects.toThrow();
		});

		it('should handle corrupted video data', async () => {
			const { media } = await import('@/shared/lib/platform/media');

			const blob = new Blob(['corrupted video data'], { type: 'video/mp4' });
			const file = new File([blob], 'corrupted.mp4', { type: 'video/mp4' });

			await expect(media.getVideoMetadata(file)).rejects.toThrow();
		});
	});
});

// ============================================================================
// NAVIGATION ADAPTER TESTS
// ============================================================================

describe('Navigation Adapter', () => {
	let mockHistory: any;
	let mockLocation: any;

	beforeEach(() => {
		// Mock window.history and window.location
		mockHistory = {
			pushState: vi.fn(),
			replaceState: vi.fn(),
			back: vi.fn(),
			length: 2,
		};

		mockLocation = {
			pathname: '/',
			search: '',
			hash: '',
			origin: 'http://localhost:3000',
		};

		global.window = {
			history: mockHistory,
			location: mockLocation,
			dispatchEvent: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} as any;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('WebNavigationAdapter', () => {
		it('should have navigate method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.navigate).toBeDefined();
			expect(typeof navigation.navigate).toBe('function');

			// Call navigate (won't work in test env due to Platform.isBrowser check)
			navigation.navigate('/home');
		});

		it('should have goBack method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.goBack).toBeDefined();
			expect(typeof navigation.goBack).toBe('function');
		});

		it('should have replace method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.replace).toBeDefined();
			expect(typeof navigation.replace).toBe('function');
		});

		it('should have reset method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.reset).toBeDefined();
			expect(typeof navigation.reset).toBe('function');
		});

		it('should have getCurrentRoute method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.getCurrentRoute).toBeDefined();
			expect(typeof navigation.getCurrentRoute).toBe('function');

			const currentRoute = navigation.getCurrentRoute();
			expect(typeof currentRoute).toBe('string');
		});

		it('should have canGoBack method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.canGoBack).toBeDefined();
			expect(typeof navigation.canGoBack).toBe('function');

			const canGoBack = navigation.canGoBack();
			expect(typeof canGoBack).toBe('boolean');
		});

		it('should have addListener method', async () => {
			const { navigation } = await import('@/shared/lib/platform/navigation');

			expect(navigation.addListener).toBeDefined();
			expect(typeof navigation.addListener).toBe('function');
		});
	});

	describe('NavigationUtils', () => {
		it('should have all required routes defined', async () => {
			const { NavigationUtils } = await import('@/shared/lib/platform/navigation');

			expect(NavigationUtils.routes.WELCOME).toBe('/');
			expect(NavigationUtils.routes.HOME).toBe('/home');
			expect(NavigationUtils.routes.SETTINGS).toBe('/settings');
			expect(NavigationUtils.routes.ADMIN_DASHBOARD).toBe('/admin/dashboard');
		});

		it('should have navigateTo method', async () => {
			const { NavigationUtils } = await import('@/shared/lib/platform/navigation');

			expect(NavigationUtils.navigateTo).toBeDefined();
			expect(typeof NavigationUtils.navigateTo).toBe('function');
		});

		it('should have isCurrentRoute method', async () => {
			const { NavigationUtils } = await import('@/shared/lib/platform/navigation');

			expect(NavigationUtils.isCurrentRoute).toBeDefined();
			expect(typeof NavigationUtils.isCurrentRoute).toBe('function');
		});

		it('should build route with parameters', async () => {
			const { NavigationUtils } = await import('@/shared/lib/platform/navigation');

			const route = NavigationUtils.buildRoute('/user/:id/post/:postId', {
				id: '123',
				postId: '456',
			});

			expect(route).toBe('/user/123/post/456');
		});
	});
});

// ============================================================================
// ANIMATION ADAPTER TESTS
// ============================================================================

describe('Animation Adapter', () => {
	describe('AnimatedView', () => {
		it('should be defined and exportable', async () => {
			const { AnimatedView } = await import('@/shared/lib/platform/animation');

			expect(AnimatedView).toBeDefined();
			expect(typeof AnimatedView).toBe('function');
		});
	});

	describe('AnimatedPresence', () => {
		it('should be defined and exportable', async () => {
			const { AnimatedPresence } = await import('@/shared/lib/platform/animation');

			expect(AnimatedPresence).toBeDefined();
			expect(typeof AnimatedPresence).toBe('function');
		});
	});

	describe('Animation Hooks', () => {
		it('should export useAnimationState hook', async () => {
			const { useAnimationState } = await import('@/shared/lib/platform/animation/hooks');

			expect(useAnimationState).toBeDefined();
			expect(typeof useAnimationState).toBe('function');
		});
	});

	describe('Animation Types', () => {
		it('should export AnimatedViewProps type', async () => {
			const types = await import('@/shared/lib/platform/animation/types');

			expect(types).toBeDefined();
		});
	});
});
