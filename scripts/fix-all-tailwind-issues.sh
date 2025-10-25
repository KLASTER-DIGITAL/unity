#!/bin/bash

echo "🔧 Fixing ALL Tailwind CSS syntax issues..."

# Find all TypeScript/TSX files
files=$(find src -name "*.tsx" -o -name "*.ts")

count=0

for file in $files; do
  # Check if file has className
  if grep -q "className=" "$file"; then
    changed=false
    
    # Fix text-[XXpx]! -> text-[XXpx]! (already correct, skip)
    # Fix !text-[XXpx] -> text-[XXpx]!
    if grep -q '!text-\[' "$file"; then
      sed -i '' 's/!text-\[\([0-9]*px\)\]/text-[\1]!/g' "$file"
      changed=true
    fi
    
    # Fix !font-XXX -> font-XXX!
    if grep -q '!font-' "$file"; then
      sed -i '' 's/!font-\([a-z]*\)/font-\1!/g' "$file"
      changed=true
    fi
    
    # Fix !bg-XXX -> bg-XXX!
    if grep -q '!bg-' "$file"; then
      sed -i '' 's/!bg-\([a-z-]*\)/bg-\1!/g' "$file"
      changed=true
    fi
    
    # Fix bg-gradient-to-* -> bg-linear-to-*
    if grep -q 'bg-gradient-to-' "$file"; then
      sed -i '' 's/bg-gradient-to-/bg-linear-to-/g' "$file"
      changed=true
    fi
    
    # Fix rounded-[var(--radius)] -> rounded-(--radius)
    if grep -q 'rounded-\[var(--radius)\]' "$file"; then
      sed -i '' 's/rounded-\[var(--radius)\]/rounded-(--radius)/g' "$file"
      changed=true
    fi
    
    # Fix rounded-[var(--radius-xl)] -> rounded-xl
    if grep -q 'rounded-\[var(--radius-xl)\]' "$file"; then
      sed -i '' 's/rounded-\[var(--radius-xl)\]/rounded-xl/g' "$file"
      changed=true
    fi
    
    # Fix data-[disabled] -> data-disabled
    if grep -q 'data-\[disabled\]' "$file"; then
      sed -i '' 's/data-\[disabled\]/data-disabled/g' "$file"
      changed=true
    fi
    
    # Fix data-[orientation=vertical] -> data-orientation-vertical
    if grep -q 'data-\[orientation=vertical\]' "$file"; then
      sed -i '' 's/data-\[orientation=vertical\]/data-orientation-vertical/g' "$file"
      changed=true
    fi
    
    if [ "$changed" = true ]; then
      echo "✅ Fixed $file"
      ((count++))
    fi
  fi
done

echo ""
echo "🎉 Done! Fixed $count files."
echo "Run 'git diff' to see changes."

