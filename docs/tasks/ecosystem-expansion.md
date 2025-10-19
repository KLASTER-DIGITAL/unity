# 🌐 Расширение экосистемы - Детальный план задачи

**Дата обновления**: 2025-01-18  
**Версия**: 1.0  
**Статус**: Фаза 4 - Q4 2025  
**Автор**: Команда UNITY

> **Связь с мастер-планом**: Эта задача детализирует **Задачу 8** из [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md)

---

## 🎯 Цель задачи

Превратить UNITY в полную экосистему для личностного роста с командными функциями, интеграциями, API для разработчиков и белыми метками для корпораций.

### Ключевые метрики
- **B2B Revenue**: 30% от общего дохода
- **API Usage**: 1M+ запросов/месяц
- **Enterprise Clients**: 50+ компаний
- **Integration Partners**: 10+ сервисов

---

## 📋 Детальные задачи

### Неделя 1-2: Командные достижения

#### 1.1 Team Management System
**Файлы для создания**:
- `src/features/teams/components/TeamDashboard.tsx`
- `src/features/teams/components/TeamMembersList.tsx`
- `src/shared/lib/teams/team-manager.ts`

**База данных**:
```sql
-- Команды
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  plan_type TEXT DEFAULT 'team', -- team, enterprise
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Участники команд
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Командные цели
CREATE TABLE team_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active' -- active, completed, paused
);
```

#### 1.2 Team Analytics
**Командная аналитика**:
```typescript
// team-analytics.ts
export class TeamAnalytics {
  async getTeamProgress(teamId: string): Promise<TeamProgress> {
    const members = await this.getTeamMembers(teamId);
    const goals = await this.getTeamGoals(teamId);
    
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.lastActive > sevenDaysAgo).length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      teamMorale: await this.calculateTeamMorale(teamId),
      topPerformers: await this.getTopPerformers(teamId, 5)
    };
  }
}
```

### Неделя 3-4: Интеграции с внешними сервисами

#### 2.1 Health & Fitness интеграции
**Google Fit интеграция**:
```typescript
// integrations/google-fit.ts
export class GoogleFitIntegration {
  async syncStepsData(userId: string): Promise<void> {
    const auth = await this.getGoogleAuth(userId);
    const fitness = google.fitness({ version: 'v1', auth });
    
    const response = await fitness.users.dataSources.datasets.get({
      userId: 'me',
      dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      datasetId: `${startTime}-${endTime}`
    });
    
    const steps = this.parseStepsData(response.data);
    await this.createAutomaticEntry(userId, 'fitness', steps);
  }
}
```

**Apple Health интеграция** (React Native):
```typescript
// integrations/apple-health.ts
import { AppleHealthKit } from 'react-native-health';

export class AppleHealthIntegration {
  async syncHealthData(userId: string): Promise<void> {
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.SleepAnalysis
        ]
      }
    };
    
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (!error) {
        this.fetchStepsData(userId);
        this.fetchSleepData(userId);
      }
    });
  }
}
```

#### 2.2 Productivity интеграции
**Календарные интеграции**:
```typescript
// integrations/calendar-sync.ts
export class CalendarIntegration {
  async syncCalendarEvents(userId: string): Promise<void> {
    const events = await this.getCalendarEvents(userId);
    
    // Автоматическое создание записей для важных событий
    for (const event of events) {
      if (this.isAchievementWorthy(event)) {
        await this.createAutomaticEntry(userId, 'productivity', {
          title: `Завершил: ${event.summary}`,
          description: `Участвовал в ${event.summary}`,
          category: 'work',
          mood: 'productive'
        });
      }
    }
  }
}
```

### Неделя 5-6: API для разработчиков

#### 3.1 Public API
**API Endpoints**:
```typescript
// api/v1/entries.ts
export const entriesAPI = {
  // GET /api/v1/entries
  async getEntries(req: Request): Promise<Response> {
    const { userId, limit, offset } = await this.validateRequest(req);
    const entries = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .limit(limit)
      .offset(offset);
    
    return new Response(JSON.stringify(entries.data));
  },
  
  // POST /api/v1/entries
  async createEntry(req: Request): Promise<Response> {
    const { userId, entry } = await this.validateRequest(req);
    const result = await supabase
      .from('entries')
      .insert({ ...entry, user_id: userId });
    
    return new Response(JSON.stringify(result.data));
  }
};
```

#### 3.2 API Documentation
**OpenAPI спецификация**:
```yaml
# api-docs.yaml
openapi: 3.0.0
info:
  title: UNITY API
  version: 1.0.0
  description: API для интеграции с UNITY дневником достижений

paths:
  /api/v1/entries:
    get:
      summary: Получить записи пользователя
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Список записей
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Entry'
```

#### 3.3 SDK для разработчиков
**JavaScript SDK**:
```typescript
// unity-sdk.ts
export class UnitySDK {
  constructor(private apiKey: string, private baseUrl: string) {}
  
  async createEntry(entry: CreateEntryRequest): Promise<Entry> {
    const response = await fetch(`${this.baseUrl}/api/v1/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    });
    
    return response.json();
  }
  
  async getAnalytics(period: 'week' | 'month' | 'year'): Promise<Analytics> {
    // Реализация получения аналитики
  }
}
```

### Неделя 7-8: Белые метки для корпораций

#### 4.1 White Label Platform
**Мультитенантная архитектура**:
```sql
-- Организации (белые метки)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE, -- custom.unity-app.com
  logo_url TEXT,
  primary_color TEXT DEFAULT '#007AFF',
  secondary_color TEXT DEFAULT '#34C759',
  custom_css TEXT,
  plan_type TEXT DEFAULT 'enterprise',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Пользователи организаций
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

#### 4.2 Custom Branding
**Брендинг система**:
```typescript
// branding/theme-manager.ts
export class ThemeManager {
  async getOrganizationTheme(orgId: string): Promise<Theme> {
    const org = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    
    return {
      colors: {
        primary: org.primary_color,
        secondary: org.secondary_color
      },
      logo: org.logo_url,
      customCSS: org.custom_css
    };
  }
  
  applyTheme(theme: Theme): void {
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
    
    if (theme.customCSS) {
      this.injectCustomCSS(theme.customCSS);
    }
  }
}
```

---

## 🏢 Enterprise Features

### Advanced Admin Panel
**Файлы для создания**:
- `src/features/enterprise/components/OrganizationDashboard.tsx`
- `src/features/enterprise/components/UserManagement.tsx`
- `src/features/enterprise/components/AnalyticsDashboard.tsx`

### Enterprise Analytics
```typescript
// enterprise-analytics.ts
export class EnterpriseAnalytics {
  async getOrganizationInsights(orgId: string): Promise<OrgInsights> {
    return {
      userEngagement: await this.calculateEngagement(orgId),
      productivityMetrics: await this.getProductivityMetrics(orgId),
      wellbeingScore: await this.calculateWellbeingScore(orgId),
      departmentComparison: await this.getDepartmentStats(orgId),
      retentionAnalysis: await this.getRetentionAnalysis(orgId)
    };
  }
}
```

### SSO Integration
```typescript
// sso/saml-provider.ts
export class SAMLProvider {
  async authenticateUser(samlResponse: string, orgId: string): Promise<User> {
    const assertion = await this.validateSAMLResponse(samlResponse);
    const userInfo = this.extractUserInfo(assertion);
    
    // Создать или обновить пользователя
    const user = await this.findOrCreateUser(userInfo, orgId);
    return user;
  }
}
```

---

## 📊 Мониторинг и аналитика

### Business Metrics
```typescript
export interface EcosystemMetrics {
  // B2B метрики
  enterpriseRevenue: number;
  averageContractValue: number;
  customerLifetimeValue: number;
  
  // API метрики
  apiRequestsPerMonth: number;
  apiErrorRate: number;
  developerSignups: number;
  
  // Интеграции
  activeIntegrations: number;
  integrationUsage: Record<string, number>;
  
  // Команды
  activeTeams: number;
  averageTeamSize: number;
  teamRetention: number;
}
```

### Success Metrics
- **Enterprise Adoption**: 50+ компаний к концу 2025
- **API Usage Growth**: 100% рост каждый квартал
- **Integration Partners**: 10+ официальных партнеров
- **White Label Revenue**: $50K+ MRR

---

## 🧪 Тестирование

### Integration Testing
1. **API Endpoints** - все endpoints работают корректно
2. **External Integrations** - синхронизация с внешними сервисами
3. **White Label** - кастомизация работает
4. **Team Features** - командная функциональность

### Load Testing
- **API Performance** - 1000+ RPS
- **Database Scaling** - миллионы записей
- **Multi-tenant Isolation** - изоляция данных организаций

---

## ✅ Критерии готовности

### Definition of Done
- [ ] Командные функции полностью работают
- [ ] Все интеграции протестированы
- [ ] API документация опубликована
- [ ] SDK для разработчиков готов
- [ ] White label платформа функционирует
- [ ] Enterprise admin panel готов
- [ ] SSO интеграция работает

### Enterprise Requirements
- **Security**: SOC 2 Type II сертификация
- **Compliance**: GDPR, HIPAA готовность
- **SLA**: 99.9% uptime гарантия
- **Support**: 24/7 enterprise поддержка

---

## 🔗 Связанные документы

- [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md) - общая стратегия
- [monetization-system.md](./monetization-system.md) - монетизация
- [advanced-analytics.md](./advanced-analytics.md) - аналитика

---

**🎯 Результат**: Полная экосистема UNITY с B2B возможностями, готовая к масштабированию на корпоративный рынок.
