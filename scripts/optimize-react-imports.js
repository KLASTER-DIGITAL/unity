const fs = require('fs');
const path = require('path');

// Функция для анализа использования React в файле
function analyzeReactUsage(content) {
  const reactUsages = new Set();

  // Паттерны использования React
  const patterns = [
    /React\.useState/g,
    /React\.useEffect/g,
    /React\.useCallback/g,
    /React\.useMemo/g,
    /React\.useRef/g,
    /React\.useContext/g,
    /React\.useReducer/g,
    /React\.useImperativeHandle/g,
    /React\.useLayoutEffect/g,
    /React\.forwardRef/g,
    /React\.memo/g,
    /React\.lazy/g,
    /React\.Suspense/g,
    /React\.Fragment/g,
    /React\.createElement/g,
    /React\.cloneElement/g,
    /React\.isValidElement/g,
    /React\.Component/g,
    /React\.PureComponent/g,
    /React\.FC/g,
    /React\.ReactNode/g,
    /React\.ReactElement/g,
    /React\.ComponentProps/g,
    /React\.HTMLAttributes/g,
    /React\.CSSProperties/g,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const hook = match.replace('React.', '');
        reactUsages.add(hook);
      });
    }
  });

  // Проверяем JSX (если есть JSX, нужен React)
  const hasJSX = /<[A-Z]/.test(content) || /<[a-z]/.test(content);

  return { reactUsages: Array.from(reactUsages), hasJSX };
}

// Функция для создания оптимизированного импорта
function createOptimizedImport(reactUsages, hasJSX) {
  const hooks = reactUsages.filter((usage) =>
    [
      'useState',
      'useEffect',
      'useCallback',
      'useMemo',
      'useRef',
      'useContext',
      'useReducer',
      'useImperativeHandle',
      'useLayoutEffect',
    ].includes(usage)
  );

  const components = reactUsages.filter((usage) =>
    [
      'forwardRef',
      'memo',
      'lazy',
      'Suspense',
      'Fragment',
      'createElement',
      'cloneElement',
      'isValidElement',
      'Component',
      'PureComponent',
    ].includes(usage)
  );

  const types = reactUsages.filter((usage) =>
    [
      'FC',
      'ReactNode',
      'ReactElement',
      'ComponentProps',
      'HTMLAttributes',
      'CSSProperties',
    ].includes(usage)
  );

  const namedImports = [...hooks, ...components];

  // Если нет JSX и нет именованных импортов, React не нужен
  if (!hasJSX && namedImports.length === 0) {
    // Если есть только типы, импортируем только типы
    if (types.length > 0) {
      return `import type { ${types.join(', ')} } from "react";`;
    }
    return null;
  }

  let importStatement = '';

  // Если есть JSX или именованные импорты, добавляем React
  if (hasJSX && namedImports.length > 0) {
    importStatement = `import React, { ${namedImports.join(', ')} } from "react";`;
  } else if (hasJSX) {
    importStatement = `import React from "react";`;
  } else if (namedImports.length > 0) {
    importStatement = `import { ${namedImports.join(', ')} } from "react";`;
  }

  // Если есть типы, добавляем их отдельно
  if (types.length > 0) {
    if (importStatement) {
      importStatement += `\nimport type { ${types.join(', ')} } from "react";`;
    } else {
      importStatement = `import type { ${types.join(', ')} } from "react";`;
    }
  }

  return importStatement;
}

// Функция для обновления файла
function optimizeReactImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Проверяем, есть ли import * as React
    if (!content.includes('import * as React')) {
      return false;
    }

    console.log(`Оптимизируем: ${filePath}`);

    // Анализируем использование React
    const { reactUsages, hasJSX } = analyzeReactUsage(content);

    // Создаем оптимизированный импорт
    const optimizedImport = createOptimizedImport(reactUsages, hasJSX);

    if (!optimizedImport) {
      // Удаляем импорт React, если он не нужен
      const updatedContent = content.replace(/import \* as React from ["']react["'];?\n?/g, '');
      fs.writeFileSync(filePath, updatedContent);
      console.log('  ✅ Удален неиспользуемый импорт React');
      return true;
    }

    // Заменяем импорт
    const updatedContent = content.replace(
      /import \* as React from ["']react["'];?/g,
      optimizedImport
    );

    fs.writeFileSync(filePath, updatedContent);
    console.log(`  ✅ Оптимизирован импорт: ${reactUsages.join(', ')}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
    return false;
  }
}

// Функция для обхода директории
function processDirectory(dirPath) {
  let optimizedCount = 0;
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Пропускаем node_modules, build, dist, old
      if (['node_modules', 'build', 'dist', '.git', 'old'].includes(entry)) {
        continue;
      }
      optimizedCount += processDirectory(fullPath);
    } else if (
      stat.isFile() &&
      (entry.endsWith('.ts') || entry.endsWith('.tsx')) &&
      optimizeReactImports(fullPath)
    ) {
      optimizedCount++;
    }
  }

  return optimizedCount;
}

// Запуск оптимизации
console.log('🚀 Начинаем оптимизацию React импортов...');
const startTime = Date.now();

const optimizedFiles = processDirectory('./src');

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log('\n✅ Оптимизация завершена!');
console.log(`📊 Обработано файлов: ${optimizedFiles}`);
console.log(`⏱️ Время выполнения: ${duration}s`);

if (optimizedFiles > 0) {
  console.log('\n🔍 Рекомендуется проверить:');
  console.log('   npx tsc --noEmit  # Проверить TypeScript ошибки');
  console.log('   npm run build     # Проверить сборку');
  console.log('   npm run dev       # Проверить работу приложения');
}
