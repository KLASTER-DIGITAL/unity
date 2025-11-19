/**
 * Unit тесты для форматирования чисел и дат
 * 
 * @author UNITY Team
 * @date 2025-11-19
 */

import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatCompact,
  formatDuration,
} from '../formatting/NumberFormatter';
import {
  formatDate,
  formatTime,
  formatRelativeTime,
} from '../formatting/DateFormatter';

describe('NumberFormatter', () => {
  describe('formatNumber', () => {
    it('должен форматировать числа для русского языка', () => {
      expect(formatNumber(1234567.89, 'ru')).toBe('1 234 567,89');
    });

    it('должен форматировать числа для английского языка', () => {
      expect(formatNumber(1234567.89, 'en')).toBe('1,234,567.89');
    });

    it('должен форматировать числа для казахского языка', () => {
      // Казахский использует пробелы как разделители тысяч
      const formatted = formatNumber(1234567.89, 'kk');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('567');
    });
  });

  describe('formatCurrency', () => {
    it('должен форматировать валюту для русского языка', () => {
      const formatted = formatCurrency(1234.56, 'ru', 'RUB');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('56');
    });

    it('должен форматировать валюту для английского языка', () => {
      const formatted = formatCurrency(1234.56, 'en', 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });

    it('должен форматировать валюту для казахского языка', () => {
      const formatted = formatCurrency(1234.56, 'kk', 'KZT');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });
  });

  describe('formatPercent', () => {
    it('должен форматировать проценты', () => {
      expect(formatPercent(0.1234, 'ru')).toContain('12');
      expect(formatPercent(0.1234, 'en')).toContain('12');
      expect(formatPercent(0.1234, 'kk')).toContain('12');
    });
  });

  describe('formatFileSize', () => {
    it('должен форматировать размер файла в байтах', () => {
      expect(formatFileSize(500, 'ru')).toContain('500');
      expect(formatFileSize(500, 'ru')).toContain('B');
    });

    it('должен форматировать размер файла в KB', () => {
      expect(formatFileSize(1024, 'ru')).toContain('1');
      expect(formatFileSize(1024, 'ru')).toContain('KB');
    });

    it('должен форматировать размер файла в MB', () => {
      expect(formatFileSize(1024 * 1024, 'ru')).toContain('1');
      expect(formatFileSize(1024 * 1024, 'ru')).toContain('MB');
    });

    it('должен форматировать размер файла в GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024, 'ru')).toContain('1');
      expect(formatFileSize(1024 * 1024 * 1024, 'ru')).toContain('GB');
    });
  });

  describe('formatCompact', () => {
    it('должен форматировать большие числа компактно', () => {
      expect(formatCompact(1000, 'ru')).toContain('1');
      expect(formatCompact(1000000, 'ru')).toContain('1');
      expect(formatCompact(1000000000, 'ru')).toContain('1');
    });
  });

  describe('formatDuration', () => {
    it('должен форматировать длительность в секундах', () => {
      expect(formatDuration(45, 'ru')).toBe('45 сек');
      expect(formatDuration(45, 'en')).toBe('45 sec');
    });

    it('должен форматировать длительность в минутах', () => {
      expect(formatDuration(90, 'ru')).toBe('1 мин 30 сек');
      expect(formatDuration(90, 'en')).toBe('1 min 30 sec');
    });

    it('должен форматировать длительность в часах', () => {
      expect(formatDuration(3665, 'ru')).toBe('1 ч 1 мин 5 сек');
      expect(formatDuration(3665, 'en')).toBe('1 h 1 min 5 sec');
    });
  });
});

describe('DateFormatter', () => {
  const testDate = new Date('2025-11-19T12:30:00Z');

  describe('formatDate', () => {
    it('должен форматировать дату для русского языка', () => {
      const formatted = formatDate(testDate, 'ru');
      expect(formatted).toContain('19');
      expect(formatted).toContain('2025');
    });

    it('должен форматировать дату для английского языка', () => {
      const formatted = formatDate(testDate, 'en');
      expect(formatted).toContain('19');
      expect(formatted).toContain('2025');
    });

    it('должен форматировать дату для казахского языка', () => {
      const formatted = formatDate(testDate, 'kk');
      expect(formatted).toContain('19');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatTime', () => {
    it('должен форматировать время', () => {
      const formatted = formatTime(testDate, 'ru');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatRelativeTime', () => {
    it('должен форматировать относительное время', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const formatted = formatRelativeTime(yesterday, 'ru');
      expect(formatted).toBeTruthy();
    });
  });
});

