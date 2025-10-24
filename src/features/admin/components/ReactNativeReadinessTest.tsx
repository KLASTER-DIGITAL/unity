/**
 * React Native Readiness Test Component
 * 
 * Admin panel component for testing React Native migration readiness
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { useState } from 'react';
import { checkReactNativeReadiness, type ReadinessReport } from '@/shared/lib/platform';

export function ReactNativeReadinessTest() {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkReactNativeReadiness();
      setReport(result);
      
      // Log to console for debugging
      console.log('React Native Readiness Report:', result);
      
      // Download report as JSON
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `react-native-readiness-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('React Native Readiness Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'not_ready': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'partial': return '⚠️';
      case 'not_ready': return '❌';
      default: return '❓';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">React Native Readiness Test</h2>
        <p className="text-gray-600">
          Проверка готовности всех platform adapters для миграции на React Native
        </p>
      </div>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Тестирование...' : 'Запустить тест'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">Ошибка:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {report && (
        <div className="mt-6 space-y-6">
          {/* Overall Status */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Общий статус</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(report.timestamp).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}%
                </div>
                <div className={`text-lg ${getStatusColor(report.overall)}`}>
                  {getStatusEmoji(report.overall)} {report.overall.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  report.overallScore >= 90 ? 'bg-green-500' :
                  report.overallScore >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
          </div>

          {/* Individual Checks */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Детальные проверки</h3>
            
            {report.checks.map((check, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getStatusEmoji(check.status)}</span>
                      <h4 className="font-semibold text-lg">{check.name}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{check.details}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${getScoreColor(check.score)}`}>
                      {check.score}%
                    </div>
                    <div className={`text-sm ${getStatusColor(check.status)}`}>
                      {check.status}
                    </div>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all ${
                      check.score >= 90 ? 'bg-green-500' :
                      check.score >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${check.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold mb-2">📊 Сводка</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {report.checks.filter(c => c.status === 'ready').length}
                </div>
                <div className="text-sm text-gray-600">Готово</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {report.checks.filter(c => c.status === 'partial').length}
                </div>
                <div className="text-sm text-gray-600">Частично</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {report.checks.filter(c => c.status === 'not_ready').length}
                </div>
                <div className="text-sm text-gray-600">Не готово</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold mb-2">💡 Рекомендации</h3>
            <ul className="space-y-2 text-sm">
              {report.overallScore >= 95 && (
                <li className="text-green-600">
                  ✅ Отличная готовность! Можно начинать миграцию на React Native
                </li>
              )}
              {report.overallScore >= 80 && report.overallScore < 95 && (
                <li className="text-yellow-600">
                  ⚠️ Хорошая готовность, но есть области для улучшения
                </li>
              )}
              {report.overallScore < 80 && (
                <li className="text-red-600">
                  ❌ Требуется дополнительная работа перед миграцией
                </li>
              )}
              
              {report.checks.filter(c => c.status !== 'ready').map((check, index) => (
                <li key={index} className="text-gray-700">
                  • {check.name}: {check.details}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                const text = JSON.stringify(report, null, 2);
                navigator.clipboard.writeText(text);
                alert('Отчет скопирован в буфер обмена!');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              📋 Копировать JSON
            </button>
            
            <button
              onClick={() => {
                console.log('React Native Readiness Report:', report);
                alert('Отчет выведен в консоль браузера');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔍 Показать в консоли
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

