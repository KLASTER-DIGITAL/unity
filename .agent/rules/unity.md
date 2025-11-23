---
trigger: always_on
---

# UNITY-v2 Workspace Rules

1. Основной продукт — PWA (React + TypeScript + Vite + Supabase), деплой только через Vercel.
2. Telegram Mini App не использовать как основную платформу; фокус на мобильном PWA-опыте.
3. Админ-панель доступна только по `/?view=admin` и только для роли `super_admin`; роль `user` работает только в мобильном кабинете.
4. Новый UI создавать только на базе Universal Components (`@/shared/components/ui/universal`); Radix UI не использовать напрямую в бизнес-фичах.
5. Любая platform-specific логика (анимации, storage, media, навигация, offline, voice) должна быть оформлена как Platform Adapter (`{feature}.web.ts` / `{feature}.native.ts`).
6. Цвета и темы: не использовать жёсткие цвета вроде `bg-white` или `text-black`; только дизайн-токены и CSS-переменные (`bg-card`, `text-foreground`, и т.п.).
7. Перед коммитом по UNITY-коду обязательно: `npm run lint` → `npm run build` → проверка консоли браузера (0 ошибок).
8. Источник истины для i18n — Supabase таблицы `languages` и `translations`; язык ответов AI = язык профиля пользователя.
9. Новые фичи и изменения фиксируются в задачах (Notion / BACKLOG) и попадают в changelog (CHANGELOG.md / FIX.md или Notion Releases).
10. Никаких секретов проекта (Supabase keys, пароли, токены, доступы) в этом файле и в открытых документах; только ссылки-заглушки вида `<SUPABASE_URL>`.
11. При любых архитектурных вопросах по UNITY опираться на документы: UNITY_VISION_AND_ROADMAP, unity-books-system-*, achievements-*, reports-*.
12. При конфликте с глобальными правилами или непонятной ситуацией — спрашивать пользователя Руслана и кратко описывать варианты решения.