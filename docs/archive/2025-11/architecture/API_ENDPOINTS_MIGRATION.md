# 🔄 API Endpoints Migration Guide

**Дата**: 2025-10-20  
**Версия**: 1.0  
**Статус**: 🚧 В разработке

---

## 📋 Маппинг старых и новых endpoints

### 1. Voice Transcription

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/transcribe` | `POST /transcription-api/transcribe` | transcription-api |

**Изменения:**
- ✅ Поддержка нескольких языков (параметр `language`)
- ✅ Новый endpoint для batch транскрипции: `POST /transcription-api/transcribe/batch`

---

### 2. Media (уже реализовано в media микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/media/upload` | `POST /media/upload` | media |
| `POST /make-server-9729c493/media/signed-url` | `POST /media/signed-url` | media |
| `DELETE /make-server-9729c493/media/:path` | `DELETE /media/:path` | media |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 3. AI Analysis (уже реализовано в ai-analysis микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/analyze` | `POST /ai-analysis/analyze` | ai-analysis |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 4. Profiles (уже реализовано в profiles микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/profiles/create` | `POST /profiles/profiles/create` | profiles |
| `GET /make-server-9729c493/profiles/:userId` | `GET /profiles/profiles/:userId` | profiles |
| `GET /make-server-9729c493/profile/:userId` | `GET /profiles/profiles/:userId` | profiles |
| `PUT /make-server-9729c493/profile/:userId` | `PUT /profiles/profiles/:userId` | profiles |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 5. Entries (уже реализовано в entries микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/entries` | `POST /entries/` | entries |
| `POST /make-server-9729c493/entries/create` | `POST /entries/` | entries |
| `GET /make-server-9729c493/entries/:userId` | `GET /entries/:userId` | entries |
| `GET /make-server-9729c493/entries/list` | `GET /entries/:userId` | entries |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 6. Stats (уже реализовано в stats микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `GET /make-server-9729c493/stats/:userId` | `GET /stats/stats/user/:userId` | stats |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 7. Motivations (уже реализовано в motivations микросервисе)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `GET /make-server-9729c493/motivations/cards/:userId` | `GET /motivations/cards/:userId` | motivations |
| `POST /make-server-9729c493/motivations/mark-read` | `POST /motivations/mark-read` | motivations |

**Статус:** ✅ Уже реализовано, нужно только обновить frontend

---

### 8. Admin Endpoints (новый admin-api микросервис)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `GET /make-server-9729c493/admin/stats` | `GET /admin-api/admin/stats` | admin-api |
| `GET /make-server-9729c493/admin/users` | `GET /admin-api/admin/users` | admin-api |
| `GET /make-server-9729c493/admin/settings/:key` | `GET /admin-api/admin/settings/:key` | admin-api |
| `POST /make-server-9729c493/admin/settings` | `POST /admin-api/admin/settings` | admin-api |
| `GET /make-server-9729c493/admin/languages` | `GET /admin-api/admin/languages` | admin-api |
| `POST /make-server-9729c493/admin/languages` | `POST /admin-api/admin/languages` | admin-api |
| `PUT /make-server-9729c493/admin/languages/:code` | `PUT /admin-api/admin/languages/:code` | admin-api |
| `GET /make-server-9729c493/admin/translations` | `GET /admin-api/admin/translations` | admin-api |
| `POST /make-server-9729c493/admin/translations` | `POST /admin-api/admin/translations` | admin-api |

**Статус:** 🆕 Новый микросервис, нужно обновить frontend

---

### 9. i18n Public Endpoints (расширенный translations-api)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `GET /make-server-9729c493/i18n/languages` | `GET /translations-api/languages` | translations-api |
| `GET /make-server-9729c493/i18n/translations/:lang` | `GET /translations-api/:lang` | translations-api |
| `GET /make-server-9729c493/i18n/keys` | `GET /translations-api/keys` | translations-api |
| `POST /make-server-9729c493/i18n/missing` | `POST /translations-api/missing` | translations-api |
| `GET /make-server-9729c493/i18n/health` | `GET /translations-api/health` | translations-api |

**Статус:** ✅ Расширен, нужно обновить frontend

---

### 10. i18n Admin Endpoints (новый admin-api микросервис)

| Старый endpoint | Новый endpoint | Микросервис |
|----------------|----------------|-------------|
| `POST /make-server-9729c493/i18n/admin/translate` | `POST /admin-api/admin/translate` | admin-api |
| `PUT /make-server-9729c493/i18n/admin/translations` | `PUT /admin-api/admin/translations` | admin-api |
| `GET /make-server-9729c493/i18n/admin/stats` | `GET /admin-api/admin/translation-stats` | admin-api |

**Статус:** 🆕 Новый микросервис, нужно обновить frontend

---

## 📝 Файлы для обновления

### 1. src/utils/api.ts
**Действие:** Удалить `API_BASE_URL` к make-server-9729c493

### 2. src/shared/lib/api/api.ts
**Действие:** Удалить `LEGACY_API_URL` к make-server-9729c493

### 3. src/shared/lib/i18n/api.ts
**Действие:** Заменить на `translations-api`

### 4. src/features/admin/auth/components/AdminLoginScreen.tsx
**Действие:** Заменить на `profiles` микросервис

### 5. src/features/admin/dashboard/components/UsersManagementTab.tsx
**Действие:** Заменить на `admin-api` микросервис

### 6. src/features/admin/dashboard/components/AdminDashboard.tsx
**Действие:** Заменить на `admin-api` микросервис

### 7. src/features/mobile/auth/components/WelcomeScreen.tsx
**Действие:** Заменить на `translations-api` микросервис

### 8. src/components/screens/admin/settings/GeneralSettingsTab.tsx
**Действие:** Заменить на `admin-api` микросервис

### 9. src/components/screens/admin/settings/SystemSettingsTab.tsx
**Действие:** Заменить на `admin-api` микросервис (если есть admin endpoints)

### 10. src/components/screens/admin/settings/PWASettingsTab.tsx
**Действие:** Заменить на `admin-api` микросервис

### 11. src/components/screens/admin/settings/APISettingsTab.tsx
**Действие:** Заменить на `admin-api` микросервис

### 12. src/components/screens/admin/settings/LanguagesTab.tsx
**Действие:** Заменить на `admin-api` микросервис

### 13. src/components/screens/admin/settings/PushNotificationsTab.tsx
**Действие:** Заменить на `admin-api` микросервис (если есть admin endpoints)

---

## 🔧 Примеры замены

### Пример 1: Admin Stats

**Старый код:**
```typescript
const response = await fetch(
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/stats',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

**Новый код:**
```typescript
const response = await fetch(
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/admin/stats',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

---

### Пример 2: Translations

**Старый код:**
```typescript
const response = await fetch(
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/i18n/languages',
  {
    method: 'GET'
  }
);
```

**Новый код:**
```typescript
const response = await fetch(
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/translations-api/languages',
  {
    method: 'GET'
  }
);
```

---

### Пример 3: Profiles

**Старый код:**
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-9729c493/profiles/${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

**Новый код:**
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/profiles/profiles/${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

---

## ✅ Чеклист обновления

- [ ] Обновить `src/utils/api.ts`
- [ ] Обновить `src/shared/lib/api/api.ts`
- [ ] Обновить `src/shared/lib/i18n/api.ts`
- [ ] Обновить `src/features/admin/auth/components/AdminLoginScreen.tsx`
- [ ] Обновить `src/features/admin/dashboard/components/UsersManagementTab.tsx`
- [ ] Обновить `src/features/admin/dashboard/components/AdminDashboard.tsx`
- [ ] Обновить `src/features/mobile/auth/components/WelcomeScreen.tsx`
- [ ] Обновить `src/components/screens/admin/settings/GeneralSettingsTab.tsx`
- [ ] Обновить `src/components/screens/admin/settings/SystemSettingsTab.tsx`
- [ ] Обновить `src/components/screens/admin/settings/PWASettingsTab.tsx`
- [ ] Обновить `src/components/screens/admin/settings/APISettingsTab.tsx`
- [ ] Обновить `src/components/screens/admin/settings/LanguagesTab.tsx`
- [ ] Обновить `src/components/screens/admin/settings/PushNotificationsTab.tsx`
- [ ] Удалить `src/supabase/functions/server/index.tsx` (дубликат)
- [ ] Проверить отсутствие вызовов к make-server-9729c493
- [ ] Протестировать все функции локально
- [ ] Протестировать на production

