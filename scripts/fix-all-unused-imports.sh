#!/bin/bash

echo "🔧 Fixing ALL unused imports..."

# Fix Component imports in src/components/ui/
echo "📁 Fixing src/components/ui/..."
for file in src/components/ui/*.tsx; do
  # Remove Component from React import
  sed -i '' 's/import React, { Component }/import React/g' "$file"
  sed -i '' 's/import React, {Component}/import React/g' "$file"
  # Remove standalone Component import
  sed -i '' '/^import type { ComponentProps } from "react";$/d' "$file"
done

# Fix Component imports in src/shared/components/ui/
echo "📁 Fixing src/shared/components/ui/..."
for file in src/shared/components/ui/*.tsx; do
  # Remove Component from React import
  sed -i '' 's/import React, { Component }/import React/g' "$file"
  sed -i '' 's/import React, {Component}/import React/g' "$file"
  # Remove standalone Component import
  sed -i '' '/^import type { ComponentProps } from "react";$/d' "$file"
done

# Fix specific files with unused hooks
echo "🔧 Fixing carousel files..."
sed -i '' 's/import React, { useState, useEffect, useCallback, useContext }/import React/g' src/components/ui/carousel.tsx
sed -i '' 's/import React, { useState, useEffect, useCallback, useContext }/import React/g' src/shared/components/ui/carousel.tsx

echo "🔧 Fixing chart files..."
sed -i '' 's/import React, { forwardRef }/import React/g' src/components/ui/chart.tsx
sed -i '' 's/import React, { forwardRef }/import React/g' src/shared/components/ui/chart.tsx
sed -i '' '/^import type { ReactNode, HTMLAttributes, CSSProperties } from "react";$/d' src/components/ui/chart.tsx
sed -i '' '/^import type { ReactNode, HTMLAttributes, CSSProperties } from "react";$/d' src/shared/components/ui/chart.tsx

echo "🔧 Fixing form files..."
sed -i '' 's/import React, { useContext }/import React/g' src/components/ui/form.tsx
sed -i '' 's/import React, { useContext }/import React/g' src/shared/components/ui/form.tsx

# Fix MobileHeader.tsx - remove unused props
echo "🔧 Fixing MobileHeader.tsx..."
# This needs manual fix for destructuring, skip for now

# Fix AdvancedPWAAnalytics.tsx - remove unused data variable
echo "🔧 Fixing AdvancedPWAAnalytics.tsx..."
sed -i '' 's/const data = {/\/\/ const data = {/g' src/components/screens/admin/analytics/AdvancedPWAAnalytics.tsx

# Fix utils/auth.ts - remove unused data variables
echo "🔧 Fixing utils/auth.ts..."
sed -i '' 's/const { data, error }/const { error }/g' src/utils/auth.ts

# Fix utils/imageCompression.ts - remove unused maxHeight
echo "🔧 Fixing utils/imageCompression.ts..."
sed -i '' 's/maxHeight: number = 1920,/\/\/ maxHeight: number = 1920,/g' src/utils/imageCompression.ts

# Fix utils/lazyLoad.ts - remove unused options
echo "🔧 Fixing utils/lazyLoad.ts..."
sed -i '' 's/options: LazyLoadOptions = {}/\/\/ options: LazyLoadOptions = {}/g' src/utils/lazyLoad.ts

echo "✅ Done! Run 'npm run type-check' to verify."

