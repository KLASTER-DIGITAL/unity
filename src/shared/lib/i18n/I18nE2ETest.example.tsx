/**
 * E2E Test Component for i18n System
 * 
 * Comprehensive testing of all i18n features
 */

import React, { useState } from 'react';
import { useTranslation } from './useTranslation';
import { ChevronRight, Check, X } from 'lucide-react';

export function I18nE2ETest() {
  const { t, changeLanguage, currentLanguage, isLoading, isLoaded, error } = useTranslation();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Test 1: Basic Translation
  const testBasicTranslation = () => {
    const result = t('welcome.title', 'Welcome to UNITY');
    const passed = result.length > 0;
    setTestResults(prev => ({ ...prev, basicTranslation: passed }));
    return passed;
  };

  // Test 2: Language Switching
  const testLanguageSwitching = async () => {
    try {
      await changeLanguage('es');
      await new Promise(resolve => setTimeout(resolve, 500));
      const passed = currentLanguage === 'es';
      setTestResults(prev => ({ ...prev, languageSwitching: passed }));
      await changeLanguage('en'); // Reset
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, languageSwitching: false }));
      return false;
    }
  };

  // Test 3: Date Formatting
  const testDateFormatting = () => {
    try {
      const date = new Date('2024-01-15T15:30:00');
      const formatted = t.formatDate(date, { style: 'medium' });
      const passed = formatted.length > 0 && formatted.includes('2024');
      setTestResults(prev => ({ ...prev, dateFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, dateFormatting: false }));
      return false;
    }
  };

  // Test 4: Relative Time
  const testRelativeTime = () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const formatted = t.formatRelativeTime(fiveMinutesAgo);
      const passed = formatted.length > 0;
      setTestResults(prev => ({ ...prev, relativeTime: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, relativeTime: false }));
      return false;
    }
  };

  // Test 5: Number Formatting
  const testNumberFormatting = () => {
    try {
      const formatted = t.formatNumber(1234.56);
      const passed = formatted.length > 0;
      setTestResults(prev => ({ ...prev, numberFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, numberFormatting: false }));
      return false;
    }
  };

  // Test 6: Currency Formatting
  const testCurrencyFormatting = () => {
    try {
      const formatted = t.formatCurrency(1234.56, 'USD');
      const passed = formatted.length > 0 && (formatted.includes('$') || formatted.includes('USD'));
      setTestResults(prev => ({ ...prev, currencyFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, currencyFormatting: false }));
      return false;
    }
  };

  // Test 7: Percent Formatting
  const testPercentFormatting = () => {
    try {
      const formatted = t.formatPercent(0.85);
      const passed = formatted.includes('85') && formatted.includes('%');
      setTestResults(prev => ({ ...prev, percentFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, percentFormatting: false }));
      return false;
    }
  };

  // Test 8: Compact Notation
  const testCompactNotation = () => {
    try {
      const formatted = t.formatCompact(1234567);
      const passed = formatted.length > 0 && formatted.length < 10;
      setTestResults(prev => ({ ...prev, compactNotation: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, compactNotation: false }));
      return false;
    }
  };

  // Test 9: File Size Formatting
  const testFileSizeFormatting = () => {
    try {
      const formatted = t.formatFileSize(1024 * 1024);
      const passed = formatted.includes('MB');
      setTestResults(prev => ({ ...prev, fileSizeFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, fileSizeFormatting: false }));
      return false;
    }
  };

  // Test 10: Duration Formatting
  const testDurationFormatting = () => {
    try {
      const formatted = t.formatDuration(3665);
      const passed = formatted.length > 0;
      setTestResults(prev => ({ ...prev, durationFormatting: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, durationFormatting: false }));
      return false;
    }
  };

  // Test 11: Pluralization
  const testPluralization = () => {
    try {
      const singular = t.plural('item.count', 1, {
        one: '1 item',
        other: '{count} items'
      });
      const plural = t.plural('item.count', 5, {
        one: '1 item',
        other: '{count} items'
      });
      const passed = singular.includes('1') && plural.includes('5');
      setTestResults(prev => ({ ...prev, pluralization: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, pluralization: false }));
      return false;
    }
  };

  // Test 12: RTL Detection
  const testRTLDetection = () => {
    try {
      const isRTL = t.isRTL;
      const direction = t.direction;
      const passed = typeof isRTL === 'boolean' && (direction === 'ltr' || direction === 'rtl');
      setTestResults(prev => ({ ...prev, rtlDetection: passed }));
      return passed;
    } catch (err) {
      setTestResults(prev => ({ ...prev, rtlDetection: false }));
      return false;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    console.log('🧪 Starting i18n E2E Tests...');
    
    testBasicTranslation();
    await testLanguageSwitching();
    testDateFormatting();
    testRelativeTime();
    testNumberFormatting();
    testCurrencyFormatting();
    testPercentFormatting();
    testCompactNotation();
    testFileSizeFormatting();
    testDurationFormatting();
    testPluralization();
    testRTLDetection();
    
    console.log('✅ All tests completed!');
  };

  const allPassed = Object.values(testResults).every(result => result === true);
  const totalTests = 12;
  const passedTests = Object.values(testResults).filter(result => result === true).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">i18n System E2E Tests</h1>
        <p className="text-gray-600">
          Comprehensive testing of all i18n features
        </p>
        
        {/* Status */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            {isLoading && <span className="text-yellow-600">Loading...</span>}
            {isLoaded && <span className="text-green-600">Loaded</span>}
            {error && <span className="text-red-600">Error: {error.message}</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Language:</span>
            <span className="font-semibold">{currentLanguage}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Direction:</span>
            <span className="font-semibold">{t.direction}</span>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={runAllTests}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Run All Tests
        </button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Results: {passedTests}/{totalTests} tests passed
              </span>
              {allPassed ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Test Results</h2>
        
        <div className="space-y-2">
          {[
            { key: 'basicTranslation', label: 'Basic Translation' },
            { key: 'languageSwitching', label: 'Language Switching' },
            { key: 'dateFormatting', label: 'Date Formatting' },
            { key: 'relativeTime', label: 'Relative Time' },
            { key: 'numberFormatting', label: 'Number Formatting' },
            { key: 'currencyFormatting', label: 'Currency Formatting' },
            { key: 'percentFormatting', label: 'Percent Formatting' },
            { key: 'compactNotation', label: 'Compact Notation' },
            { key: 'fileSizeFormatting', label: 'File Size Formatting' },
            { key: 'durationFormatting', label: 'Duration Formatting' },
            { key: 'pluralization', label: 'Pluralization' },
            { key: 'rtlDetection', label: 'RTL Detection' }
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span>{label}</span>
              {testResults[key] === true && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {testResults[key] === false && (
                <X className="w-5 h-5 text-red-600" />
              )}
              {testResults[key] === undefined && (
                <span className="text-gray-400">Not run</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Live Examples</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Translation</h3>
            <p>{t('welcome.title', 'Welcome to UNITY')}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Date Formatting</h3>
            <p>{t.formatDate(new Date(), { style: 'long' })}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Relative Time</h3>
            <p>{t.formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000))}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Number Formatting</h3>
            <p>{t.formatNumber(1234567.89)}</p>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Currency</h3>
            <p>{t.formatCurrency(1234.56, 'USD')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Pluralization</h3>
            <p>
              {t.plural('item.count', 5, {
                one: '1 item',
                other: '{count} items'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

