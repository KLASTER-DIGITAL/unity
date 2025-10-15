# PRD: Admin Panel Redesign

**Версия:** 2.0  
**Дата:** Октябрь 2025  
**Статус:** В разработке  
**Аудитория:** Frontend разработчики, UX/UI дизайнеры, DevOps

---

## 📋 Содержание

1. Проблемы текущей версии
2. Архитектура админ-панели
3. Design System
4. Модули и экраны
5. Form Validation & UX
6. API Integration
7. Acceptance Criteria
8. Метрики

---

## 1. Проблемы текущей версии

### 1.1 Критические дефекты

```
❌ Отсутствие адаптивности
   - Не работает на мобиль (< 1024px)
   - Не работает на планшет (768px)
   - Фиксированные размеры без break-points

❌ Отсутствие валидации
   - Нет проверки формата данных
   - Нет inline error messages
   - Нет required field indicators

❌ Неработающие кнопки
   - "Сохранить" не имеет обработчика
   - Отсутствует API интеграция
   - Нет feedback при сохранении

❌ Плохая архитектура информации
   - Всё в один раздел "Настройки"
   - Более 15 форм на одной странице
   - Без группировки и логической иерархии

❌ Отсутствие фидбека
   - Нет toast notifications
   - Нет loading states
   - Нет error handling

❌ Устаревший дизайн
   - Материал 2015 года
   - Несогласованные цвета
   - Неправильные шрифты и размеры
   - Плохой contrast ratio (WCAG не соответствует)

❌ Отсутствие обработки ошибок
   - Нет retry logic
   - Нет fallback UI
   - Нет error boundaries
```

### 1.2 User Impact

```
Текущие проблемы:
- Админы не могут настроить систему на мобильном устройстве
- Невозможно понять, сохранены ли изменения
- Легко потерять данные из-за отсутствия валидации
- Медленное и трудное управление системой
- Нет мониторинга и аналитики

Результат:
- Low adoption (админы избегают использования панели)
- Неправильные конфигурации
- System misconfiguration-related bugs
- User complaints about feature flags/settings
```

---

## 2. Архитектура админ-панели

### 2.1 Структура навигации

```
Admin Dashboard
├─ [Overview] ⚡
│  ├─ System status (real-time)
│  ├─ Key metrics (DAU, entries, PDFs, errors)
│  ├─ Recent activities
│  └─ Quick actions
│
├─ [Users Management] 👥
│  ├─ User list (searchable, filterable)
│  ├─ User detail page (edit, ban, reset pwd)
│  ├─ Roles & permissions
│  └─ Activity logs
│
├─ [Subscriptions] 💳
│  ├─ Pricing plans
│  ├─ Active subscriptions
│  ├─ Revenue metrics
│  └─ Refunds & disputes
│
├─ [Settings] ⚙️ (REDESIGNED)
│  ├─ [General] 📱 (app config, limits)
│  ├─ [API & Services] 🤖 (OpenAI, token budget)
│  ├─ [Notifications] 🔔 (push, email, Telegram)
│  ├─ [Languages] 🌍 (translations, localization)
│  ├─ [Advanced] ⚠️ (backup, export, cleanup)
│  └─ [Feature Flags] 🚀 (toggle features)
│
├─ [Monitoring] 📊 (expanded)
│  ├─ System health (CPU, memory, disk)
│  ├─ API logs (with filters)
│  ├─ Error tracking
│  ├─ Performance metrics
│  └─ Uptime dashboard
│
└─ [User Profile & Logout]
   ├─ Admin details
   ├─ Change password
   └─ Logout
```

### 2.2 Database Schema

```typescript
AdminUsers Table:
- id (UUID)
- email (string) - unique
- passwordHash (string)
- name (string)
- role (enum: admin, superadmin)
- lastLogin (timestamp)
- ipAddress (string)
- createdAt (timestamp)

AdminLogs Table:
- id (UUID)
- adminId (UUID)
- action (string: "create", "update", "delete")
- resource (string: "user", "settings", "subscription")
- resourceId (UUID)
- changes (JSON) - {old: {...}, new: {...}}
- timestamp (timestamp)
- ipAddress (string)

SystemSettings Table:
- id (UUID)
- section (string: "general", "api", "notifications", "advanced")
- key (string)
- value (JSON or string)
- type (string: "string", "number", "boolean", "json")
- updatedAt (timestamp)
- updatedBy (UUID) - FK to AdminUsers
```

---

## 3. Design System

### 3.1 Color Palette

```
Primary:     #007BFF (blue)        - Actions, CTAs
Secondary:   #6C757D (gray)        - Secondary actions
Success:     #28A745 (green)       - Success states
Warning:     #FFC107 (yellow)      - Warnings, cautions
Danger:      #DC3545 (red)         - Errors, destructive
Info:        #17A2B8 (cyan)        - Info messages
Light:       #F8F9FA (light gray)  - Backgrounds
Dark:        #212529 (dark gray)   - Text
```

### 3.2 Typography

```
Font: Inter / Roboto (fallback)
Weight: 400 (regular), 600 (semibold), 700 (bold)

Sizes:
- H1: 32px, 700, line-height 1.2
- H2: 24px, 700, line-height 1.3
- H3: 20px, 600, line-height 1.4
- Body: 16px, 400, line-height 1.5
- Small: 14px, 400, line-height 1.4
- Tiny: 12px, 400, line-height 1.3
```

### 3.3 Spacing (8px Grid)

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px

Padding:
- Buttons: 12px vertical, 20px horizontal
- Cards: 20px
- Modals: 24px
- Inputs: 12px vertical, 16px horizontal

Margins:
- Between sections: 32px
- Between fields: 16px
- Between labels & inputs: 8px
```

### 3.4 Components

```typescript
// Button (Primary/Secondary/Danger)
<Button variant="primary" size="md" disabled={false}>
  Save Changes
</Button>

// Input (with label, helper, error)
<Input
  label="API Key"
  type="password"
  value={apiKey}
  onChange={setApiKey}
  error={errors.apiKey}
  helper="Keep this secret"
  required
/>

// Select
<Select
  label="Language"
  options={languages}
  value={selected}
  onChange={setSelected}
/>

// Toggle / Switch
<Toggle
  label="Enable Push Notifications"
  checked={enabled}
  onChange={setEnabled}
/>

// Card (section container)
<Card title="OpenAI Integration" subtitle="API Settings">
  {/* content */}
</Card>

// Table (with sorting, filtering, pagination)
<Table
  columns={columns}
  data={data}
  sortable
  filterable
  pagination={{ page, pageSize }}
/>

// Modal / Dialog
<Modal open={open} title="Confirm Delete?" onClose={closeModal}>
  {/* content */}
  <ModalActions>
    <Button onClick={cancel}>Cancel</Button>
    <Button variant="danger" onClick={confirm}>Delete</Button>
  </ModalActions>
</Modal>

// Toast / Notification
toast.success("Settings saved");
toast.error("Failed to save");
toast.warning("Are you sure?");
```

---

## 4. Модули и экраны

### 4.1 Overview (Dashboard)

```
┌────────────────────────────────────────┐
│ Admin Dashboard                        │
├────────────────────────────────────────┤
│                                        │
│ SYSTEM STATUS (Real-time)             │
│ ════════════════════════════════════   │
│ 🟢 CPU        25% ▓▓░░░░░░░░░░░░    │
│ 🟢 Memory     62% ▓▓▓▓▓▓░░░░░░░░    │
│ 🟡 Disk       78% ▓▓▓▓▓▓▓░░░░░░░    │
│ 🟢 Database   Connected ✓             │
│ 🟢 API Server Active ✓                │
│                                        │
│ Uptime: 99.8% (30 days)              │
│                                        │
│ ────────────────────────────────────   │
│ KEY METRICS (Last 24h)                │
│ ════════════════════════════════════   │
│                                        │
│ ┌──────────┬──────────┬──────────┐   │
│ │👥 Active │📝Entries │📚PDFs    │   │
│ │ 1,248    │  4,521   │   156    │   │
│ └──────────┴──────────┴──────────┘   │
│                                        │
│ ┌──────────┬──────────┬──────────┐   │
│ │💬AI Calls│⚠️Errors │💰Revenue │   │
│ │ 12,340   │    23    │ $4,521   │   │
│ └──────────┴──────────┴──────────┘   │
│                                        │
│ ────────────────────────────────────   │
│ RECENT ACTIVITIES                      │
│ ════════════════════════════════════   │
│                                        │
│ [14:32] ✓ PDF generated (book_5f8e)  │
│ [14:28] ✓ User signup (user@example) │
│ [14:15] ⚠️ API timeout (OpenAI)       │
│ [13:50] ✓ Email sent (monthly report)│
│                                        │
│ [View All]                            │
│                                        │
│ Status: ✓ System operating normally   │
└────────────────────────────────────────┘

Responsive:
- Mobile: 1 column, full width
- Tablet: 2 columns
- Desktop: 3 columns (cards side by side)

Real-time updates via WebSocket (5s refresh)
```

### 4.2 Settings > General

```
┌────────────────────────────────────────┐
│ ⚙️ Settings > General                  │
├────────────────────────────────────────┤
│                                        │
│ 📱 Application Configuration           │
│ ─────────────────────────────────────  │
│                                        │
│ Application Name*                      │
│ [Дневник Достижений              ]   │
│ The name shown to users in the app   │
│                                        │
│ Logo URL                              │
│ [https://example.com/logo.png    ]   │
│ Recommended: PNG, 256×256, <1MB      │
│ [Preview] [Upload]                    │
│                                        │
│ Support Email*                        │
│ [support@diary.com               ]   │
│ Users will contact this email        │
│                                        │
│ Support Website (optional)            │
│ [https://help.diary.com          ]   │
│                                        │
│ ─────────────────────────────────────  │
│ 📊 System Limits                      │
│                                        │
│ Max Entries Per Day                  │
│ [10] entries                         │
│ Prevent abuse and API rate limits    │
│                                        │
│ Default Language                      │
│ [Russian (Русский) ▼]                │
│ Default for new users               │
│                                        │
│ Max Users (soft limit)                │
│ [10000] users                        │
│ Alert when exceeded (advisory only)  │
│                                        │
│ ─────────────────────────────────────  │
│ 🔐 Maintenance                        │
│                                        │
│ Maintenance Mode                      │
│ ◉ Disabled                           │
│ ○ Enabled (only admins can access)  │
│ Message (shown to users):            │
│ [System maintenance in progress... ] │
│                                        │
│ ─────────────────────────────────────  │
│ [Reset to Defaults] [Save Changes ✓] │
│                                        │
│ Status: ✓ Last saved 2 hours ago     │
│ Changed by: admin@example.com        │
└────────────────────────────────────────┘
```

### 4.3 Settings > API & Services

```
┌────────────────────────────────────────┐
│ ⚙️ Settings > API & Services           │
├────────────────────────────────────────┤
│                                        │
│ 🤖 OpenAI Integration                 │
│ ─────────────────────────────────────  │
│                                        │
│ API Key*                              │
│ [●●●●●●●●●●●●●●●●●●●●●] [👁] [📋] │
│ Keep this secret! Never share        │
│ ⓘ Last rotated: 30 days ago         │
│                                        │
│ Model Selection*                      │
│ [gpt-4-turbo ▼]                      │
│ Available: gpt-4-turbo, gpt-4, gpt-3.5-turbo │
│                                        │
│ Temperature (Creativity)              │
│ [0.7 ════════════ 1.0]               │
│ 0.5 = Focused, 1.0 = Creative       │
│                                        │
│ ─────────────────────────────────────  │
│ 📈 Token Budget                       │
│                                        │
│ Monthly Budget*                       │
│ [100,000] tokens                     │
│ Maximum tokens allowed per month     │
│                                        │
│ Current Usage                         │
│ ▓▓▓▓▓▓░░░░░░ 45% (45,000/100,000)  │
│ Reset on: 1st of each month         │
│ Days remaining: 16                  │
│ Projected: 92,000 / 100,000 ⚠️      │
│                                        │
│ ─────────────────────────────────────  │
│ ✓ Service Status                      │
│                                        │
│ OpenAI Connection                     │
│ ✓ Connected (response: 234ms)        │
│ Last check: 2 minutes ago            │
│                                        │
│ API Rate Limit                        │
│ ✓ Active (3,500 RPM available)      │
│ Current rate: 850 req/min            │
│                                        │
│ Error Rate                            │
│ ✓ Healthy (0.18%)                   │
│ Target: < 0.5%                      │
│                                        │
│ ─────────────────────────────────────  │
│ [Test Connection] [Save Changes ✓]   │
│                                        │
│ Status: ✓ Changes saved successfully │
└────────────────────────────────────────┘
```

### 4.4 Settings > Notifications

```
┌────────────────────────────────────────┐
│ ⚙️ Settings > Notifications            │
├────────────────────────────────────────┤
│                                        │
│ 🔔 Push Notifications                 │
│ ─────────────────────────────────────  │
│                                        │
│ Enable Push Notifications             │
│ ◉ Yes          ○ No                  │
│                                        │
│ [if enabled, show:]                   │
│                                        │
│ Default Title*                        │
│ [Новое достижение!              ]   │
│ 2-10 words, shown on lock screen    │
│                                        │
│ Default Message*                      │
│ [Поздравляем! Ты записал новое    │
│  достижение 🎉                   ]   │
│ Max 150 characters (emoji allowed)   │
│ Remaining: 75                        │
│                                        │
│ Icon URL                              │
│ [https://example.com/icon.png    ]   │
│ 192×192px PNG (optional)            │
│                                        │
│ Badge URL                             │
│ [https://example.com/badge.png   ]   │
│ Notification badge (optional)        │
│                                        │
│ ─────────────────────────────────────  │
│ 📧 Email Settings                    │
│                                        │
│ Send Summary Emails                   │
│ ◉ Daily                              │
│ ○ Weekly                             │
│ ○ Monthly                            │
│ ○ Never                              │
│                                        │
│ Email Template                        │
│ [Select template ▼]                  │
│ [Preview] [Edit Custom]               │
│                                        │
│ Recipient Email                       │
│ [admin@example.com]                  │
│                                        │
│ ─────────────────────────────────────  │
│ 🤖 Telegram Bot Integration           │
│                                        │
│ Enable Telegram Notifications         │
│ ◉ Yes          ○ No                  │
│                                        │
│ [if enabled:]                         │
│                                        │
│ Bot Token*                            │
│ [●●●●●●●●●●●●●●●●●●●●●●●●●●●●]    │
│ Get from @BotFather (keep secret!)  │
│ [Test Token]                         │
│                                        │
│ Bot Status                            │
│ ✓ Connected (checking messages)      │
│ Active users: 1,248                  │
│                                        │
│ ─────────────────────────────────────  │
│ ⏰ Scheduled Notifications            │
│                                        │
│ Morning Reminder                      │
│ ☑ Enabled                            │
│ Time: [08:30 ▼]                      │
│ Message: [Default ▼] [Custom ▼]    │
│ Days: [Mon] [Tue] [Wed] [Thu]      │
│       [Fri] [Sat] [Sun]            │
│                                        │
│ Evening Reminder                      │
│ ☑ Enabled                            │
│ Time: [21:00 ▼]                      │
│ Message: [Default ▼] [Custom ▼]    │
│ Days: [Mon-Fri only]                │
│                                        │
│ [+ Add Custom Schedule]               │
│ [Save Changes ✓]                      │
│                                        │
│ Status: ✓ All changes saved          │
└────────────────────────────────────────┘
```

### 4.5 Settings > Languages

```
┌────────────────────────────────────────┐
│ ⚙️ Settings > Languages & Translations │
├────────────────────────────────────────┤
│                                        │
│ 🌍 Supported Languages                │
│ ─────────────────────────────────────  │
│                                        │
│ Language Management                   │
│                                        │
│ 🇷🇺 Russian (Русский)                 │
│ Status: ✓ Complete                    │
│ Last updated: Oct 14, 2025            │
│ Progress: 100% ▓▓▓▓▓▓▓▓▓▓           │
│ [Edit] [Download JSON] [Reset]       │
│                                        │
│ 🇬🇧 English (English)                 │
│ Status: ✓ Complete                    │
│ Last updated: Oct 12, 2025            │
│ Progress: 100% ▓▓▓▓▓▓▓▓▓▓           │
│ [Edit] [Download JSON] [Reset]       │
│                                        │
│ 🇪🇸 Spanish (Español)                 │
│ Status: ⚠ Needs Review                │
│ Last updated: Oct 5, 2025             │
│ Progress: 85% ▓▓▓▓▓▓▓░░░            │
│ Issues: 23 untranslated strings      │
│ [Edit] [Download JSON] [Reset]       │
│                                        │
│ 🇩🇪 German (Deutsch)                  │
│ Status: ⚠ In Progress                │
│ Last updated: Sep 28, 2025            │
│ Progress: 60% ▓▓▓▓░░░░░░░            │
│ [Edit] [Download JSON] [Reset]       │
│                                        │
│ 🇫🇷 French (Français)                 │
│ Status: ⚠ In Progress                │
│ Last updated: Sep 15, 2025            │
│ Progress: 40% ▓▓░░░░░░░░░            │
│ [Edit] [Download JSON] [Reset]       │
│                                        │
│ ─────────────────────────────────────  │
│ [+ Add Language] [Select from list ▼]│
│                                        │
│ 📥 Import / Export                    │
│                                        │
│ Export All Translations               │
│ [Download JSON] [Download CSV]        │
│                                        │
│ Import Translations                   │
│ [Select file] [Upload]                │
│ Supported: JSON, CSV, XLSX            │
│ [Preview] (show what will be changed)│
│                                        │
│ ─────────────────────────────────────  │
│ Status: ✓ 6 languages ready          │
└────────────────────────────────────────┘

[LANGUAGE EDITOR MODAL]
┌────────────────────────────────────────┐
│ Edit Russian Translations              │
├────────────────────────────────────────┤
│                                        │
│ Search keys: [_______] [Clear]        │
│                                        │
│ Translation Key                       │
│ [card.title.today              ]     │
│                                        │
│ Russian Translation*                  │
│ [Сегодня отличное время        ]    │
│ Character count: 24 / 200           │
│                                        │
│ English Reference                     │
│ "Today is a great time"              │
│ (for context)                        │
│                                        │
│ Context / Notes                       │
│ [Short motivational text shown       │
│  on the daily card              ]   │
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ [< Previous (122/156)] [Next > ]     │
│                                        │
│ Status: Translated ✓                  │
│ Last updated: 2 days ago            │
│                                        │
│ ─────────────────────────────────────  │
│ [Cancel] [Save This] [Save & Close] │
│                                        │
└────────────────────────────────────────┘
```

### 4.6 Settings > Advanced

```
┌────────────────────────────────────────┐
│ ⚙️ Settings > Advanced                 │
├────────────────────────────────────────┤
│                                        │
│ ⚠️  WARNING: Advanced operations below │
│ Only use if you know what you're doing│
│                                        │
│ ─────────────────────────────────────  │
│ 💾 Backup & Restore                   │
│                                        │
│ Database Backup                       │
│ Last backup: Oct 14, 2025 @ 02:30   │
│ Size: 2.4 GB                         │
│ Status: ✓ Complete                   │
│                                        │
│ [Create Backup Now] [Download]       │
│ [Restore] [Schedule]                 │
│                                        │
│ Automatic Backups                     │
│ ◉ Enabled                            │
│ ○ Disabled                           │
│ Schedule: Daily @ 2:00 AM UTC        │
│ Retention: Keep last 7 backups       │
│                                        │
│ ─────────────────────────────────────  │
│ 📤 Data Export                        │
│                                        │
│ Export User Data                      │
│ Format: [JSON ▼]                     │
│ Include: ☑ Entries ☑ Summaries      │
│          ☑ Books    ☑ Profile       │
│ [Export to File]                     │
│                                        │
│ Bulk Export (All Users)               │
│ Format: [JSON ▼]                     │
│ [Export] (large exports take time)  │
│ You'll receive email when ready     │
│                                        │
│ ─────────────────────────────────────  │
│ 🧹 Cleanup & Maintenance              │
│                                        │
│ Remove Old Entries (> 2 years)        │
│ ☐ I understand this is irreversible  │
│ [Preview] [Delete]                   │
│                                        │
│ Clear Cache                           │
│ Cache size: 512 MB                   │
│ [Clear Now]                          │
│                                        │
│ Rebuild Search Index                  │
│ Last rebuilt: Oct 14, 2025            │
│ [Rebuild Now] (may take minutes)    │
│                                        │
│ ─────────────────────────────────────  │
│ 📊 Database Health                    │
│                                        │
│ Database Size: 5.2 GB                │
│ Connections: 45 / 100 (45%)         │
│ Query Performance: Good              │
│ Last check: 5 minutes ago            │
│ [Run Health Check Now]               │
│                                        │
│ Status: ✓ System healthy             │
└────────────────────────────────────────┘
```

### 4.7 Monitoring Dashboard

```
┌────────────────────────────────────────┐
│ 📊 Monitoring Dashboard                │
├────────────────────────────────────────┤
│                                        │
│ SYSTEM HEALTH (Real-time)            │
│ ════════════════════════════════════   │
│                                        │
│ 🟢 CPU        25% ▓▓░░░░░░░░░░░░    │
│    Cores: 4, Load avg: 1.2           │
│                                        │
│ 🟢 Memory     62% ▓▓▓▓▓▓░░░░░░░░    │
│    6.2 GB / 10 GB available          │
│                                        │
│ 🟡 Disk       78% ▓▓▓▓▓▓▓░░░░░░░    │
│    78 GB / 100 GB used               │
│    ⚠️ Running low on space           │
│                                        │
│ 🟢 Database   Connected ✓             │
│    Connections: 45/100 (45%)         │
│    Query time: 234ms avg             │
│                                        │
│ 🟢 API Server Active ✓                │
│    Response time: 145ms avg          │
│    Error rate: 0.18%                 │
│                                        │
│ Uptime: 99.8% (30 days)              │
│ Last restart: 45 days ago            │
│                                        │
│ ────────────────────────────────────   │
│ KEY METRICS (Last 24 hours)           │
│ ════════════════════════════════════   │
│                                        │
│ ┌──────────┬──────────┬──────────┐   │
│ │👥Active  │📝Entries │📚PDFs    │   │
│ │ 1,248    │  4,521   │   156    │   │
│ │ +15% ↑   │ -3% ↓    │ +12% ↑  │   │
│ └──────────┴──────────┴──────────┘   │
│                                        │
│ ────────────────────────────────────   │
│ PERFORMANCE METRICS                    │
│ ════════════════════════════════════   │
│                                        │
│ Avg Response Time                     │
│ ▁▂▃▂▁░░░░░░░ 245ms (↓ 12%)           │
│                                        │
│ Request Rate                          │
│ ▃▄▅▅▄▃░░░░░░ 850 req/min             │
│                                        │
│ Error Rate                            │
│ ░░░░░░▁▂░░░░ 0.18% (target: <0.5%) │
│                                        │
│ ────────────────────────────────────   │
│ RECENT LOGS                           │
│ ════════════════════════════════════   │
│                                        │
│ Filter: [All ▼] [Type: All ▼]        │
│         [Period: 7 days ▼]           │
│                                        │
│ [2025-10-14 14:32:11] ✓ PDF          │
│ Generated book_5f8e7d (24 pages)      │
│                                        │
│ [2025-10-14 14:28:45] ✓ Entry        │
│ Created by user_abc123               │
│                                        │
│ [2025-10-14 14:15:33] ⚠️ API timeout │
│ OpenAI request (retry 1/3)           │
│ Retrying...                          │
│                                        │
│ [2025-10-14 13:50:20] ✓ Email        │
│ Monthly summary to user_def456       │
│                                        │
│ [View All Logs] [Export]              │
│                                        │
│ Status: ✓ System operating normally   │
└────────────────────────────────────────┘

Live updates: WebSocket, 5-second refresh
Charts: 24-hour rolling window with hourly data
```

---

## 5. Form Validation & UX

### 5.1 Input Validation Rules

```typescript
// Real-time validation (on blur or change)
const validationRules = {
  applicationName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Zа-яА-Я0-9\s-]+$/
  },
  apiKey: {
    required: true,
    minLength: 40,
    pattern: /^sk-[a-zA-Z0-9]{48}$/,
    async: async (value) => {
      // Test OpenAI API
      return await testOpenAIKey(value);
    }
  },
  email: {
    required: true,
    type: "email",
    async: async (value) => {
      // Check if email already exists
      return !(await emailExists(value));
    }
  },
  monthlyBudget: {
    required: true,
    type: "number",
    min: 1000,
    max: 1000000
  }
};

// Error messages
const errorMessages = {
  required: "This field is required",
  email: "Please enter a valid email",
  minLength: `Minimum ${min} characters`,
  maxLength: `Maximum ${max} characters`,
  min: `Must be at least ${min}`,
  max: `Cannot exceed ${max}`,
  pattern: "Invalid format",
  apiKey: "Invalid or expired API key"
};
```

### 5.2 UX Feedback Patterns

```
LOADING STATE:
┌─────────────────────────┐
│ [Saving changes...]     │
│ ░░░░░░░░░░░░░░░░░░░░░  │
│ 50% complete            │
└─────────────────────────┘

SUCCESS STATE:
┌─────────────────────────┐
│ ✓ Changes saved!        │
│ All settings updated    │
└─────────────────────────┘

ERROR STATE:
┌─────────────────────────┐
│ ✗ Failed to save        │
│ Network error           │
│ [Retry]                 │
└─────────────────────────┘

FIELD ERROR:
API Key*
[●●●●●●●●●●●●●●●●●●●●●] 
✗ Invalid or expired key

REQUIRED FIELD INDICATOR:
Label*
[_______]
* = required field

HELPER TEXT:
API Key
[●●●●●●●●●●●●●●●●●●●●●]
ⓘ Keep this secret! Never share with anyone.
  Last rotated: 30 days ago
```

### 5.3 Form Submission Flow

```typescript
const handleSubmit = async (formData) => {
  // 1. Validate locally
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    return;
  }

  // 2. Set loading state
  setIsLoading(true);
  
  // 3. Submit to API
  try {
    const response = await fetch(`/api/admin/settings/${section}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Save failed');

    const data = await response.json();

    // 4. Success feedback
    toast.success('Settings saved successfully');
    
    // 5. Update local state
    setSettings(data);
    
    // 6. Log action (admin audit trail)
    logAdminAction('update_settings', section, formData);

  } catch (error) {
    // 5. Error feedback
    toast.error(error.message || 'Failed to save settings');
    console.error('Form submission error:', error);
    
  } finally {
    // 6. Clear loading state
    setIsLoading(false);
  }
};
```

---

## 6. API Integration

### 6.1 Admin Endpoints

```
GET /api/admin/dashboard
├─ Response: system stats, metrics, logs
└─ Cached: 5 minutes

GET /api/admin/settings/{section}
├─ section: "general", "api", "notifications", etc.
├─ Response: current settings values
└─ Cached: 10 minutes (invalidate on save)

POST /api/admin/settings/{section}
├─ Body: { key: value, ... }
├─ Validation: server-side
├─ Response: { success, message, data }
└─ Action: logged in AdminLogs table

GET /api/admin/users?page=1&limit=50&search=email
├─ Query: pagination, search, filter
├─ Response: users array + total count
└─ Time: < 500ms

GET /api/admin/logs?type=error&period=7d
├─ Query: type (all/error/warning/info), period
├─ Response: logs array + total count
└─ Time: < 500ms

POST /api/admin/test-connection
├─ Body: { service: "openai" }
├─ Response: { connected: boolean, message }
└─ Time: depends on service (2-5 sec)
```

### 6.2 Error Handling

```typescript
// API Error Response
{
  success: false,
  error: "Validation failed",
  details: {
    apiKey: "Invalid format",
    monthlyBudget: "Must be > 1000"
  },
  code: "VALIDATION_ERROR"
}

// Network Error Handling
try {
  await submitForm();
} catch (error) {
  if (error instanceof NetworkError) {
    toast.error('Network error. Check your connection.');
  } else if (error instanceof ValidationError) {
    setFieldErrors(error.details);
  } else if (error instanceof ServerError) {
    toast.error('Server error. Please try again later.');
  }
}

// Retry Logic
const submitWithRetry = async (formData, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await submitForm(formData);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      toast.info(`Retrying... (attempt ${i + 2}/${maxRetries})`);
    }
  }
};
```

---

## 7. Acceptance Criteria

### Settings Module

```
SCENARIO 1: Load Settings
GIVEN: Admin opens Settings > General
WHEN: Page loads
THEN:
  ✓ Current settings values displayed
  ✓ Form fields pre-populated
  ✓ Load time < 500ms
  ✓ No console errors

SCENARIO 2: Form Validation
GIVEN: Admin changes API Key
WHEN: User leaves field (blur)
THEN:
  ✓ Real-time validation triggered
  ✓ Error message shown if invalid
  ✓ Submit button disabled if errors
  ✓ Success message shown if valid

SCENARIO 3: Save Settings
GIVEN: Admin fills valid form
WHEN: Clicks "Save Changes"
THEN:
  ✓ Loading spinner shown
  ✓ Form disabled (prevent double-submit)
  ✓ API POST sent with correct data
  ✓ Success toast shown
  ✓ Settings persisted in DB
  ✓ Admin action logged in AdminLogs

SCENARIO 4: Save Error
GIVEN: Network or server error
WHEN: Admin clicks "Save Changes"
THEN:
  ✓ Error toast shown
  ✓ Error message descriptive
  ✓ Form remains populated
  ✓ Retry button available
  ✓ No data lost

SCENARIO 5: Responsive Design
GIVEN: Admin uses mobile device
WHEN: Opens Settings page
THEN:
  ✓ Mobile layout applied (1 column)
  ✓ Touch targets >= 48px
  ✓ Form readable without zoom
  ✓ Buttons accessible
  ✓ No horizontal scroll
```

### Monitoring Module

```
SCENARIO 1: Load Monitoring
GIVEN: Admin opens Monitoring
WHEN: Page loads
THEN:
  ✓ Real-time metrics displayed
  ✓ Charts load with data
  ✓ Status indicators updated
  ✓ Load time < 2 seconds

SCENARIO 2: Real-time Updates
GIVEN: Monitoring page open
WHEN: 5 seconds pass
THEN:
  ✓ WebSocket connection active
  ✓ Metrics updated without page refresh
  ✓ Charts animated smoothly
  ✓ No stale data shown

SCENARIO 3: Log Filtering
GIVEN: Admin opens Logs section
WHEN: Filters by "Error" type and "7 days"
THEN:
  ✓ Logs filtered correctly
  ✓ Only errors shown
  ✓ Only recent logs shown
  ✓ Load time < 500ms
  ✓ Export button functional
```

---

## 8. Metrics

### Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Settings Load | < 500ms | 2 sec |
| Form Submit | < 2 sec | 10 sec |
| Dashboard Load | < 1 sec | 3 sec |
| API Response | < 300ms | 1 sec |
| Real-time Updates | < 5 sec | 10 sec |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Error Rate | < 0.1% |
| User Adoption | > 80% of admins |
| Settings Save Success | > 99% |
| Form Validation Coverage | 100% |

### Accessibility (WCAG 2.1 AA)

```
✓ Color contrast: >= 4.5:1 for normal text
✓ Touch targets: >= 48px minimum
✓ Keyboard navigation: Tab/Shift+Tab functional
✓ Screen readers: All labels properly associated
✓ Focus indicators: Visible at all times
✓ Error messages: Linked to form fields
✓ Loading states: Announced to screen readers
```