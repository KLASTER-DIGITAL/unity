#!/usr/bin/env node

/**
 * Lighthouse Performance Audit Script
 * Автоматически запускает Lighthouse audit и генерирует отчет о производительности
 */

const { execSync, spawn } = require('child_process');
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

function checkLighthouseInstalled() {
  try {
    execSync('lighthouse --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function installLighthouse() {
  console.log(`${colors.yellow}📦 Installing Lighthouse CLI...${colors.reset}`);
  try {
    execSync('npm install -g lighthouse', { stdio: 'inherit' });
    console.log(`${colors.green}✅ Lighthouse installed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to install Lighthouse${colors.reset}`);
    console.log(`Please install manually: npm install -g lighthouse`);
    return false;
  }
}

function startDevServer() {
  console.log(`${colors.blue}🚀 Starting development server...${colors.reset}`);
  
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: false
    });

    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Ищем сообщение о готовности сервера
      if (output.includes('Local:') && output.includes('3000') && !serverReady) {
        serverReady = true;
        setTimeout(() => resolve(server), 2000); // Даем серверу время полностью запуститься
      }
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    server.on('error', (error) => {
      reject(error);
    });

    // Таймаут на случай, если сервер не запустится
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

function runLighthouseAudit(url = 'http://localhost:3000') {
  console.log(`${colors.cyan}🔍 Running Lighthouse audit on ${url}...${colors.reset}`);
  
  const outputDir = path.join(process.cwd(), 'lighthouse-reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(outputDir, `lighthouse-report-${timestamp}.html`);
  const jsonPath = path.join(outputDir, `lighthouse-report-${timestamp}.json`);

  try {
    // Запускаем Lighthouse с настройками для PWA
    const command = `lighthouse "${url}" \
      --output=html,json \
      --output-path="${reportPath.replace('.html', '')}" \
      --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
      --preset=perf \
      --throttling-method=simulate \
      --form-factor=mobile \
      --screenEmulation.mobile=true \
      --screenEmulation.width=375 \
      --screenEmulation.height=667 \
      --screenEmulation.deviceScaleFactor=2`;

    console.log(`${colors.blue}Running audit...${colors.reset}`);
    execSync(command, { stdio: 'inherit' });

    return { reportPath, jsonPath };
  } catch (error) {
    console.log(`${colors.red}❌ Lighthouse audit failed${colors.reset}`);
    throw error;
  }
}

function parseResults(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.log(`${colors.yellow}⚠️  JSON report not found, skipping detailed analysis${colors.reset}`);
    return null;
  }

  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const { lhr } = report;

  return {
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    pwa: lhr.categories.pwa ? Math.round(lhr.categories.pwa.score * 100) : null,
    metrics: {
      fcp: lhr.audits['first-contentful-paint'].displayValue,
      lcp: lhr.audits['largest-contentful-paint'].displayValue,
      fid: lhr.audits['max-potential-fid'] ? lhr.audits['max-potential-fid'].displayValue : 'N/A',
      cls: lhr.audits['cumulative-layout-shift'].displayValue,
      si: lhr.audits['speed-index'].displayValue,
      tti: lhr.audits['interactive'].displayValue,
    },
    opportunities: lhr.audits,
  };
}

function displayResults(results) {
  if (!results) return;

  console.log(`\n${colors.cyan}📊 Lighthouse Audit Results${colors.reset}\n`);

  // Scores
  console.log(`${colors.bright}Scores:${colors.reset}`);
  const scoreColor = (score) => {
    if (score >= 90) return colors.green;
    if (score >= 50) return colors.yellow;
    return colors.red;
  };

  console.log(`  Performance:     ${scoreColor(results.performance)}${results.performance}${colors.reset}`);
  console.log(`  Accessibility:   ${scoreColor(results.accessibility)}${results.accessibility}${colors.reset}`);
  console.log(`  Best Practices:  ${scoreColor(results.bestPractices)}${results.bestPractices}${colors.reset}`);
  console.log(`  SEO:             ${scoreColor(results.seo)}${results.seo}${colors.reset}`);
  if (results.pwa) {
    console.log(`  PWA:             ${scoreColor(results.pwa)}${results.pwa}${colors.reset}`);
  }

  // Core Web Vitals
  console.log(`\n${colors.bright}Core Web Vitals:${colors.reset}`);
  console.log(`  First Contentful Paint (FCP): ${results.metrics.fcp}`);
  console.log(`  Largest Contentful Paint (LCP): ${results.metrics.lcp}`);
  console.log(`  First Input Delay (FID): ${results.metrics.fid}`);
  console.log(`  Cumulative Layout Shift (CLS): ${results.metrics.cls}`);

  // Other Metrics
  console.log(`\n${colors.bright}Other Metrics:${colors.reset}`);
  console.log(`  Speed Index: ${results.metrics.si}`);
  console.log(`  Time to Interactive: ${results.metrics.tti}`);

  // Recommendations
  console.log(`\n${colors.yellow}💡 Key Recommendations:${colors.reset}`);
  
  const opportunities = Object.entries(results.opportunities)
    .filter(([key, audit]) => audit.score !== null && audit.score < 1 && audit.details?.overallSavingsMs > 100)
    .sort((a, b) => (b[1].details?.overallSavingsMs || 0) - (a[1].details?.overallSavingsMs || 0))
    .slice(0, 5);

  if (opportunities.length > 0) {
    opportunities.forEach(([key, audit]) => {
      const savings = audit.details?.overallSavingsMs;
      if (savings) {
        console.log(`  • ${audit.title}: ${Math.round(savings)}ms potential savings`);
      }
    });
  } else {
    console.log(`  ${colors.green}✅ No major performance issues detected!${colors.reset}`);
  }
}

async function runFullAudit() {
  console.log(`${colors.cyan}🚀 Starting Full Performance Audit${colors.reset}\n`);

  // Проверяем Lighthouse
  if (!checkLighthouseInstalled()) {
    console.log(`${colors.yellow}Lighthouse not found. Installing...${colors.reset}`);
    if (!installLighthouse()) {
      process.exit(1);
    }
  }

  let server = null;
  
  try {
    // Запускаем dev server
    server = await startDevServer();
    
    // Ждем немного для полной загрузки
    console.log(`${colors.blue}⏳ Waiting for server to be ready...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Запускаем audit
    const { reportPath, jsonPath } = runLighthouseAudit();
    
    // Парсим и показываем результаты
    const results = parseResults(jsonPath);
    displayResults(results);

    console.log(`\n${colors.green}✅ Audit completed!${colors.reset}`);
    console.log(`📄 HTML Report: ${reportPath}`);
    console.log(`📊 JSON Report: ${jsonPath}`);

  } catch (error) {
    console.error(`${colors.red}❌ Audit failed:${colors.reset}`, error.message);
    process.exit(1);
  } finally {
    // Останавливаем сервер
    if (server) {
      console.log(`\n${colors.blue}🛑 Stopping development server...${colors.reset}`);
      server.kill('SIGTERM');
    }
  }
}

// Парсинг аргументов командной строки
const args = process.argv.slice(2);
const command = args[0] || 'audit';

switch (command) {
  case 'audit':
    runFullAudit();
    break;
    
  case 'url':
    const url = args[1];
    if (!url) {
      console.log(`${colors.red}❌ Please provide a URL${colors.reset}`);
      console.log(`Usage: node scripts/lighthouse-audit.js url <URL>`);
      process.exit(1);
    }
    
    if (!checkLighthouseInstalled()) {
      console.log(`${colors.yellow}Installing Lighthouse...${colors.reset}`);
      if (!installLighthouse()) {
        process.exit(1);
      }
    }
    
    try {
      const { reportPath, jsonPath } = runLighthouseAudit(url);
      const results = parseResults(jsonPath);
      displayResults(results);
      console.log(`\n${colors.green}✅ Audit completed!${colors.reset}`);
      console.log(`📄 Report: ${reportPath}`);
    } catch (error) {
      console.error(`${colors.red}❌ Audit failed:${colors.reset}`, error.message);
      process.exit(1);
    }
    break;
    
  case 'help':
    console.log(`${colors.cyan}Lighthouse Performance Audit Tool${colors.reset}\n`);
    console.log(`Usage: node scripts/lighthouse-audit.js [command] [options]\n`);
    console.log(`Commands:`);
    console.log(`  audit        - Run full audit on local dev server (default)`);
    console.log(`  url <URL>    - Run audit on specific URL`);
    console.log(`  help         - Show this help message`);
    break;
    
  default:
    console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
    console.log(`Run 'node scripts/lighthouse-audit.js help' for usage information.`);
    process.exit(1);
}
