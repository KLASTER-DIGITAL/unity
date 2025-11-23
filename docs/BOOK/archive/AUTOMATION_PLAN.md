# 🤖 План автоматизации (книги/отчёты/PDF)
Версия: 2025-11-22  
Назначение: связать тест-планы в `docs/BOOK` с реальными автотестами, которые нужно добавить.

## 1) Scope и уровни
- **UI smoke/integ (PWA/Web)**  
  - Рендер вкладок отчёта (AI/Mood/Categories).  
  - Загрузка сохранённого отчёта (мок Supabase + API_URLS).  
  - Клик «Создать книгу» → отображение BookCreationWizard.  
  - Открытие полки книг (BooksLibraryScreen).  
- **PDF**  
  - Snapshot `ReportPDFDocument` на фиксированных данных (стабильные фикстуры дат/языка).  
  - Проверка наличия основных блоков: статистика, mood distribution, achievements.  
- **I18n smoke (ru/en/ka/kk)**  
  - Формат дат в UI и PDF-просмотре.  
  - Наличие ключевых строк (заголовки, кнопки, PDF translations).  
- **Config**  
  - Тесты на конфиг: Supabase URL/Edge URL берутся из env, нет хардкодов порта/хоста.

## 2) Привязка к файлам
- Компоненты: `src/features/mobile/reports/components/ReportsScreen.tsx`, `ReportPDFDocument.tsx`.
- Конфиг: `shared/lib/api/config/urls` и будущий общий конфиг Supabase/Edge.
- Тестовые фикстуры: предложить `__fixtures__/reports/pdf.ts`, `__fixtures__/reports/ai.ts`.

## 3) Минимальный набор тестов (MVP)
1. **reports-smoke.spec.tsx**  
   - Рендер вкладок, переключение, мок сохранённого отчёта, кнопка «Создать книгу».
2. **reports-pdf.snapshot.spec.tsx**  
   - Snapshot рендера `ReportPDFDocument` с фикстурой, проверка ключевых текстов.
3. **i18n-smoke.spec.tsx**  
   - Параметризованный прогон для ru/en/ka/kk: формат дат и наличие переводов.
4. **config.spec.ts**  
   - Проверка, что Supabase/Edge URL читаются из env/конфига, отсутствует хардкод localhost:5173.

## 4) Инфраструктура и моки
- Моки Supabase: `@/utils/supabase/client` → фейковый объект с `auth.getSession()` и `from().select()`.
- Моки API_URLS: подменить через jest/vitest `vi.mock('@/shared/lib/api/config/urls', ...)`.
- Фиксированная `Date.now` в тестах PDF/i18n.

## 5) Критерии готовности
- Все 4 тестовых набора зелёные на CI.  
- Snapshot стабилен между запусками (фиксированные данные).  
- I18n smoke покрывает 4 языка без падений.  
- Конфиг тесты подтверждают отсутствие хардкодов.
