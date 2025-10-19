#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Анализирует размер бандла и создает отчет о производительности
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuildDirectory() {
  const buildDir = path.join(process.cwd(), 'build');
  
  if (!fs.existsSync(buildDir)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}📊 Bundle Analysis Report${colors.reset}\n`);

  // Анализ JS файлов
  const jsFiles = [];
  const cssFiles = [];
  const assetFiles = [];
  
  function scanDirectory(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath, prefix + file + '/');
      } else {
        const ext = path.extname(file);
        const size = stat.size;
        const relativePath = prefix + file;
        
        if (ext === '.js') {
          jsFiles.push({ name: relativePath, size });
        } else if (ext === '.css') {
          cssFiles.push({ name: relativePath, size });
        } else if (['.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
          assetFiles.push({ name: relativePath, size });
        }
      }
    }
  }
  
  scanDirectory(buildDir);

  // Сортировка по размеру
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  assetFiles.sort((a, b) => b.size - a.size);

  // Отчет по JS файлам
  console.log(`${colors.yellow}📦 JavaScript Files:${colors.reset}`);
  let totalJSSize = 0;
  jsFiles.forEach(file => {
    totalJSSize += file.size;
    const sizeStr = formatBytes(file.size);
    const color = file.size > 500000 ? colors.red : file.size > 100000 ? colors.yellow : colors.green;
    console.log(`  ${color}${sizeStr.padStart(10)}${colors.reset} ${file.name}`);
  });
  console.log(`  ${colors.bright}${formatBytes(totalJSSize).padStart(10)} TOTAL JS${colors.reset}\n`);

  // Отчет по CSS файлам
  console.log(`${colors.magenta}🎨 CSS Files:${colors.reset}`);
  let totalCSSSize = 0;
  cssFiles.forEach(file => {
    totalCSSSize += file.size;
    const sizeStr = formatBytes(file.size);
    console.log(`  ${colors.green}${sizeStr.padStart(10)}${colors.reset} ${file.name}`);
  });
  console.log(`  ${colors.bright}${formatBytes(totalCSSSize).padStart(10)} TOTAL CSS${colors.reset}\n`);

  // Отчет по ассетам
  console.log(`${colors.blue}🖼️  Asset Files:${colors.reset}`);
  let totalAssetSize = 0;
  assetFiles.forEach(file => {
    totalAssetSize += file.size;
    const sizeStr = formatBytes(file.size);
    const color = file.size > 1000000 ? colors.red : file.size > 500000 ? colors.yellow : colors.green;
    console.log(`  ${color}${sizeStr.padStart(10)}${colors.reset} ${file.name}`);
  });
  console.log(`  ${colors.bright}${formatBytes(totalAssetSize).padStart(10)} TOTAL ASSETS${colors.reset}\n`);

  // Общий размер
  const totalSize = totalJSSize + totalCSSSize + totalAssetSize;
  console.log(`${colors.cyan}📊 Summary:${colors.reset}`);
  console.log(`  JavaScript: ${formatBytes(totalJSSize)} (${((totalJSSize / totalSize) * 100).toFixed(1)}%)`);
  console.log(`  CSS:        ${formatBytes(totalCSSSize)} (${((totalCSSSize / totalSize) * 100).toFixed(1)}%)`);
  console.log(`  Assets:     ${formatBytes(totalAssetSize)} (${((totalAssetSize / totalSize) * 100).toFixed(1)}%)`);
  console.log(`  ${colors.bright}Total:      ${formatBytes(totalSize)}${colors.reset}\n`);

  // Рекомендации
  console.log(`${colors.green}💡 Recommendations:${colors.reset}`);
  
  const largeJSFiles = jsFiles.filter(f => f.size > 500000);
  if (largeJSFiles.length > 0) {
    console.log(`  ${colors.yellow}⚠️  Large JS files detected (>500KB):${colors.reset}`);
    largeJSFiles.forEach(file => {
      console.log(`     - ${file.name} (${formatBytes(file.size)})`);
    });
    console.log(`     Consider code splitting or lazy loading.`);
  }

  const largeAssets = assetFiles.filter(f => f.size > 1000000);
  if (largeAssets.length > 0) {
    console.log(`  ${colors.yellow}⚠️  Large assets detected (>1MB):${colors.reset}`);
    largeAssets.forEach(file => {
      console.log(`     - ${file.name} (${formatBytes(file.size)})`);
    });
    console.log(`     Consider image optimization or lazy loading.`);
  }

  if (totalJSSize < 2000000) {
    console.log(`  ${colors.green}✅ Good JS bundle size (<2MB)${colors.reset}`);
  } else {
    console.log(`  ${colors.red}❌ Large JS bundle size (>2MB)${colors.reset}`);
  }

  console.log(`\n${colors.cyan}🔍 For detailed analysis, run: ANALYZE=true npm run build${colors.reset}`);
}

// Запуск анализа
analyzeBuildDirectory();
