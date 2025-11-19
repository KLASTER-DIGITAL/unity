/**
 * Unit тесты для плюрализации
 * 
 * @author UNITY Team
 * @date 2025-11-19
 */

import { describe, expect, it } from 'vitest';
import { pluralize } from '../pluralization';
import { getPluralForm } from '../pluralization/PluralRules';

describe('Pluralization', () => {
  describe('getPluralForm - Русский язык', () => {
    it('должен возвращать "one" для 1', () => {
      expect(getPluralForm(1, 'ru')).toBe('one');
    });

    it('должен возвращать "few" для 2, 3, 4', () => {
      expect(getPluralForm(2, 'ru')).toBe('few');
      expect(getPluralForm(3, 'ru')).toBe('few');
      expect(getPluralForm(4, 'ru')).toBe('few');
    });

    it('должен возвращать "many" для 5, 6, 7, 8, 9, 10', () => {
      expect(getPluralForm(5, 'ru')).toBe('many');
      expect(getPluralForm(6, 'ru')).toBe('many');
      expect(getPluralForm(10, 'ru')).toBe('many');
    });

    it('должен возвращать "many" для 11, 12, 13, 14', () => {
      expect(getPluralForm(11, 'ru')).toBe('many');
      expect(getPluralForm(12, 'ru')).toBe('many');
      expect(getPluralForm(13, 'ru')).toBe('many');
      expect(getPluralForm(14, 'ru')).toBe('many');
    });

    it('должен возвращать "one" для 21, 31, 41', () => {
      expect(getPluralForm(21, 'ru')).toBe('one');
      expect(getPluralForm(31, 'ru')).toBe('one');
      expect(getPluralForm(41, 'ru')).toBe('one');
    });

    it('должен возвращать "few" для 22, 23, 24', () => {
      expect(getPluralForm(22, 'ru')).toBe('few');
      expect(getPluralForm(23, 'ru')).toBe('few');
      expect(getPluralForm(24, 'ru')).toBe('few');
    });
  });

  describe('getPluralForm - Английский язык', () => {
    it('должен возвращать "one" для 1', () => {
      expect(getPluralForm(1, 'en')).toBe('one');
    });

    it('должен возвращать "other" для всех остальных чисел', () => {
      expect(getPluralForm(0, 'en')).toBe('other');
      expect(getPluralForm(2, 'en')).toBe('other');
      expect(getPluralForm(5, 'en')).toBe('other');
      expect(getPluralForm(10, 'en')).toBe('other');
      expect(getPluralForm(100, 'en')).toBe('other');
    });
  });

  describe('getPluralForm - Казахский язык', () => {
    it('должен возвращать "one" для 1', () => {
      expect(getPluralForm(1, 'kk')).toBe('one');
    });

    it('должен возвращать "other" для всех остальных чисел', () => {
      expect(getPluralForm(0, 'kk')).toBe('other');
      expect(getPluralForm(2, 'kk')).toBe('other');
      expect(getPluralForm(5, 'kk')).toBe('other');
      expect(getPluralForm(10, 'kk')).toBe('other');
    });
  });

  describe('pluralize', () => {
    const translations = {
      items_one: 'предмет',
      items_few: 'предмета',
      items_many: 'предметов',
    };

    it('должен возвращать правильную форму для 1', () => {
      expect(pluralize('items', 1, 'ru', translations)).toBe('1 предмет');
    });

    it('должен возвращать правильную форму для 2', () => {
      expect(pluralize('items', 2, 'ru', translations)).toBe('2 предмета');
    });

    it('должен возвращать правильную форму для 5', () => {
      expect(pluralize('items', 5, 'ru', translations)).toBe('5 предметов');
    });

    it('должен возвращать правильную форму для 21', () => {
      expect(pluralize('items', 21, 'ru', translations)).toBe('21 предмет');
    });

    it('должен возвращать правильную форму для 22', () => {
      expect(pluralize('items', 22, 'ru', translations)).toBe('22 предмета');
    });

    it('должен возвращать правильную форму для 25', () => {
      expect(pluralize('items', 25, 'ru', translations)).toBe('25 предметов');
    });
  });

  describe('pluralize - Английский', () => {
    const translations = {
      items_one: 'item',
      items_other: 'items',
    };

    it('должен возвращать "item" для 1', () => {
      expect(pluralize('items', 1, 'en', translations)).toBe('1 item');
    });

    it('должен возвращать "items" для 2', () => {
      expect(pluralize('items', 2, 'en', translations)).toBe('2 items');
    });

    it('должен возвращать "items" для 0', () => {
      expect(pluralize('items', 0, 'en', translations)).toBe('0 items');
    });
  });

  describe('pluralize - Казахский', () => {
    const translations = {
      items_one: 'зат',
      items_other: 'заттар',
    };

    it('должен возвращать "зат" для 1', () => {
      expect(pluralize('items', 1, 'kk', translations)).toBe('1 зат');
    });

    it('должен возвращать "заттар" для 2', () => {
      expect(pluralize('items', 2, 'kk', translations)).toBe('2 заттар');
    });

    it('должен возвращать "заттар" для 5', () => {
      expect(pluralize('items', 5, 'kk', translations)).toBe('5 заттар');
    });
  });
});

