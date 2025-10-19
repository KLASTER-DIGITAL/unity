#!/usr/bin/env node

/**
 * Image Optimization Script
 * Оптимизирует изображения в проекте для уменьшения размера бандла
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
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function findImages() {
  const assetsDir = path.join(process.cwd(), 'src/assets');
  const images = [];
  
  if (!fs.existsSync(assetsDir)) {
    console.log(`${colors.red}❌ Assets directory not found: ${assetsDir}${colors.reset}`);
    return images;
  }

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          images.push({
            path: filePath,
            name: file,
            size: stat.size,
            ext: ext
          });
        }
      }
    }
  }
  
  scanDirectory(assetsDir);
  return images;
}

function analyzeImages() {
  console.log(`${colors.cyan}🖼️  Image Analysis Report${colors.reset}\n`);
  
  const images = findImages();
  
  if (images.length === 0) {
    console.log(`${colors.yellow}No images found in src/assets${colors.reset}`);
    return;
  }

  // Сортировка по размеру
  images.sort((a, b) => b.size - a.size);

  console.log(`${colors.blue}📊 Found ${images.length} images:${colors.reset}`);
  
  let totalSize = 0;
  let largeImages = 0;
  
  images.forEach(image => {
    totalSize += image.size;
    const sizeStr = formatBytes(image.size);
    
    let color = colors.green;
    let warning = '';
    
    if (image.size > 1000000) { // >1MB
      color = colors.red;
      warning = ' ⚠️  VERY LARGE';
      largeImages++;
    } else if (image.size > 500000) { // >500KB
      color = colors.yellow;
      warning = ' ⚠️  LARGE';
      largeImages++;
    }
    
    console.log(`  ${color}${sizeStr.padStart(10)}${colors.reset} ${image.name}${warning}`);
  });
  
  console.log(`\n${colors.bright}Total size: ${formatBytes(totalSize)}${colors.reset}`);
  
  if (largeImages > 0) {
    console.log(`\n${colors.yellow}💡 Optimization Recommendations:${colors.reset}`);
    console.log(`  Found ${largeImages} large image(s) that should be optimized:`);
    console.log(`  
  1. Convert PNG to WebP format (better compression)
  2. Resize images to actual display size
  3. Use responsive images with different sizes
  4. Consider lazy loading for large images
  5. Use image CDN for production
    `);
    
    console.log(`${colors.cyan}🔧 Quick fixes:${colors.reset}`);
    console.log(`  # Install image optimization tools:`);
    console.log(`  npm install --save-dev @squoosh/lib imagemin imagemin-webp`);
    console.log(`  
  # Or use online tools:`);
    console.log(`  - https://squoosh.app/ (Google's image optimizer)`);
    console.log(`  - https://tinypng.com/ (PNG/JPEG compression)`);
    console.log(`  - https://convertio.co/ (format conversion)`);
  } else {
    console.log(`\n${colors.green}✅ All images are optimally sized!${colors.reset}`);
  }
}

function createWebPVersions() {
  console.log(`${colors.cyan}🔄 Creating WebP versions...${colors.reset}\n`);
  
  const images = findImages().filter(img => ['.png', '.jpg', '.jpeg'].includes(img.ext));
  
  if (images.length === 0) {
    console.log(`${colors.yellow}No PNG/JPEG images found to convert${colors.reset}`);
    return;
  }

  // Проверяем наличие cwebp (WebP encoder)
  try {
    execSync('which cwebp', { stdio: 'ignore' });
  } catch (error) {
    console.log(`${colors.red}❌ cwebp not found. Install WebP tools:${colors.reset}`);
    console.log(`  # macOS:`);
    console.log(`  brew install webp`);
    console.log(`  
  # Ubuntu/Debian:`);
    console.log(`  sudo apt-get install webp`);
    console.log(`  
  # Windows:`);
    console.log(`  Download from: https://developers.google.com/speed/webp/download`);
    return;
  }

  let converted = 0;
  let totalSavings = 0;

  for (const image of images) {
    const webpPath = image.path.replace(/\.(png|jpe?g)$/i, '.webp');
    
    if (fs.existsSync(webpPath)) {
      console.log(`  ${colors.yellow}⏭️  Skipping ${image.name} (WebP already exists)${colors.reset}`);
      continue;
    }

    try {
      // Конвертируем в WebP с качеством 80
      execSync(`cwebp -q 80 "${image.path}" -o "${webpPath}"`, { stdio: 'ignore' });
      
      const webpStat = fs.statSync(webpPath);
      const savings = image.size - webpStat.size;
      const savingsPercent = ((savings / image.size) * 100).toFixed(1);
      
      totalSavings += savings;
      converted++;
      
      console.log(`  ${colors.green}✅ ${image.name} → ${path.basename(webpPath)}${colors.reset}`);
      console.log(`     ${formatBytes(image.size)} → ${formatBytes(webpStat.size)} (${savingsPercent}% smaller)`);
      
    } catch (error) {
      console.log(`  ${colors.red}❌ Failed to convert ${image.name}${colors.reset}`);
    }
  }

  if (converted > 0) {
    console.log(`\n${colors.green}🎉 Converted ${converted} images to WebP${colors.reset}`);
    console.log(`${colors.bright}Total savings: ${formatBytes(totalSavings)}${colors.reset}`);
    console.log(`\n${colors.cyan}💡 Next steps:${colors.reset}`);
    console.log(`  1. Update your code to use WebP images with PNG/JPEG fallbacks`);
    console.log(`  2. Use <picture> element for better browser support`);
    console.log(`  3. Consider removing original files if WebP is sufficient`);
  }
}

// Парсинг аргументов командной строки
const args = process.argv.slice(2);
const command = args[0] || 'analyze';

switch (command) {
  case 'analyze':
    analyzeImages();
    break;
  case 'convert':
    createWebPVersions();
    break;
  case 'help':
    console.log(`${colors.cyan}Image Optimization Tool${colors.reset}\n`);
    console.log(`Usage: node scripts/optimize-images.js [command]\n`);
    console.log(`Commands:`);
    console.log(`  analyze  - Analyze images and show optimization recommendations (default)`);
    console.log(`  convert  - Convert PNG/JPEG images to WebP format`);
    console.log(`  help     - Show this help message`);
    break;
  default:
    console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
    console.log(`Run 'node scripts/optimize-images.js help' for usage information.`);
    process.exit(1);
}
