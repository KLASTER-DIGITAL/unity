#!/usr/bin/env node

/**
 * Update Image Imports Script
 * Автоматически обновляет импорты изображений для использования OptimizedImage компонента
 */

const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function findTSXFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSXFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeImageUsage() {
  console.log(`${colors.cyan}🔍 Analyzing image usage in TSX files...${colors.reset}\n`);
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = findTSXFiles(srcDir);
  
  let totalFiles = 0;
  let filesWithImages = 0;
  let totalImageTags = 0;
  let figmaAssets = 0;
  
  const imagePatterns = [
    /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi,
    /import\s+\w+\s+from\s+["']figma:asset\/[^"']+["']/gi,
    /figma:asset\/[\w\d]+\.png/gi,
  ];
  
  const results = [];
  
  for (const file of files) {
    totalFiles++;
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    let fileHasImages = false;
    let fileImageCount = 0;
    let fileFigmaAssets = 0;
    
    // Поиск <img> тегов
    const imgMatches = content.match(imagePatterns[0]);
    if (imgMatches) {
      fileHasImages = true;
      fileImageCount += imgMatches.length;
      totalImageTags += imgMatches.length;
    }
    
    // Поиск figma assets
    const figmaMatches = content.match(imagePatterns[1]) || content.match(imagePatterns[2]);
    if (figmaMatches) {
      fileHasImages = true;
      fileFigmaAssets += figmaMatches.length;
      figmaAssets += figmaMatches.length;
    }
    
    if (fileHasImages) {
      filesWithImages++;
      results.push({
        file: relativePath,
        imageCount: fileImageCount,
        figmaAssets: fileFigmaAssets,
        content: content
      });
    }
  }
  
  console.log(`${colors.blue}📊 Analysis Results:${colors.reset}`);
  console.log(`  Total files scanned: ${totalFiles}`);
  console.log(`  Files with images: ${filesWithImages}`);
  console.log(`  Total <img> tags: ${totalImageTags}`);
  console.log(`  Figma assets: ${figmaAssets}\n`);
  
  if (results.length > 0) {
    console.log(`${colors.yellow}📁 Files with images:${colors.reset}`);
    results.forEach(result => {
      const indicators = [];
      if (result.imageCount > 0) indicators.push(`${result.imageCount} img`);
      if (result.figmaAssets > 0) indicators.push(`${result.figmaAssets} figma`);
      
      console.log(`  ${result.file} (${indicators.join(', ')})`);
    });
    console.log();
  }
  
  return results;
}

function generateMigrationPlan(results) {
  console.log(`${colors.green}🔧 Migration Plan:${colors.reset}\n`);
  
  console.log(`${colors.yellow}1. Import OptimizedImage component:${colors.reset}`);
  console.log(`   Add to files that use images:`);
  console.log(`   import { OptimizedImage } from '@/shared/components/OptimizedImage';`);
  console.log();
  
  console.log(`${colors.yellow}2. Replace <img> tags:${colors.reset}`);
  console.log(`   Before: <img src="/path/image.png" alt="Description" className="..." />`);
  console.log(`   After:  <OptimizedImage src="/path/image.png" alt="Description" className="..." />`);
  console.log();
  
  console.log(`${colors.yellow}3. Update figma assets:${colors.reset}`);
  console.log(`   Before: import image from 'figma:asset/hash.png'`);
  console.log(`   After:  Use OptimizedImage with figma asset path`);
  console.log();
  
  console.log(`${colors.yellow}4. Add lazy loading for below-fold images:${colors.reset}`);
  console.log(`   Use: <LazyOptimizedImage /> for images not immediately visible`);
  console.log(`   Use: <PriorityOptimizedImage /> for above-fold critical images`);
  console.log();
  
  console.log(`${colors.cyan}💡 Benefits after migration:${colors.reset}`);
  console.log(`  ✅ Automatic WebP usage with PNG/JPEG fallback`);
  console.log(`  ✅ Lazy loading for better performance`);
  console.log(`  ✅ Responsive images support`);
  console.log(`  ✅ ~80-90% smaller image sizes`);
  console.log();
  
  if (results.length > 0) {
    console.log(`${colors.blue}🎯 Priority files to migrate:${colors.reset}`);
    
    // Сортируем по количеству изображений
    const priorityFiles = results
      .sort((a, b) => (b.imageCount + b.figmaAssets) - (a.imageCount + a.figmaAssets))
      .slice(0, 5);
    
    priorityFiles.forEach((result, index) => {
      const total = result.imageCount + result.figmaAssets;
      console.log(`  ${index + 1}. ${result.file} (${total} images)`);
    });
  }
}

function createMigrationExample() {
  const examplePath = path.join(process.cwd(), 'src/shared/components/OptimizedImageExample.tsx');
  
  const exampleContent = `import React from 'react';
import { 
  OptimizedImage, 
  LazyOptimizedImage, 
  PriorityOptimizedImage,
  ResponsiveOptimizedImage 
} from './OptimizedImage';

/**
 * Примеры использования OptimizedImage компонента
 */
export const OptimizedImageExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold">OptimizedImage Examples</h2>
      
      {/* Критическое изображение (above the fold) */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Priority Image (Above the fold)</h3>
        <PriorityOptimizedImage
          src="/assets/hero-image.png"
          alt="Hero image"
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </section>
      
      {/* Lazy loading изображение */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Lazy Loaded Image</h3>
        <LazyOptimizedImage
          src="/assets/feature-image.png"
          alt="Feature showcase"
          className="w-full max-w-sm rounded-lg"
        />
      </section>
      
      {/* Responsive изображение */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Responsive Image</h3>
        <ResponsiveOptimizedImage
          src="/assets/responsive-image.png"
          alt="Responsive showcase"
          className="w-full rounded-lg"
          breakpoints={{
            mobile: '100vw',
            tablet: '50vw',
            desktop: '33vw'
          }}
        />
      </section>
      
      {/* Обычное оптимизированное изображение */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Standard Optimized Image</h3>
        <OptimizedImage
          src="/assets/standard-image.png"
          alt="Standard image"
          className="w-64 h-64 object-cover rounded-full"
          width={256}
          height={256}
        />
      </section>
    </div>
  );
};

export default OptimizedImageExamples;`;

  fs.writeFileSync(examplePath, exampleContent);
  console.log(`${colors.green}✅ Created example file: ${path.relative(process.cwd(), examplePath)}${colors.reset}`);
}

// Парсинг аргументов командной строки
const args = process.argv.slice(2);
const command = args[0] || 'analyze';

switch (command) {
  case 'analyze':
    const results = analyzeImageUsage();
    generateMigrationPlan(results);
    break;
    
  case 'example':
    createMigrationExample();
    console.log(`${colors.cyan}📝 Example component created!${colors.reset}`);
    console.log(`   Import and use OptimizedImageExamples to see all usage patterns.`);
    break;
    
  case 'help':
    console.log(`${colors.cyan}Image Import Update Tool${colors.reset}\n`);
    console.log(`Usage: node scripts/update-image-imports.js [command]\n`);
    console.log(`Commands:`);
    console.log(`  analyze  - Analyze current image usage and generate migration plan (default)`);
    console.log(`  example  - Create example component showing OptimizedImage usage`);
    console.log(`  help     - Show this help message`);
    break;
    
  default:
    console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
    console.log(`Run 'node scripts/update-image-imports.js help' for usage information.`);
    process.exit(1);
}
