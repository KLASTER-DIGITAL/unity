# Lint Cleanup Plan - UNITY-v2

**Статус**: 🔄 In Progress  
**Приоритет**: P1 (High)  
**Срок**: 2 недели (2025-11-01 - 2025-11-15)  
**Последнее обновление**: 2025-11-01  

---

## 📊 Current State

### Lint Statistics (2025-11-01):
- **Errors**: 3,901
- **Warnings**: 3,240
- **Infos**: 47
- **Total**: 7,188 issues

### Progress:
- **Initial**: 17,334 errors (2025-10-30)
- **Current**: 7,188 issues (2025-11-01)
- **Improvement**: -10,146 issues (-58%)

### Target:
- **Goal**: <1,000 total issues
- **Remaining**: 6,188 issues to fix
- **Weekly target**: -3,094 issues/week

---

## 🎯 Strategy

### Phase 1: Configuration (COMPLETED ✅)
**Duration**: 1 day  
**Status**: ✅ DONE  

#### Tasks:
- [x] Update biome.jsonc schema (1.9.4 → 2.3.2)
- [x] Add overrides for React Native files
- [x] Add overrides for test files
- [x] Add overrides for config files

#### Results:
- Warnings reduced: 3,281 → 3,240 (-41)
- React Native files now exempt from `noExplicitAny`
- Test files exempt from `noExcessiveCognitiveComplexity`

---

### Phase 2: Auto-fix (IN PROGRESS 🔄)
**Duration**: 2 days  
**Status**: 🔄 IN PROGRESS  

#### Tasks:
- [ ] Run `npm run lint:fix` (auto-fix FIXABLE errors)
- [ ] Run `npm run lint:unsafe` (auto-fix including unsafe fixes)
- [ ] Verify no regressions (run tests, check console)
- [ ] Commit auto-fixed changes

#### Expected Results:
- Estimated reduction: -2,000 to -3,000 issues
- Target: <5,000 total issues

---

### Phase 3: Manual Fixes (PLANNED 📅)
**Duration**: 1 week  
**Status**: 📅 PLANNED  

#### Priority 1: noExplicitAny (Web files)
**Count**: ~500 errors  
**Strategy**: Replace `any` with proper TypeScript types

**Common patterns**:
```typescript
// ❌ BEFORE
function handleData(data: any) {
  return data.value;
}

// ✅ AFTER
interface DataType {
  value: string;
}
function handleData(data: DataType) {
  return data.value;
}
```

**Files to fix**:
- `src/features/**/*.ts`
- `src/shared/**/*.ts`
- `src/utils/**/*.ts`

---

#### Priority 2: noExcessiveCognitiveComplexity
**Count**: ~50 errors  
**Strategy**: Refactor complex functions into smaller ones

**Common patterns**:
```typescript
// ❌ BEFORE (complexity > 15)
function processData(data) {
  if (data) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].active) {
          if (data[i].type === 'user') {
            // ... 10 more levels of nesting
          }
        }
      }
    }
  }
}

// ✅ AFTER (complexity < 15)
function isActiveUser(item) {
  return item.active && item.type === 'user';
}

function processData(data) {
  if (!data?.length) return;
  
  const activeUsers = data.filter(isActiveUser);
  activeUsers.forEach(processUser);
}
```

**Files to fix**:
- `app-shared/hooks/useEntries.ts`
- `app-shared/hooks/useUserData.ts`
- Complex components in `src/features/`

---

#### Priority 3: noUnusedVariables
**Count**: ~1,000 errors  
**Strategy**: Remove or prefix with underscore

**Common patterns**:
```typescript
// ❌ BEFORE
function MyComponent({ data, language, theme }) {
  return <div>{data.title}</div>;
  // language and theme are unused
}

// ✅ AFTER (Option 1: Remove)
function MyComponent({ data }) {
  return <div>{data.title}</div>;
}

// ✅ AFTER (Option 2: Prefix with _)
function MyComponent({ data, language: _language, theme: _theme }) {
  return <div>{data.title}</div>;
}
```

**Files to fix**:
- All components with unused props
- All hooks with unused parameters

---

#### Priority 4: useTemplate
**Count**: ~500 warnings  
**Strategy**: Replace string concatenation with template literals

**Common patterns**:
```typescript
// ❌ BEFORE
const message = 'Hello, ' + name + '!';
const url = baseUrl + '/api/' + endpoint;

// ✅ AFTER
const message = `Hello, ${name}!`;
const url = `${baseUrl}/api/${endpoint}`;
```

**Auto-fixable**: YES (use `npm run lint:fix`)

---

#### Priority 5: Other warnings
**Count**: ~2,000 warnings  
**Strategy**: Fix case-by-case

**Categories**:
- `useExhaustiveDependencies` - add missing dependencies to useEffect
- `noEmptyBlockStatements` - remove or add TODO comments
- `useAwait` - add await to async functions
- `useNodejsImportProtocol` - use `node:` prefix for Node.js imports

---

### Phase 4: Verification (PLANNED 📅)
**Duration**: 1 day  
**Status**: 📅 PLANNED  

#### Tasks:
- [ ] Run full lint check
- [ ] Verify <1,000 total issues
- [ ] Run all tests (unit + E2E)
- [ ] Check console for errors
- [ ] Verify production build works
- [ ] Update documentation

---

## 📈 Weekly Milestones

### Week 1 (2025-11-01 - 2025-11-08):
- [x] Phase 1: Configuration (DONE)
- [ ] Phase 2: Auto-fix
- [ ] Phase 3: Manual fixes (Priority 1-2)
- **Target**: <4,000 total issues

### Week 2 (2025-11-08 - 2025-11-15):
- [ ] Phase 3: Manual fixes (Priority 3-5)
- [ ] Phase 4: Verification
- **Target**: <1,000 total issues

---

## 🛠️ Tools & Commands

### Lint Commands:
```bash
# Check all files
npm run lint

# Auto-fix FIXABLE errors
npm run lint:fix

# Auto-fix including unsafe fixes
npm run lint:unsafe

# Check specific file
npx biome check src/path/to/file.tsx

# Fix specific file
npx biome check --write src/path/to/file.tsx
```

### Analysis Commands:
```bash
# Count errors by type
npm run lint 2>&1 | grep "lint/" | sed 's/.*\(lint\/[^:]*\).*/\1/' | sort | uniq -c | sort -rn

# List files with most errors
npm run lint 2>&1 | grep -E "^.*\.tsx?:" | cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# Check specific rule
npm run lint 2>&1 | grep "noExplicitAny"
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Breaking Changes
**Problem**: Auto-fix может сломать код  
**Mitigation**: 
- Запускать тесты после каждого batch fix
- Проверять консоль браузера
- Делать коммиты небольшими порциями

### Risk 2: Time Overrun
**Problem**: Ручные исправления занимают больше времени  
**Mitigation**:
- Фокус на auto-fixable errors
- Приоритизация критичных ошибок
- Использование batch replacements

### Risk 3: Regression
**Problem**: Исправления вводят новые баги  
**Mitigation**:
- E2E тесты после каждого batch
- Code review перед коммитом
- Rollback plan (git revert)

---

## 📊 Success Metrics

### Quantitative:
- **Total issues**: <1,000 (from 7,188)
- **Errors**: <500 (from 3,901)
- **Warnings**: <500 (from 3,240)
- **Improvement**: >85% reduction

### Qualitative:
- **Code quality**: Improved TypeScript types
- **Maintainability**: Reduced complexity
- **Performance**: Faster lint checks
- **Developer experience**: Fewer warnings in IDE

---

## 🎯 Definition of Done

- [ ] Total lint issues <1,000
- [ ] All auto-fixable errors fixed
- [ ] All `noExplicitAny` in web files fixed
- [ ] All `noExcessiveCognitiveComplexity` fixed
- [ ] All tests passing
- [ ] Console: 0 errors, 0 warnings
- [ ] Production build successful
- [ ] Documentation updated
- [ ] Changes committed and pushed

---

**Автор**: Development Team UNITY  
**Дата создания**: 2025-11-01  
**Следующий review**: 2025-11-08  

