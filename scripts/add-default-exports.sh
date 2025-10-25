#!/bin/bash

# Add export default to lazy-loaded components

echo "🔧 Adding export default to lazy-loaded components..."

# Function to add export default if not exists
add_default_export() {
  local file=$1
  local component_name=$2
  
  # Check if export default already exists
  if grep -q "export default ${component_name}" "$file"; then
    echo "  ✓ ${file} already has export default"
    return
  fi
  
  # Add export default at the end of file
  echo "" >> "$file"
  echo "export default ${component_name};" >> "$file"
  echo "  ✅ Added export default to ${file}"
}

# Mobile components
add_default_export "src/features/mobile/home/components/AchievementHomeScreen.tsx" "AchievementHomeScreen"
add_default_export "src/features/mobile/history/components/HistoryScreen.tsx" "HistoryScreen"
add_default_export "src/features/mobile/achievements/components/AchievementsScreen.tsx" "AchievementsScreen"
add_default_export "src/features/mobile/reports/components/ReportsScreen.tsx" "ReportsScreen"
add_default_export "src/features/mobile/settings/components/SettingsScreen.tsx" "SettingsScreen"

# Auth components
add_default_export "src/features/mobile/auth/components/WelcomeScreen.tsx" "WelcomeScreen"
add_default_export "src/features/mobile/auth/components/AuthScreenNew.tsx" "AuthScreenNew"
add_default_export "src/features/mobile/auth/components/OnboardingScreen2.tsx" "OnboardingScreen2"
add_default_export "src/features/mobile/auth/components/OnboardingScreen3.tsx" "OnboardingScreen3"
add_default_export "src/features/mobile/auth/components/OnboardingScreen4.tsx" "OnboardingScreen4"

# Admin components
add_default_export "src/features/admin/dashboard/components/AdminDashboard.tsx" "AdminDashboard"

echo "✅ Done! All components now have export default."

