# Baseline Metrics - До реструктуризации

**Дата**: 2025-10-15
**Ветка**: feature/restructure
**Коммит**: Initial baseline

## Bundle Size

```
build/assets/index-CmlIQRc2.js     2,041.12 kB │ gzip: 494.99 kB
build/assets/index-DAcfHcq4.css      106.46 kB │ gzip:  17.60 kB
```

**Итого**:
- JS: 2,041 kB (495 kB gzipped)
- CSS: 106 kB (18 kB gzipped)
- **Общий размер**: 2,147 kB (513 kB gzipped)

## Структура проекта

```
src/
├── components/
│   ├── screens/
│   │   ├── admin/
│   │   │   ├── old/          ❌ ДУБЛИКАТЫ
│   │   │   └── settings/
│   │   ├── AchievementHomeScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ...
│   ├── ui/
│   ├── PWAHead.tsx
│   ├── MobileBottomNav.tsx
│   └── ...
├── utils/
│   ├── api.ts
│   ├── auth.ts
│   └── ...
└── App.tsx (958 строк)
```

**Проблемы**:
- ❌ Смешанная архитектура (mobile + admin в одной папке)
- ❌ Дубликаты в `admin/old/`
- ❌ Нет четкого разделения
- ❌ Большой App.tsx (958 строк)

## Целевые метрики (после реструктуризации)

- ✅ Bundle size: < 1,400 kB (< 350 kB gzipped) - **-30%**
- ✅ Lighthouse Performance: > 90
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Дубликаты кода: 0%
- ✅ Feature-based структура
- ✅ Monorepo-ready архитектура

