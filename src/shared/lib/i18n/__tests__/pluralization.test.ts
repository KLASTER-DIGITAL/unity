/**
 * Unit тесты для плюрализации
 *
 * @author UNITY Team
 * @date 2025-11-19
 */

import { describe, expect, it } from 'vitest';
import { COMMON_PLURALS, formatPlural } from '../pluralization/Pluralization';
import { getPluralExamples, getPluralForm } from '../pluralization/PluralRules';

describe('Pluralization', () => {
	describe('getPluralForm - примеры из getPluralExamples', () => {
		it('должен соответствовать примерам для русского языка', () => {
			const examples = getPluralExamples('ru');
			for (const n of examples.one) {
				expect(getPluralForm('ru', n)).toBe('one');
			}
			for (const n of examples.few) {
				expect(getPluralForm('ru', n)).toBe('few');
			}
			for (const n of examples.many) {
				expect(getPluralForm('ru', n)).toBe('many');
			}
		});

		it('должен соответствовать примерам для английского языка', () => {
			const examples = getPluralExamples('en');
			for (const n of examples.one) {
				expect(getPluralForm('en', n)).toBe('one');
			}
			for (const n of examples.other) {
				expect(getPluralForm('en', n)).toBe('other');
			}
		});

		it('должен соответствовать примерам для казахского языка', () => {
			const examples = getPluralExamples('kk');
			for (const n of examples.one) {
				expect(getPluralForm('kk', n)).toBe('one');
			}
			for (const n of examples.other) {
				expect(getPluralForm('kk', n)).toBe('other');
			}
		});
	});

	describe('formatPlural + COMMON_PLURALS', () => {
		it('должен возвращать правильную форму для русского языка', () => {
			const ruItems = COMMON_PLURALS.ru.items;
			const translations = {
				items_one: ruItems.one ?? '{{count}} элемент',
				items_few: ruItems.few ?? '{{count}} элемента',
				items_many: ruItems.many ?? '{{count}} элементов',
				items_other: ruItems.other,
			};

			expect(formatPlural(1, 'items', translations, 'ru')).toBe('1 элемент');
			expect(formatPlural(2, 'items', translations, 'ru')).toBe('2 элемента');
			expect(formatPlural(5, 'items', translations, 'ru')).toBe('5 элементов');
		});
	});
});
