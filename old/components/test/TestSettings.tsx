import type React from 'react';

export const TestSettings: React.FC = () => (
  <div className="min-h-screen bg-gray-900 p-8 text-white">
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-center font-bold text-4xl">🎉 Новый дизайн настроек готов!</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-6">
          <h2 className="mb-4 font-semibold text-xl">🔑 API Настройки</h2>
          <p className="text-blue-100">Управление API ключами с графиками и валидацией</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-500 to-teal-600 p-6">
          <h2 className="mb-4 font-semibold text-xl">🌍 Языки</h2>
          <p className="text-green-100">Переводы с визуализацией прогресса и charts</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-6">
          <h2 className="mb-4 font-semibold text-xl">📱 PWA</h2>
          <p className="text-orange-100">Настройки приложения с live preview</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-6">
          <h2 className="mb-4 font-semibold text-xl">🔔 Push уведомления</h2>
          <p className="text-purple-100">Статистика и планировщик с preview</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-6">
          <h2 className="mb-4 font-semibold text-xl">⚙️ Общие настройки</h2>
          <p className="text-indigo-100">Основные параметры системы</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 p-6">
          <h2 className="mb-4 font-semibold text-xl">🖥️ Система</h2>
          <p className="text-gray-100">Мониторинг и логи в реальном времени</p>
        </div>
      </div>

      <div className="text-center">
        <div className="mb-4 inline-block rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 font-bold text-black text-lg">
          ✨ Радикальное улучшение завершено! ✨
        </div>
        <p className="text-lg text-white/70">Все компоненты созданы с использованием shadcn/ui</p>
      </div>
    </div>
  </div>
);
