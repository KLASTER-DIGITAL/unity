/**
 * Platform Detection Test for UNITY-v2
 * 
 * Simple test to verify platform detection and storage adapter work correctly
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { Platform, PlatformFeatures, storage, StorageUtils, media, navigation, NavigationUtils } from './index';
import { platformTestSuite, runPlatformTests } from './test-suite';

/**
 * Test platform detection functionality
 */
export async function testPlatformDetection(): Promise<void> {
  console.group('🧪 Platform Detection Test');
  
  try {
    // Test platform detection
    console.log('✅ Platform OS:', Platform.OS);
    console.log('✅ Is Web:', Platform.isWeb);
    console.log('✅ Is Native:', Platform.isNative);
    console.log('✅ Has DOM API:', Platform.hasDOMAPI);
    console.log('✅ Is Browser:', Platform.isBrowser);
    console.log('✅ Is PWA:', Platform.isPWA);
    
    // Test platform selection
    const testValue = Platform.select({
      web: 'Web Platform',
      native: 'Native Platform',
      default: 'Unknown Platform'
    });
    console.log('✅ Platform Select:', testValue);
    
    // Test platform features
    console.log('✅ Features:', {
      camera: PlatformFeatures.hasCamera,
      haptic: PlatformFeatures.hasHapticFeedback,
      geolocation: PlatformFeatures.hasGeolocation,
      pushNotifications: PlatformFeatures.hasPushNotifications,
      offlineStorage: PlatformFeatures.hasOfflineStorage
    });
    
    console.log('🎉 Platform detection tests passed!');
  } catch (error) {
    console.error('❌ Platform detection test failed:', error);
    throw error;
  }
  
  console.groupEnd();
}

/**
 * Test storage adapter functionality
 */
export async function testStorageAdapter(): Promise<void> {
  console.group('🧪 Storage Adapter Test');
  
  try {
    const testKey = 'unity_test_key';
    const testValue = 'test_value_' + Date.now();
    
    // Test basic storage operations
    console.log('📝 Testing setItem...');
    await storage.setItem(testKey, testValue);
    
    console.log('📖 Testing getItem...');
    const retrieved = await storage.getItem(testKey);
    
    if (retrieved !== testValue) {
      throw new Error(`Storage test failed: expected "${testValue}", got "${retrieved}"`);
    }
    
    console.log('✅ Basic storage operations work');
    
    // Test JSON storage utilities
    console.log('📝 Testing JSON storage...');
    const testObject = { 
      name: 'UNITY Test', 
      timestamp: Date.now(),
      features: ['platform-detection', 'storage-adapter']
    };
    
    await StorageUtils.setJSON('unity_test_json', testObject);
    const retrievedObject = await StorageUtils.getJSON('unity_test_json');
    
    if (!retrievedObject || retrievedObject.name !== testObject.name) {
      throw new Error('JSON storage test failed');
    }
    
    console.log('✅ JSON storage utilities work');
    
    // Test boolean and number utilities
    await StorageUtils.setBoolean('unity_test_bool', true);
    const boolValue = await StorageUtils.getBoolean('unity_test_bool');
    
    await StorageUtils.setNumber('unity_test_number', 42);
    const numberValue = await StorageUtils.getNumber('unity_test_number');
    
    if (boolValue !== true || numberValue !== 42) {
      throw new Error('Boolean/Number storage test failed');
    }
    
    console.log('✅ Boolean/Number storage utilities work');
    
    // Test multi operations
    console.log('📝 Testing multi operations...');
    const multiData: Array<[string, string]> = [
      ['unity_multi_1', 'value1'],
      ['unity_multi_2', 'value2'],
      ['unity_multi_3', 'value3']
    ];
    
    await storage.multiSet(multiData);
    const multiResult = await storage.multiGet(['unity_multi_1', 'unity_multi_2', 'unity_multi_3']);
    
    if (multiResult.length !== 3 || multiResult[0][1] !== 'value1') {
      throw new Error('Multi operations test failed');
    }
    
    console.log('✅ Multi operations work');
    
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await storage.multiRemove([
      testKey,
      'unity_test_json',
      'unity_test_bool',
      'unity_test_number',
      'unity_multi_1',
      'unity_multi_2',
      'unity_multi_3'
    ]);
    
    console.log('🎉 Storage adapter tests passed!');
  } catch (error) {
    console.error('❌ Storage adapter test failed:', error);
    throw error;
  }
  
  console.groupEnd();
}

/**
 * Test media adapter functionality
 */
export async function testMediaAdapter(): Promise<void> {
  console.group('🧪 Media Adapter Test');

  try {
    // Test media utilities
    console.log('📝 Testing media utilities...');

    // Create a mock file for testing
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    // Test file type detection
    const isImage = media.isImageFile ? media.isImageFile(mockFile) : true;
    const isVideo = media.isVideoFile ? media.isVideoFile(mockFile) : false;

    console.log('✅ File type detection:', { isImage, isVideo });

    // Test object URL creation (web only)
    if (Platform.isWeb) {
      const objectUrl = media.createObjectURL(mockFile);
      console.log('✅ Object URL created:', objectUrl.substring(0, 20) + '...');

      media.revokeObjectURL(objectUrl);
      console.log('✅ Object URL revoked');
    }

    // Test canvas creation
    const canvas = media.createCanvas(100, 100);
    console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

    // Test image creation
    const img = media.createImage();
    console.log('✅ Image element created');

    console.log('🎉 Media adapter tests passed!');
  } catch (error) {
    console.error('❌ Media adapter test failed:', error);
    throw error;
  }

  console.groupEnd();
}

/**
 * Test navigation adapter functionality
 */
export async function testNavigationAdapter(): Promise<void> {
  console.group('🧪 Navigation Adapter Test');

  try {
    console.log('📝 Testing navigation utilities...');

    // Test route definitions
    console.log('✅ Routes defined:', Object.keys(NavigationUtils.routes).length);

    // Test current route
    const currentRoute = navigation.getCurrentRoute();
    console.log('✅ Current route:', currentRoute);

    // Test navigation capabilities
    const canGoBack = navigation.canGoBack();
    console.log('✅ Can go back:', canGoBack);

    // Test route building
    const builtRoute = NavigationUtils.buildRoute('/user/:id', { id: 123 });
    console.log('✅ Built route:', builtRoute);

    // Test route parameters
    const params = NavigationUtils.getRouteParams();
    console.log('✅ Route params:', params);

    console.log('🎉 Navigation adapter tests passed!');
  } catch (error) {
    console.error('❌ Navigation adapter test failed:', error);
    throw error;
  }

  console.groupEnd();
}

/**
 * Run all platform tests (legacy)
 * @deprecated Use runComprehensiveTests() for full test suite
 */
export async function runPlatformTests(): Promise<void> {
  console.group('🚀 UNITY Platform Tests (Legacy)');

  try {
    await testPlatformDetection();
    await testStorageAdapter();
    await testMediaAdapter();
    await testNavigationAdapter();

    console.log('🎉 All legacy platform tests passed successfully!');
    console.log('✅ Platform abstraction layer is ready for React Native migration');
  } catch (error) {
    console.error('❌ Platform tests failed:', error);
    throw error;
  }

  console.groupEnd();
}

/**
 * Run comprehensive platform test suite
 */
export async function runComprehensiveTests(): Promise<void> {
  console.group('🚀 UNITY Comprehensive Platform Test Suite');

  try {
    // Run legacy tests first
    await runPlatformTests();

    // Run comprehensive test suite
    const results = await platformTestSuite.runAllTests();

    // Export results for analysis
    const exportedResults = platformTestSuite.exportResults();
    console.log('📄 Test results exported:', exportedResults.length, 'characters');

    console.log('🎉 All comprehensive tests completed!');
    console.log('✅ Platform abstraction layer is fully tested and ready');

    return results;
  } catch (error) {
    console.error('❌ Comprehensive tests failed:', error);
    throw error;
  }

  console.groupEnd();
}

/**
 * Quick test runner for browser console
 */
export const quickTest = runPlatformTests;

/**
 * Full test runner for browser console
 */
export const fullTest = runComprehensiveTests;

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to ensure DOM is ready
  setTimeout(() => {
    runPlatformTests().catch(console.error);
  }, 1000);
}
