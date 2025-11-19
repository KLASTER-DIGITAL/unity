#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read SQL file
const sqlFilePath = path.join(__dirname, 'add-remaining-translations.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

// Extract INSERT statement (skip comments)
const lines = sqlContent.split('\n');
const insertLines = lines.filter(line =>
  !line.trim().startsWith('--') &&
  line.trim().length > 0
);
const sqlQuery = insertLines.join('\n');

console.log('📊 SQL Query готов к выполнению');
console.log('📝 Длина запроса:', sqlQuery.length, 'символов');
console.log('\n🔗 Откройте Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/sql/new');
console.log('\n📋 Скопируйте и вставьте следующий SQL:\n');
console.log('='.repeat(80));
console.log(sqlQuery);
console.log('='.repeat(80));
console.log('\n✅ После выполнения обновите страницу в браузере (Ctrl+R)');
