# 📊 Визуальное руководство по аудиту UNITY-v2

**Дата:** 2025-10-23  
**Связанные документы:**
- [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md) - Полный отчет
- [AUDIT_EXECUTIVE_SUMMARY_2025-10-23.md](AUDIT_EXECUTIVE_SUMMARY_2025-10-23.md) - Краткая сводка

---

## 🏗️ Архитектура проекта

### Текущая структура Feature-Sliced Design

```mermaid
graph TB
    subgraph "UNITY-v2 Architecture"
        App[App.tsx<br/>Точка входа]
        
        subgraph "app/ - Приложения"
            MobileApp[mobile/MobileApp.tsx<br/>PWA max-w-md]
            AdminApp[admin/AdminApp.tsx<br/>Admin full-width]
        end
        
        subgraph "features/ - Фичи"
            subgraph "mobile/ - 6 фич"
                Auth[auth/<br/>Авторизация]
                Home[home/<br/>Главный экран]
                History[history/<br/>История]
                Achievements[achievements/<br/>Достижения]
                Reports[reports/<br/>Отчеты]
                Settings[settings/<br/>Настройки]
            end
            
            subgraph "admin/ - 5 фич"
                AdminAuth[auth/<br/>Админ вход]
                Dashboard[dashboard/<br/>Панель управления]
                AdminSettings[settings/<br/>Настройки системы]
                PWA[pwa/<br/>PWA управление]
                Analytics[analytics/<br/>AI аналитика]
            end
        end
        
        subgraph "shared/ - Общее"
            Components[components/<br/>62 компонента]
            Lib[lib/<br/>Утилиты + API]
            UI[ui/<br/>49 shadcn/ui]
        end
        
        App --> MobileApp
        App --> AdminApp
        
        MobileApp --> Auth
        MobileApp --> Home
        MobileApp --> History
        MobileApp --> Achievements
        MobileApp --> Reports
        MobileApp --> Settings
        
        AdminApp --> AdminAuth
        AdminApp --> Dashboard
        AdminApp --> AdminSettings
        AdminApp --> PWA
        AdminApp --> Analytics
        
        Auth --> Components
        Home --> Components
        Dashboard --> Components
        
        Components --> Lib
        Components --> UI
    end
    
    style App fill:#ff6b6b
    style MobileApp fill:#4ecdc4
    style AdminApp fill:#45b7d1
    style Components fill:#96ceb4
    style Lib fill:#ffeaa7
    style UI fill:#dfe6e9
```

---

## 🔍 Проблемы кодовой базы

### Дублирование компонентов

```mermaid
graph LR
    subgraph "❌ Дублирование"
        A1[src/components/ui/shadcn-io/counter/]
        A2[src/shared/components/ui/shadcn-io/counter/]
        
        B1[src/components/ui/shadcn-io/shimmering-text/]
        B2[src/shared/components/ui/shadcn-io/shimmering-text/]
        
        C1[src/components/ui/utils.ts]
        C2[src/shared/components/ui/utils.ts]
    end
    
    subgraph "✅ Решение"
        D[Удалить src/components/ui/<br/>Использовать только src/shared/]
    end
    
    A1 -.-> D
    A2 -.-> D
    B1 -.-> D
    B2 -.-> D
    C1 -.-> D
    C2 -.-> D
    
    style A1 fill:#ff6b6b
    style B1 fill:#ff6b6b
    style C1 fill:#ff6b6b
    style A2 fill:#4ecdc4
    style B2 fill:#4ecdc4
    style C2 fill:#4ecdc4
    style D fill:#96ceb4
```

---

## 🗄️ База данных

### Схема основных таблиц

```mermaid
erDiagram
    PROFILES ||--o{ ENTRIES : creates
    PROFILES ||--o{ MEDIA_FILES : uploads
    PROFILES ||--o{ PUSH_SUBSCRIPTIONS : has
    PROFILES ||--o{ MOTIVATION_CARDS : receives
    PROFILES ||--o{ ACHIEVEMENTS : earns
    
    ENTRIES ||--o{ MEDIA_FILES : contains
    
    PROFILES {
        uuid id PK
        string email
        string name
        string role
        string language
        string theme
        timestamp created_at
    }
    
    ENTRIES {
        uuid id PK
        uuid user_id FK
        text text
        string sentiment
        string category
        string mood
        jsonb media
        text ai_reply
        timestamp created_at
    }
    
    MEDIA_FILES {
        uuid id PK
        uuid user_id FK
        uuid entry_id FK
        string file_path
        string file_type
        integer file_size
        timestamp created_at
    }
    
    PUSH_SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        string endpoint
        string p256dh
        string auth
        timestamp created_at
    }
    
    MOTIVATION_CARDS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string category
        boolean is_read
        timestamp created_at
    }
    
    ACHIEVEMENTS {
        uuid id PK
        uuid user_id FK
        string achievement_type
        timestamp earned_at
    }
```

---

## 🔐 RBAC (Role-Based Access Control)

### Контроль доступа

```mermaid
flowchart TD
    Start([Пользователь заходит на сайт])
    
    CheckURL{URL содержит<br/>?view=admin?}
    
    CheckSession[Проверка сессии<br/>checkSession]
    
    GetRole{Получить роль<br/>из profiles}
    
    IsAdmin{role === 'super_admin'?}
    IsUser{role === 'user'?}
    
    AdminView[Показать<br/>AdminApp]
    MobileView[Показать<br/>MobileApp]
    
    RedirectAdmin[Редирект на<br/>/?view=admin]
    RedirectMobile[Редирект на<br/>/]
    
    Logout[Выход из системы]
    
    Start --> CheckURL
    
    CheckURL -->|Да| CheckSession
    CheckURL -->|Нет| CheckSession
    
    CheckSession --> GetRole
    
    GetRole --> IsAdmin
    
    IsAdmin -->|Да + ?view=admin| AdminView
    IsAdmin -->|Да + без ?view=admin| RedirectAdmin
    IsAdmin -->|Нет| IsUser
    
    IsUser -->|Да + ?view=admin| Logout
    IsUser -->|Да + без ?view=admin| MobileView
    IsUser -->|Нет| Logout
    
    style Start fill:#4ecdc4
    style AdminView fill:#45b7d1
    style MobileView fill:#96ceb4
    style Logout fill:#ff6b6b
    style RedirectAdmin fill:#ffeaa7
    style RedirectMobile fill:#ffeaa7
```

---

## 🚀 Action Plan Timeline

### Фазы выполнения

```mermaid
gantt
    title Комплексный аудит UNITY-v2 - План выполнения
    dateFormat YYYY-MM-DD
    section Фаза 1: Очистка
    Удалить дублирующиеся UI компоненты :done, p0-1, 2025-10-23, 1d
    Удалить backup файлы :done, p0-2, 2025-10-23, 1d
    Удалить мертвый код :done, p0-3, 2025-10-23, 1d
    Переместить legacy скрипты :done, p0-4, 2025-10-24, 1d
    
    section Фаза 2: Безопасность БД
    Исправить Security Warnings :active, p1-1, 2025-10-24, 2d
    Оптимизировать RLS policies :p1-2, 2025-10-26, 2d
    Удалить неиспользуемые индексы :p1-3, 2025-10-28, 1d
    
    section Фаза 3: Документация
    Edge Functions API Reference :p2-1, 2025-10-29, 2d
    Database Schema Documentation :p2-2, 2025-10-31, 2d
    Error Handling Guide :p2-3, 2025-11-02, 1d
    Testing Strategy :p2-4, 2025-11-03, 1d
    Component Library Catalog :p2-5, 2025-11-04, 1d
    
    section Фаза 4: React Native
    Platform-specific imports :p3-1, 2025-11-05, 5d
    Тестирование Platform Adapters :p3-2, 2025-11-10, 3d
    Миграция legacy кода :p3-3, 2025-11-13, 5d
    React Native Migration Checklist :p3-4, 2025-11-18, 2d
    
    section Фаза 5: Финал
    Финальное тестирование :p4-1, 2025-11-20, 2d
    Lighthouse audit :p4-2, 2025-11-22, 1d
    Финальный отчет :p4-3, 2025-11-23, 1d
```

---

## 📊 Метрики прогресса

### Текущее vs Целевое состояние

```mermaid
graph LR
    subgraph "Текущее состояние"
        A1[Дублирующиеся файлы: 8]
        A2[Backup файлы: 3]
        A3[Мертвый код: 7]
        A4[Security WARN: 6]
        A5[Performance WARN: 21]
        A6[Docs ratio: 28%]
        A7[RN готовность: 90%]
    end
    
    subgraph "Целевое состояние"
        B1[Дублирующиеся файлы: 0 ✅]
        B2[Backup файлы: 0 ✅]
        B3[Мертвый код: 0 ✅]
        B4[Security WARN: 0 ✅]
        B5[Performance WARN: < 5 ✅]
        B6[Docs ratio: < 30% ✅]
        B7[RN готовность: 100% ✅]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    A5 --> B5
    A6 --> B6
    A7 --> B7
    
    style A1 fill:#ff6b6b
    style A2 fill:#ff6b6b
    style A3 fill:#ff6b6b
    style A4 fill:#ffeaa7
    style A5 fill:#ffeaa7
    style A6 fill:#96ceb4
    style A7 fill:#96ceb4
    
    style B1 fill:#96ceb4
    style B2 fill:#96ceb4
    style B3 fill:#96ceb4
    style B4 fill:#96ceb4
    style B5 fill:#96ceb4
    style B6 fill:#96ceb4
    style B7 fill:#96ceb4
```

---

## 🔄 Edge Functions Architecture

### Микросервисная архитектура

```mermaid
graph TB
    subgraph "Client"
        PWA[PWA App]
        Admin[Admin Panel]
    end
    
    subgraph "Edge Functions (13 микросервисов)"
        AdminAPI[admin-api<br/>Админ API]
        AIAnalysis[ai-analysis<br/>AI анализ]
        AutoTranslate[auto-translate<br/>Автоперевод]
        Entries[entries<br/>CRUD записей]
        Media[media<br/>Медиафайлы]
        Motivations[motivations<br/>Мотивация]
        Profiles[profiles<br/>Профили]
        PushSender[push-sender<br/>Push уведомления]
        Stats[stats<br/>Статистика]
        TelegramAuth[telegram-auth<br/>Telegram вход]
        Transcription[transcription-api<br/>Транскрипция]
        TranslationsAPI[translations-api<br/>API переводов]
        TranslationsMgmt[translations-management<br/>Управление переводами]
    end
    
    subgraph "Supabase"
        DB[(PostgreSQL<br/>15 таблиц)]
        Storage[(Storage<br/>Медиа)]
        Auth[(Auth<br/>Пользователи)]
    end
    
    subgraph "External APIs"
        OpenAI[OpenAI<br/>GPT-4 / GPT-4o-mini]
        WebPush[Web Push<br/>VAPID]
    end
    
    PWA --> Entries
    PWA --> Media
    PWA --> Profiles
    PWA --> Stats
    PWA --> Motivations
    PWA --> TelegramAuth
    
    Admin --> AdminAPI
    Admin --> AutoTranslate
    Admin --> TranslationsMgmt
    Admin --> PushSender
    
    Entries --> DB
    Media --> Storage
    Profiles --> Auth
    AdminAPI --> DB
    
    AIAnalysis --> OpenAI
    AutoTranslate --> OpenAI
    Transcription --> OpenAI
    PushSender --> WebPush
    
    style PWA fill:#4ecdc4
    style Admin fill:#45b7d1
    style DB fill:#96ceb4
    style Storage fill:#ffeaa7
    style Auth fill:#dfe6e9
    style OpenAI fill:#ff6b6b
    style WebPush fill:#ff6b6b
```

---

## 🎯 Приоритизация задач

### Impact vs Effort Matrix

```mermaid
quadrantChart
    title Impact vs Effort Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Schedule (High Impact, High Effort)
    quadrant-2 Do First (High Impact, Low Effort)
    quadrant-3 Fill In (Low Impact, Low Effort)
    quadrant-4 Don't Do (Low Impact, High Effort)
    
    Удалить дублирующиеся UI: [0.2, 0.9]
    Удалить backup файлы: [0.1, 0.8]
    Исправить Security WARN: [0.3, 0.9]
    Добавить константы: [0.2, 0.7]
    
    Исправить Performance WARN: [0.6, 0.8]
    Миграция legacy кода: [0.7, 0.7]
    Platform-specific imports: [0.6, 0.8]
    
    Переместить legacy скрипты: [0.1, 0.3]
    Добавить JSDoc: [0.4, 0.4]
    Комментарии в Edge Functions: [0.3, 0.3]
    
    Полная миграция на React Native: [0.9, 0.2]
```

---

**Дата создания:** 2025-10-23  
**Автор:** AI Assistant (Augment Agent)  
**Версия:** 1.0

