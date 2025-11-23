/**
 * Changelog и версионирование приложения
 *
 * Используется для:
 * - Отображения "Что нового" при обновлении
 * - Хранения истории изменений
 * - Показывания версии в настройках
 */

export type ChangelogEntry = {
	version: string;
	date: string;
	features: string[];
	improvements: string[];
	fixes: string[];
	breaking?: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
	{
		version: '2.0.2',
		date: '2025-11-23',
		features: [],
		improvements: [
			'Исправлена кодировка PDF - теперь кириллица отображается правильно',
			'Улучшена работа библиотеки книг - книги отображаются после перезагрузки',
			'Исправлено обновление названия книги в реальном времени',
		],
		fixes: [
			'Исправлен просмотр PDF - больше не переходит на главную страницу',
			'Исправлена ошибка "File is not a constructor" при скачивании PDF',
			'Исправлено отображение книги в библиотеке после выхода и входа',
		],
	},
	{
		version: '2.0.1',
		date: '2025-11-09',
		features: [],
		improvements: [
			'Улучшена система обновлений PWA',
			'Добавлена автоматическая очистка кеша при обновлении',
		],
		fixes: ['Исправлено зацикливание обновлений PWA'],
	},
	{
		version: '2.0.0',
		date: '2025-10-26',
		features: [
			'100% React Native готовность - 6 Platform Adapters, 6 Universal Components',
			'277 тестов (100% passing) - Unit, Integration, E2E',
			'Platform Adapters - Voice, Speech, Storage, Media, Navigation, Animation',
			'Universal Components - Toast, RadioGroup, Dialog, Select, Switch, Checkbox',
		],
		improvements: [
			'Оптимизированные Edge Functions - Standalone pattern, <300 строк',
			'0 ошибок в консоли - Production ready',
		],
		fixes: [],
	},
];

// Текущая версия приложения
export const CURRENT_VERSION = CHANGELOG[0]?.version || '2.0.2';

// Получить changelog для конкретной версии
export function getChangelogForVersion(version: string): ChangelogEntry | undefined {
	return CHANGELOG.find((entry) => entry.version === version);
}

// Получить все версии после указанной
export function getChangelogAfterVersion(version: string): ChangelogEntry[] {
	const currentIndex = CHANGELOG.findIndex((entry) => entry.version === version);
	if (currentIndex === -1) {
		return CHANGELOG; // Если версия не найдена, возвращаем все
	}
	return CHANGELOG.slice(0, currentIndex);
}

// Получить последнюю версию
export function getLatestVersion(): ChangelogEntry {
	return CHANGELOG[0];
}

// Получить весь changelog (все версии)
export function getAllChangelog(): ChangelogEntry[] {
	return CHANGELOG;
}
