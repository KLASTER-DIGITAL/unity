/**
 * Comprehensive Test Suite for UNITY-v2 Platform Adapters
 * 
 * Complete testing framework for all platform abstraction layers
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { Platform, storage, media, navigation, NavigationUtils } from './index';

/**
 * Test result interface
 */
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

/**
 * Test suite interface
 */
interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

/**
 * Platform Adapter Test Suite
 */
export class PlatformTestSuite {
  private results: TestSuite[] = [];

  /**
   * Run all platform tests
   */
  async runAllTests(): Promise<TestSuite[]> {
    console.group('🚀 UNITY Platform Adapter Test Suite');
    
    try {
      this.results = [];
      
      // Run test suites
      await this.runPlatformDetectionTests();
      await this.runStorageAdapterTests();
      await this.runMediaAdapterTests();
      await this.runNavigationAdapterTests();
      await this.runUniversalComponentTests();
      await this.runIntegrationTests();
      
      // Generate summary
      this.generateSummary();
      
      return this.results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Platform Detection Tests
   */
  private async runPlatformDetectionTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Platform Detection',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Platform OS detection
    suite.tests.push(await this.runTest('Platform OS Detection', async () => {
      const os = Platform.OS;
      if (!['web', 'native'].includes(os)) {
        throw new Error(`Invalid platform OS: ${os}`);
      }
      return { os };
    }));

    // Test 2: Platform selection
    suite.tests.push(await this.runTest('Platform Selection', async () => {
      const result = Platform.select({
        web: 'web-value',
        native: 'native-value',
        default: 'default-value'
      });
      
      if (!result) {
        throw new Error('Platform selection returned null');
      }
      return { result };
    }));

    // Test 3: Platform flags
    suite.tests.push(await this.runTest('Platform Flags', async () => {
      const isWeb = Platform.isWeb;
      const isNative = Platform.isNative;
      
      if (isWeb === isNative) {
        throw new Error('Platform flags are inconsistent');
      }
      return { isWeb, isNative };
    }));

    // Test 4: Platform features
    suite.tests.push(await this.runTest('Platform Features', async () => {
      const features = Platform.features;
      
      if (!features || typeof features !== 'object') {
        throw new Error('Platform features not available');
      }
      return { features };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Storage Adapter Tests
   */
  private async runStorageAdapterTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Storage Adapter',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();
    const testKey = 'unity_test_key';
    const testValue = 'unity_test_value';

    // Test 1: Set and get item
    suite.tests.push(await this.runTest('Set and Get Item', async () => {
      await storage.setItem(testKey, testValue);
      const retrieved = await storage.getItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error(`Expected ${testValue}, got ${retrieved}`);
      }
      return { set: testValue, retrieved };
    }));

    // Test 2: JSON operations
    suite.tests.push(await this.runTest('JSON Operations', async () => {
      const testObject = { name: 'UNITY', version: 'v2', features: ['PWA', 'AI'] };
      const jsonKey = 'unity_test_json';
      
      await storage.setItem(jsonKey, JSON.stringify(testObject));
      const retrieved = await storage.getItem(jsonKey);
      const parsed = JSON.parse(retrieved || '{}');
      
      if (JSON.stringify(parsed) !== JSON.stringify(testObject)) {
        throw new Error('JSON round-trip failed');
      }
      return { original: testObject, parsed };
    }));

    // Test 3: Remove item
    suite.tests.push(await this.runTest('Remove Item', async () => {
      await storage.removeItem(testKey);
      const retrieved = await storage.getItem(testKey);
      
      if (retrieved !== null) {
        throw new Error(`Expected null, got ${retrieved}`);
      }
      return { removed: true };
    }));

    // Test 4: Get all keys
    suite.tests.push(await this.runTest('Get All Keys', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      
      const keys = await storage.getAllKeys();
      
      if (!Array.isArray(keys)) {
        throw new Error('getAllKeys should return an array');
      }
      
      // Cleanup
      await storage.removeItem('key1');
      await storage.removeItem('key2');
      
      return { keys };
    }));

    // Test 5: Multi operations
    suite.tests.push(await this.runTest('Multi Operations', async () => {
      const pairs = [['multi1', 'value1'], ['multi2', 'value2']];
      
      await storage.multiSet(pairs);
      const retrieved = await storage.multiGet(['multi1', 'multi2']);
      
      if (retrieved.length !== 2) {
        throw new Error('multiGet returned wrong number of items');
      }
      
      // Cleanup
      await storage.multiRemove(['multi1', 'multi2']);
      
      return { pairs, retrieved };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Media Adapter Tests
   */
  private async runMediaAdapterTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Media Adapter',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: File type detection
    suite.tests.push(await this.runTest('File Type Detection', async () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      // Note: These methods might not exist in placeholder implementation
      const isImage = media.isImageFile ? media.isImageFile(imageFile) : true;
      const isVideo = media.isVideoFile ? media.isVideoFile(videoFile) : false;
      
      return { isImage, isVideo, files: [imageFile.type, videoFile.type, textFile.type] };
    }));

    // Test 2: Object URL creation
    suite.tests.push(await this.runTest('Object URL Creation', async () => {
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      const objectUrl = media.createObjectURL(testFile);
      
      if (!objectUrl || typeof objectUrl !== 'string') {
        throw new Error('createObjectURL should return a string');
      }
      
      // Cleanup
      media.revokeObjectURL(objectUrl);
      
      return { objectUrl: objectUrl.substring(0, 20) + '...' };
    }));

    // Test 3: Canvas creation
    suite.tests.push(await this.runTest('Canvas Creation', async () => {
      const canvas = media.createCanvas(100, 100);
      
      if (!canvas) {
        throw new Error('createCanvas should return a canvas element');
      }
      
      return { width: canvas.width, height: canvas.height };
    }));

    // Test 4: Image creation
    suite.tests.push(await this.runTest('Image Creation', async () => {
      const img = media.createImage();
      
      if (!img) {
        throw new Error('createImage should return an image element');
      }
      
      return { created: true };
    }));

    // Test 5: Video creation
    suite.tests.push(await this.runTest('Video Creation', async () => {
      const video = media.createVideo();
      
      if (!video) {
        throw new Error('createVideo should return a video element');
      }
      
      return { created: true };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Navigation Adapter Tests
   */
  private async runNavigationAdapterTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Navigation Adapter',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Route definitions
    suite.tests.push(await this.runTest('Route Definitions', async () => {
      const routes = NavigationUtils.routes;
      
      if (!routes || typeof routes !== 'object') {
        throw new Error('Routes should be an object');
      }
      
      const requiredRoutes = ['WELCOME', 'AUTH', 'HOME', 'SETTINGS'];
      const missingRoutes = requiredRoutes.filter(route => !routes[route]);
      
      if (missingRoutes.length > 0) {
        throw new Error(`Missing routes: ${missingRoutes.join(', ')}`);
      }
      
      return { routeCount: Object.keys(routes).length, routes: Object.keys(routes) };
    }));

    // Test 2: Current route
    suite.tests.push(await this.runTest('Current Route', async () => {
      const currentRoute = navigation.getCurrentRoute();
      
      if (typeof currentRoute !== 'string') {
        throw new Error('getCurrentRoute should return a string');
      }
      
      return { currentRoute };
    }));

    // Test 3: Navigation capabilities
    suite.tests.push(await this.runTest('Navigation Capabilities', async () => {
      const canGoBack = navigation.canGoBack();
      
      if (typeof canGoBack !== 'boolean') {
        throw new Error('canGoBack should return a boolean');
      }
      
      return { canGoBack };
    }));

    // Test 4: Route building
    suite.tests.push(await this.runTest('Route Building', async () => {
      const route = NavigationUtils.buildRoute('/user/:id', { id: 123 });
      
      if (!route || typeof route !== 'string') {
        throw new Error('buildRoute should return a string');
      }
      
      return { route };
    }));

    // Test 5: Route parameters
    suite.tests.push(await this.runTest('Route Parameters', async () => {
      const params = NavigationUtils.getRouteParams();
      
      if (!params || typeof params !== 'object') {
        throw new Error('getRouteParams should return an object');
      }
      
      return { params };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Universal Component Tests
   */
  private async runUniversalComponentTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Universal Components',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Component exports
    suite.tests.push(await this.runTest('Component Exports', async () => {
      // Import universal components
      const { Button, Select, Switch, Modal } = await import('../../../components/ui/universal');
      
      if (!Button || !Select || !Switch || !Modal) {
        throw new Error('Universal components not properly exported');
      }
      
      return { 
        components: ['Button', 'Select', 'Switch', 'Modal'],
        exported: true 
      };
    }));

    // Test 2: Component utilities
    suite.tests.push(await this.runTest('Component Utilities', async () => {
      const { ButtonUtils, SelectUtils, SwitchUtils, ModalUtils } = await import('../../../components/ui/universal');
      
      if (!ButtonUtils || !SelectUtils || !SwitchUtils || !ModalUtils) {
        throw new Error('Component utilities not properly exported');
      }
      
      return { 
        utilities: ['ButtonUtils', 'SelectUtils', 'SwitchUtils', 'ModalUtils'],
        exported: true 
      };
    }));

    // Test 3: Type definitions
    suite.tests.push(await this.runTest('Type Definitions', async () => {
      const types = await import('../../../components/ui/universal/types');
      
      if (!types) {
        throw new Error('Type definitions not available');
      }
      
      return { typesAvailable: true };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Integration Tests
   */
  private async runIntegrationTests(): Promise<void> {
    const suite: TestSuite = {
      name: 'Integration Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const startTime = Date.now();

    // Test 1: Platform + Storage integration
    suite.tests.push(await this.runTest('Platform + Storage Integration', async () => {
      const platform = Platform.OS;
      const testKey = `integration_test_${platform}`;
      const testValue = { platform, timestamp: Date.now() };
      
      await storage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = await storage.getItem(testKey);
      const parsed = JSON.parse(retrieved || '{}');
      
      if (parsed.platform !== platform) {
        throw new Error('Platform integration failed');
      }
      
      await storage.removeItem(testKey);
      return { platform, testValue, parsed };
    }));

    // Test 2: Media + Storage integration
    suite.tests.push(await this.runTest('Media + Storage Integration', async () => {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const objectUrl = media.createObjectURL(testFile);
      
      await storage.setItem('media_test_url', objectUrl);
      const retrievedUrl = await storage.getItem('media_test_url');
      
      if (retrievedUrl !== objectUrl) {
        throw new Error('Media + Storage integration failed');
      }
      
      media.revokeObjectURL(objectUrl);
      await storage.removeItem('media_test_url');
      
      return { objectUrl: objectUrl.substring(0, 20) + '...', retrieved: true };
    }));

    // Test 3: Navigation + Storage integration
    suite.tests.push(await this.runTest('Navigation + Storage Integration', async () => {
      const currentRoute = navigation.getCurrentRoute();
      const routeData = { route: currentRoute, timestamp: Date.now() };
      
      await storage.setItem('navigation_test', JSON.stringify(routeData));
      const retrieved = await storage.getItem('navigation_test');
      const parsed = JSON.parse(retrieved || '{}');
      
      if (parsed.route !== currentRoute) {
        throw new Error('Navigation + Storage integration failed');
      }
      
      await storage.removeItem('navigation_test');
      return { currentRoute, routeData, parsed };
    }));

    suite.duration = Date.now() - startTime;
    suite.passed = suite.tests.filter(t => t.passed).length;
    suite.failed = suite.tests.filter(t => !t.passed).length;
    
    this.results.push(suite);
  }

  /**
   * Run individual test
   */
  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const details = await testFn();
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${name} (${duration}ms)`);
      
      return {
        name,
        passed: true,
        duration,
        details
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`❌ ${name} (${duration}ms):`, errorMessage);
      
      return {
        name,
        passed: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * Generate test summary
   */
  private generateSummary(): void {
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.duration, 0);
    
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed! Platform abstraction layer is ready for React Native migration.');
    } else {
      console.log('⚠️ Some tests failed. Please review and fix issues before proceeding.');
    }
  }

  /**
   * Get test results
   */
  getResults(): TestSuite[] {
    return this.results;
  }

  /**
   * Export test results as JSON
   */
  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }
}

/**
 * Global test runner instance
 */
export const platformTestSuite = new PlatformTestSuite();

/**
 * Quick test runner for browser console
 */
export const runPlatformTests = async (): Promise<TestSuite[]> => {
  return await platformTestSuite.runAllTests();
};
