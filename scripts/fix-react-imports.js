#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправляем неправильные React импорты...');

// Функция для поиска всех файлов
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Пропускаем node_modules и другие служебные папки
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      results.push(filePath);
    }
  });

  return results;
}

// Функция для исправления импортов в файле
function fixReactImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Паттерны для поиска неправильных импортов
  const patterns = [
    // import { React, ... } from "react";
    {
      regex: /import\s*{\s*React\s*,\s*([^}]+)\s*}\s*from\s*["']react["'];?/g,
      replacement: (match, namedImports) =>
        `import React, { ${namedImports.trim()} } from "react";`,
    },
    // import { React } from "react";
    {
      regex: /import\s*{\s*React\s*}\s*from\s*["']react["'];?/g,
      replacement: () => `import React from "react";`,
    },
    // import { React, Component } from "react"; (специальный случай)
    {
      regex: /import\s*{\s*React\s*,\s*Component\s*}\s*from\s*["']react["'];?/g,
      replacement: () => `import React, { Component } from "react";`,
    },
  ];

  let newContent = content;
  let hasChanges = false;

  patterns.forEach((pattern) => {
    if (pattern.regex.test(newContent)) {
      newContent = newContent.replace(pattern.regex, pattern.replacement);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }

  return false;
}

// Основная функция
function main() {
  const startTime = Date.now();
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ Папка src/ не найдена');
    process.exit(1);
  }

  const files = findFiles(srcDir);
  let processedCount = 0;

  files.forEach((filePath) => {
    if (fixReactImports(filePath)) {
      processedCount++;
      console.log(`✅ Исправлен: ${path.relative(process.cwd(), filePath)}`);
    }
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n✅ Исправление завершено!');
  console.log(`📊 Исправлено файлов: ${processedCount}`);
  console.log(`⏱️ Время выполнения: ${duration}s`);
}

main();
