#!/bin/bash

echo "🔧 Fixing Tailwind !important syntax..."

# Find all TypeScript/TSX files with !text-[, !font-, !bg-, etc.
files=$(grep -rl "className=\".*!" src --include="*.tsx" --include="*.ts")

for file in $files; do
  echo "📝 Fixing $file..."
  
  # Fix !text-[XXpx] -> text-[XXpx]!
  sed -i '' 's/!text-\[\([0-9]*px\)\]/text-[\1]!/g' "$file"
  
  # Fix !font-XXX -> font-XXX!
  sed -i '' 's/!font-\([a-z]*\)/font-\1!/g' "$file"
  
  # Fix !bg-XXX -> bg-XXX!
  sed -i '' 's/!bg-\([a-z-]*\)/bg-\1!/g' "$file"
  
  # Fix !rounded-[var(--radius)] -> rounded-[var(--radius)]!
  sed -i '' 's/!rounded-\[var(--radius)\]/rounded-[var(--radius)]!/g' "$file"
done

echo "✅ Done! Check the changes with git diff."

