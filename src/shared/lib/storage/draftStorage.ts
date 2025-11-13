/**
 * Draft Storage Utility
 *
 * Автоматическое сохранение черновиков записей в localStorage
 * Предотвращает потерю данных при случайном закрытии страницы
 */

const DRAFT_KEY_PREFIX = 'unity_draft_';
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

export type DraftData = {
	text: string;
	category?: string | null;
	mediaUrls?: string[];
	timestamp: number;
};

/**
 * Сохранить черновик
 */
export function saveDraft(userId: string, data: Omit<DraftData, 'timestamp'>): void {
	try {
		const draft: DraftData = {
			...data,
			timestamp: Date.now(),
		};

		const key = `${DRAFT_KEY_PREFIX}${userId}`;
		localStorage.setItem(key, JSON.stringify(draft));

		console.log('[DRAFT] Saved:', { userId, textLength: data.text.length });
	} catch (error) {
		console.error('[DRAFT] Error saving:', error);
	}
}

/**
 * Загрузить черновик
 */
export function loadDraft(userId: string): DraftData | null {
	try {
		const key = `${DRAFT_KEY_PREFIX}${userId}`;
		const stored = localStorage.getItem(key);

		if (!stored) {
			return null;
		}

		const draft: DraftData = JSON.parse(stored);

		// Проверить срок действия
		const age = Date.now() - draft.timestamp;
		if (age > DRAFT_EXPIRY_MS) {
			console.log('[DRAFT] Expired, removing');
			clearDraft(userId);
			return null;
		}

		console.log('[DRAFT] Loaded:', {
			userId,
			textLength: draft.text.length,
			age: `${Math.round(age / 1000 / 60)}min`,
		});
		return draft;
	} catch (error) {
		console.error('[DRAFT] Error loading:', error);
		return null;
	}
}

/**
 * Удалить черновик
 */
export function clearDraft(userId: string): void {
	try {
		const key = `${DRAFT_KEY_PREFIX}${userId}`;
		localStorage.removeItem(key);
		console.log('[DRAFT] Cleared:', userId);
	} catch (error) {
		console.error('[DRAFT] Error clearing:', error);
	}
}

/**
 * Проверить наличие черновика
 */
export function hasDraft(userId: string): boolean {
	const draft = loadDraft(userId);
	return draft !== null && draft.text.trim().length > 0;
}

/**
 * Очистить все устаревшие черновики
 */
export function cleanupExpiredDrafts(): void {
	try {
		const keys = Object.keys(localStorage);
		let cleaned = 0;

		for (const key of keys) {
			if (!key.startsWith(DRAFT_KEY_PREFIX)) {
				continue;
			}

			const stored = localStorage.getItem(key);
			if (!stored) {
				continue;
			}

			try {
				const draft: DraftData = JSON.parse(stored);
				const age = Date.now() - draft.timestamp;

				if (age > DRAFT_EXPIRY_MS) {
					localStorage.removeItem(key);
					cleaned++;
				}
			} catch {
				// Невалидный JSON, удалить
				localStorage.removeItem(key);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			console.log(`[DRAFT] Cleaned ${cleaned} expired drafts`);
		}
	} catch (error) {
		console.error('[DRAFT] Error cleaning up:', error);
	}
}

/**
 * Получить возраст черновика в минутах
 */
export function getDraftAge(userId: string): number | null {
	const draft = loadDraft(userId);
	if (!draft) {
		return null;
	}

	const ageMs = Date.now() - draft.timestamp;
	return Math.round(ageMs / 1000 / 60); // минуты
}
