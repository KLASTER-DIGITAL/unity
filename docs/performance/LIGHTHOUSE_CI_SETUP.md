# Lighthouse CI Setup

**Date:** 2025-10-24  
**Status:** ✅ ACTIVE  
**Version:** 1.0.0

---

## 📊 Overview

Автоматическое тестирование производительности с помощью Lighthouse CI при каждом Pull Request и push в main.

**Ключевые возможности:**
- ✅ Автоматический запуск Lighthouse при каждом PR
- ✅ Performance budgets для предотвращения деградации
- ✅ Автоматические комментарии в PR с результатами
- ✅ Core Web Vitals tracking
- ✅ Resource size monitoring
- ✅ Artifacts для детального анализа

---

## 🏗️ Architecture

### Components

1. **lighthouserc.json** - Конфигурация Lighthouse CI
   - Performance budgets
   - Assertions для метрик
   - URL для тестирования
   - Desktop preset

2. **.github/workflows/lighthouse-ci.yml** - GitHub Action
   - Запуск на PR и push в main
   - Build приложения
   - Запуск Lighthouse (3 runs)
   - Комментарии в PR
   - Upload artifacts

3. **Performance Budgets** - Лимиты производительности
   - Performance score: ≥ 90
   - Accessibility score: ≥ 95
   - Best Practices score: ≥ 95
   - SEO score: ≥ 90
   - PWA score: ≥ 80

---

## 🎯 Performance Budgets

### Category Scores

| Category | Minimum Score | Level |
|----------|---------------|-------|
| **Performance** | 90 | Error |
| **Accessibility** | 95 | Error |
| **Best Practices** | 95 | Error |
| **SEO** | 90 | Error |
| **PWA** | 80 | Warning |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor | Budget |
|--------|------|-------------------|------|--------|
| **FCP** | ≤ 1.8s | 1.8s - 3.0s | > 3.0s | 1.8s |
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | 2.5s |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | 0.1 |
| **TBT** | ≤ 200ms | 200ms - 600ms | > 600ms | 300ms |
| **SI** | ≤ 3.4s | 3.4s - 5.8s | > 5.8s | 3.0s |
| **TTI** | ≤ 3.8s | 3.8s - 7.3s | > 7.3s | 3.8s |

### Resource Budgets

| Resource Type | Maximum Size | Level |
|---------------|--------------|-------|
| **JavaScript** | 500 KB | Warning |
| **CSS** | 100 KB | Warning |
| **Images** | 500 KB | Warning |
| **Fonts** | 100 KB | Warning |
| **Total** | 2 MB | Warning |

### Other Metrics

| Metric | Budget | Level |
|--------|--------|-------|
| **DOM Size** | ≤ 1500 nodes | Warning |
| **Bootup Time** | ≤ 3.5s | Warning |
| **Main Thread Work** | ≤ 4.0s | Warning |
| **Max Potential FID** | ≤ 130ms | Warning |

---

## 🚀 Usage

### Automatic Runs

Lighthouse CI запускается автоматически:

1. **На каждом Pull Request:**
   - Запускается при создании PR
   - Запускается при каждом новом commit в PR
   - Добавляет комментарий с результатами
   - Fails PR если budgets превышены

2. **На каждом push в main:**
   - Запускается после merge
   - Сохраняет artifacts для истории
   - Отслеживает тренды производительности

### Manual Run

Запустить Lighthouse CI локально:

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Build application
npm run build

# Run Lighthouse CI
lhci autorun
```

### View Results

**В Pull Request:**
- Автоматический комментарий с результатами
- Таблица с scores
- Core Web Vitals
- Resource summary
- Ссылка на полный отчет

**В GitHub Actions:**
- Actions → Lighthouse CI → View logs
- Download artifacts для детального анализа

**Локально:**
- `.lighthouseci/` директория с результатами
- HTML отчеты для каждого run

---

## 📊 Example PR Comment

```markdown
## 🔦 Lighthouse CI Results

### Performance Scores

| URL | Performance | Accessibility | Best Practices | SEO | PWA |
|-----|-------------|---------------|----------------|-----|-----|
| http://localhost:4173/ | 🟢 92 | 🟢 98 | 🟢 96 | 🟢 91 | 🟡 85 |
| http://localhost:4173/?view=admin | 🟢 90 | 🟢 97 | 🟢 95 | 🟢 90 | 🟡 82 |

### Core Web Vitals

| Metric | Value | Status |
|--------|-------|--------|
| FCP | ✅ 1567ms |
| LCP | ✅ 2234ms |
| TBT | ✅ 189ms |
| CLS | 0.045 | ✅ |
| SI | ✅ 2890ms |

### Resource Summary

| Resource Type | Size | Count |
|---------------|------|-------|
| script | 1.23 MB | 15 |
| stylesheet | 0.12 MB | 3 |
| image | 0.45 MB | 8 |
| font | 0.08 MB | 2 |
| total | 1.88 MB | 28 |

---

📊 [View full Lighthouse report](https://storage.googleapis.com/...)
```

---

## 🔧 Configuration

### lighthouserc.json

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/?view=admin"
      ],
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}]
      }
    }
  }
}
```

### GitHub Action

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.json'
```

---

## 📈 Monitoring Trends

### Historical Data

Lighthouse CI сохраняет artifacts для каждого run:

1. **GitHub Actions Artifacts:**
   - Retention: 30 days
   - Download: Actions → Lighthouse CI → Artifacts

2. **Temporary Public Storage:**
   - Автоматические ссылки в PR комментариях
   - Retention: 7 days

### Trend Analysis

Для долгосрочного мониторинга:

1. **Sentry Performance:**
   - Real User Monitoring (RUM)
   - Web Vitals tracking
   - Trend graphs

2. **Custom Dashboard:**
   - Parse Lighthouse artifacts
   - Store in database
   - Visualize trends

---

## 🎯 Best Practices

### 1. Fix Issues Immediately

При получении warning/error в Lighthouse CI:
1. Проверьте детальный отчет
2. Исправьте проблему в том же PR
3. Не merge пока все checks не пройдут

### 2. Monitor Trends

- Отслеживайте изменения scores после каждого PR
- Используйте Sentry для real-time monitoring
- Настройте алерты на деградацию

### 3. Optimize Based on Data

- LCP > 2.5s → оптимизируйте загрузку изображений
- TBT > 300ms → уменьшите JavaScript execution time
- CLS > 0.1 → фиксируйте размеры элементов
- Resource size > budget → code splitting, lazy loading

### 4. Test Both Views

Lighthouse CI тестирует:
- PWA view (http://localhost:4173/)
- Admin view (http://localhost:4173/?view=admin)

Убедитесь что оба view проходят budgets.

---

## 🔍 Troubleshooting

### Lighthouse CI Fails

**Problem:** Lighthouse CI fails в GitHub Actions

**Solutions:**
1. Check build logs для ошибок
2. Verify environment variables
3. Check lighthouserc.json syntax
4. Run locally: `lhci autorun`

### Performance Score Drops

**Problem:** Performance score упал после PR

**Solutions:**
1. Check PR diff для новых dependencies
2. Analyze bundle size changes
3. Check for new images/assets
4. Review lazy loading implementation

### Budget Exceeded

**Problem:** Resource budget exceeded

**Solutions:**
1. Enable code splitting
2. Optimize images (WebP, compression)
3. Remove unused dependencies
4. Implement lazy loading
5. Use dynamic imports

---

## 📚 Related Documentation

- [Performance Monitoring](./MONITORING_AND_SCALING_STRATEGY.md)
- [Sentry Performance Integration](./SENTRY_PERFORMANCE_INTEGRATION.md)
- [Database Optimization](./DATABASE_OPTIMIZATION_100K.md)
- [Phase P2 Completion Report](./PHASE_P2_COMPLETION_REPORT.md)

---

## 🎉 Benefits

1. **Prevent Performance Regression:** Автоматическое обнаружение деградации
2. **Data-Driven Optimization:** Оптимизация на основе реальных метрик
3. **Team Awareness:** Все видят impact своих изменений
4. **Quality Gate:** Не позволяет merge плохого кода
5. **Historical Tracking:** Отслеживание трендов производительности

---

**Status:** ✅ Active in CI/CD  
**Last Updated:** 2025-10-24

