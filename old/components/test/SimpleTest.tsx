import type React from "react";

export const SimpleTest: React.FC = () => (
	<div className="min-h-screen bg-gray-900 p-8 text-white">
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-8 text-center font-bold text-4xl">
				🎉 Тест нового дизайна настроек
			</h1>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-6">
					<h2 className="mb-4 font-semibold text-xl">API Настройки</h2>
					<p className="text-blue-100">Управление API ключами с графиками</p>
				</div>

				<div className="rounded-lg bg-gradient-to-br from-green-500 to-teal-600 p-6">
					<h2 className="mb-4 font-semibold text-xl">Языки</h2>
					<p className="text-green-100">Переводы с визуализацией прогресса</p>
				</div>

				<div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-6">
					<h2 className="mb-4 font-semibold text-xl">PWA</h2>
					<p className="text-orange-100">Настройки приложения с preview</p>
				</div>

				<div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-6">
					<h2 className="mb-4 font-semibold text-xl">Push уведомления</h2>
					<p className="text-purple-100">Статистика и планировщик</p>
				</div>

				<div className="rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-6">
					<h2 className="mb-4 font-semibold text-xl">Общие настройки</h2>
					<p className="text-indigo-100">Основные параметры системы</p>
				</div>

				<div className="rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 p-6">
					<h2 className="mb-4 font-semibold text-xl">Система</h2>
					<p className="text-gray-100">Мониторинг и логи</p>
				</div>
			</div>

			<div className="mt-12 text-center">
				<div className="inline-block rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 font-bold text-black text-lg">
					✨ Новый дизайн готов к тестированию! ✨
				</div>
			</div>
		</div>
	</div>
);
