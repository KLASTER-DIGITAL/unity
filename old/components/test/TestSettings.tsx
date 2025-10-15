import React from 'react';

export const TestSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🎉 Новый дизайн настроек готов!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔑 API Настройки</h2>
            <p className="text-blue-100">Управление API ключами с графиками и валидацией</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🌍 Языки</h2>
            <p className="text-green-100">Переводы с визуализацией прогресса и charts</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📱 PWA</h2>
            <p className="text-orange-100">Настройки приложения с live preview</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🔔 Push уведомления</h2>
            <p className="text-purple-100">Статистика и планировщик с preview</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">⚙️ Общие настройки</h2>
            <p className="text-indigo-100">Основные параметры системы</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">🖥️ Система</h2>
            <p className="text-gray-100">Мониторинг и логи в реальном времени</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-lg font-bold text-lg mb-4">
            ✨ Радикальное улучшение завершено! ✨
          </div>
          <p className="text-white/70 text-lg">
            Все компоненты созданы с использованием shadcn/ui
          </p>
        </div>
      </div>
    </div>
  );
};