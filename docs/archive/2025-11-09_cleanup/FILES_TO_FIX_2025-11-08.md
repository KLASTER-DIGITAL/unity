# 📋 ФАЙЛЫ ДЛЯ ИСПРАВЛЕНИЯ - ReferenceError

**Дата**: 2025-11-08  
**Ошибка**: Block-scoped variable used before declaration  
**Статус**: ⏳ ГОТОВЫ К ИСПРАВЛЕНИЮ

---

## 🚨 СПИСОК ФАЙЛОВ (14 шт)

### **Admin Features (7 файлов)**
1. ❌ `src/features/admin/analytics/components/AIAnalyticsTab.tsx:63` - `loadAIAnalytics`
2. ❌ `src/features/admin/dashboard/components/UsersManagementTab.tsx:41` - `loadUsers`
3. ❌ `src/features/admin/pwa/components/PWAOverview.tsx:90` - `loadStats`
4. ❌ `src/features/admin/pwa/components/PWASettings.tsx:69` - `loadSettings`
5. ❌ `src/features/admin/settings/components/LanguagesManagementTab.tsx:69` - `loadLanguages`
6. ❌ `src/features/admin/settings/components/SubscriptionsTab.tsx:31` - `loadSubscriptions`
7. ❌ `src/features/admin/settings/components/TranslationsManagementTab.tsx:43` - `loadTranslations`

### **Languages (1 файл)**
8. ❌ `src/features/admin/settings/components/languages/TranslationsStatisticsContent.tsx:61` - `loadStatistics`

### **Mobile Features (2 файла)**
9. ❌ `src/features/mobile/achievements/components/AchievementsScreen.tsx:67` - `loadAchievements`
10. ❌ `src/features/mobile/history/components/HistoryScreen.tsx:62` - `loadHistory`

### **Modals (1 файл)**
11. ❌ `src/features/mobile/settings/components/SubscriptionInfoModal.tsx:34` - `loadSubscriptionInfo`

### **Shared Components (3 файла)**
12. ❌ `src/shared/components/pwa/PushSubscriptionManager.tsx:43` - `setupPushNotifications`
13. ❌ `src/shared/components/pwa/PushSubscriptionManager.tsx:43` - `checkPushSupport`
14. ❌ `src/shared/components/ui/shadcn-io/3d-card/index.tsx:111` - `handleMouseMove`

---

## 🔧 РЕШЕНИЕ

**Для каждого файла:**
1. Добавить `import { useCallback }`
2. Обернуть функцию в `useCallback`
3. Переместить `useEffect` ПОСЛЕ определения
4. Добавить dependency array

---

## ✅ СТАТУС

- [ ] AIAnalyticsTab.tsx
- [ ] UsersManagementTab.tsx
- [ ] PWAOverview.tsx
- [ ] PWASettings.tsx
- [ ] LanguagesManagementTab.tsx
- [ ] SubscriptionsTab.tsx
- [ ] TranslationsManagementTab.tsx
- [ ] TranslationsStatisticsContent.tsx
- [ ] AchievementsScreen.tsx
- [ ] HistoryScreen.tsx
- [ ] SubscriptionInfoModal.tsx
- [ ] PushSubscriptionManager.tsx (2 функции)
- [ ] 3d-card/index.tsx

---

**ГОТОВЫ К ИСПРАВЛЕНИЮ!** 🚀

