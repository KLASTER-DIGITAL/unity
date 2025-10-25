#!/bin/bash

# Fix unused imports in UI components
echo "🔧 Fixing unused imports in src/components/ui/..."

# Remove Component and ComponentProps from all UI files
find src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/, Component//g' {} \;
find src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/Component, //g' {} \;
find src/components/ui -name "*.tsx" -type f -exec sed -i '' '/^import type { ComponentProps } from "react";$/d' {} \;

# Remove unused React hooks from carousel
sed -i '' 's/useState, useEffect, useCallback, useContext, //g' src/components/ui/carousel.tsx
sed -i '' 's/, forwardRef//g' src/components/ui/chart.tsx
sed -i '' '/^import type { ReactNode, HTMLAttributes, CSSProperties } from "react";$/d' src/components/ui/chart.tsx
sed -i '' 's/useContext, //g' src/components/ui/form.tsx

echo "🔧 Fixing unused imports in src/shared/components/ui/..."

# Remove Component and ComponentProps from shared UI files
find src/shared/components/ui -name "*.tsx" -type f -exec sed -i '' 's/, Component//g' {} \;
find src/shared/components/ui -name "*.tsx" -type f -exec sed -i '' 's/Component, //g' {} \;
find src/shared/components/ui -name "*.tsx" -type f -exec sed -i '' '/^import type { ComponentProps } from "react";$/d' {} \;

# Remove unused React hooks from shared carousel
sed -i '' 's/useState, useEffect, useCallback, useContext, //g' src/shared/components/ui/carousel.tsx
sed -i '' 's/, forwardRef//g' src/shared/components/ui/chart.tsx
sed -i '' '/^import type { ReactNode, HTMLAttributes, CSSProperties } from "react";$/d' src/shared/components/ui/chart.tsx
sed -i '' 's/useContext, //g' src/shared/components/ui/form.tsx

echo "🔧 Fixing specific files..."

# App.tsx - remove useMemo
sed -i '' 's/, useMemo//g' src/App.tsx

# MobileHeader.tsx - remove unused props (will need manual fix for destructuring)
# TelegramSettingsTab.tsx - remove React and Badge
sed -i '' 's/^import React, { /import { /g' src/components/screens/admin/settings/TelegramSettingsTab.tsx
sed -i '' "/^import { Badge } from '@\/shared\/components\/ui\/badge';$/d" src/components/screens/admin/settings/TelegramSettingsTab.tsx

# AdvancedPWAAnalytics.tsx - remove Users
sed -i '' 's/  Users,$//' src/components/screens/admin/analytics/AdvancedPWAAnalytics.tsx

# SystemSettingsTab.tsx - remove Wifi
sed -i '' 's/, Wifi//g' src/components/screens/admin/settings/SystemSettingsTab.tsx

# CacheManager.tsx - remove getAllCaches
sed -i '' 's/  getAllCaches,$//' src/components/screens/admin/settings/CacheManager.tsx

# PushNotificationManager.tsx - remove getAvailableTemplateTypes
sed -i '' 's/  getAvailableTemplateTypes,$//' src/components/screens/admin/settings/PushNotificationManager.tsx

echo "✅ Done! Run 'npm run type-check' to verify."

