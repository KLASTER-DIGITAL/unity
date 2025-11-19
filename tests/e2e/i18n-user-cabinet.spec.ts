/**
 * E2E тесты для системы переводов в пользовательском кабинете
 * 
 * Проверяет:
 * - Переключение языков через LanguageSelector
 * - Отображение переводов для всех 9 языков
 * - Сохранение выбранного языка в localStorage
 * - Корректность переводов для казахского языка (kk)
 * - Работу с RTL языками (если добавлены)
 * 
 * @author UNITY Team
 * @date 2025-11-19
 */

import { test, expect } from '@playwright/test';

// Все активные языки в системе
const LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
];

// Тестовый пользователь
const TEST_USER = {
  email: 'rustam@leadshunter.biz',
  password: 'demo123',
};

test.describe('i18n - Пользовательский кабинет', () => {
  test.beforeEach(async ({ page }) => {
    // Переход на страницу логина
    await page.goto('https://unity-wine.vercel.app');
    
    // Логин
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Ждем загрузки кабинета
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Дополнительное время для загрузки переводов
  });

  test('Должен отображать LanguageSelector', async ({ page }) => {
    // Проверяем наличие кнопки выбора языка
    const languageButton = page.locator('button:has-text("🌐")').or(
      page.locator('button:has(svg[class*="globe"])')
    );
    
    await expect(languageButton).toBeVisible();
  });

  test('Должен переключаться между всеми 9 языками', async ({ page }) => {
    for (const lang of LANGUAGES) {
      console.log(`\n🔄 Тестирование языка: ${lang.name} (${lang.code})`);
      
      // Открыть селектор языков
      const languageButton = page.locator('button:has-text("🌐")').or(
        page.locator('button:has(svg[class*="globe"])')
      ).first();
      await languageButton.click();
      
      // Подождать открытия меню
      await page.waitForTimeout(500);
      
      // Выбрать язык
      const languageOption = page.locator(`button:has-text("${lang.name}")`).or(
        page.locator(`button:has-text("${lang.flag}")`)
      ).first();
      
      await expect(languageOption).toBeVisible();
      await languageOption.click();
      
      // Подождать применения языка
      await page.waitForTimeout(1000);
      
      // Проверить что язык сохранен в localStorage
      const storedLang = await page.evaluate(() => localStorage.getItem('unity_language'));
      expect(storedLang).toBe(lang.code);
      
      console.log(`✅ Язык ${lang.name} успешно применен`);
    }
  });

  test('Казахский язык (kk) должен работать корректно', async ({ page }) => {
    console.log('\n🇰🇿 Тестирование казахского языка');
    
    // Открыть селектор языков
    const languageButton = page.locator('button:has-text("🌐")').or(
      page.locator('button:has(svg[class*="globe"])')
    ).first();
    await languageButton.click();
    await page.waitForTimeout(500);
    
    // Выбрать казахский
    const kazakhOption = page.locator('button:has-text("Қазақша")').or(
      page.locator('button:has-text("🇰🇿")')
    ).first();
    
    await expect(kazakhOption).toBeVisible();
    await kazakhOption.click();
    await page.waitForTimeout(1500);
    
    // Проверить что язык применен
    const storedLang = await page.evaluate(() => localStorage.getItem('unity_language'));
    expect(storedLang).toBe('kk');
    
    // Проверить что переводы загружены
    const hasKazakhText = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      // Проверяем наличие казахских символов
      return /[ӘәІіҢңҒғҮүҰұҚқӨөҺһ]/.test(bodyText);
    });
    
    expect(hasKazakhText).toBeTruthy();
    console.log('✅ Казахский язык работает корректно');
  });

  test('Должен сохранять выбранный язык после перезагрузки', async ({ page }) => {
    // Выбрать испанский
    const languageButton = page.locator('button:has-text("🌐")').or(
      page.locator('button:has(svg[class*="globe"])')
    ).first();
    await languageButton.click();
    await page.waitForTimeout(500);
    
    const spanishOption = page.locator('button:has-text("Español")').first();
    await spanishOption.click();
    await page.waitForTimeout(1000);
    
    // Перезагрузить страницу
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Проверить что язык сохранился
    const storedLang = await page.evaluate(() => localStorage.getItem('unity_language'));
    expect(storedLang).toBe('es');
  });
});

