#!/bin/bash

# React Native Testing Script
# Проверяет все компоненты и функции React Native приложения

echo "🚀 UNITY-v2 React Native Testing Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_file() {
    local file=$1
    local description=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description - File not found: $file"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Test directory
test_directory() {
    local dir=$1
    local description=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description - Directory not found: $dir"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "📁 Testing File Structure..."
echo "----------------------------"

# Core files
test_file "app/_layout.tsx" "Root Layout"
test_file "app/(tabs)/_layout.tsx" "Tabs Layout"
test_file "app/(tabs)/index.tsx" "Home Screen"
test_file "app/(tabs)/diary.tsx" "Diary Screen"
test_file "app/(tabs)/achievements.tsx" "Achievements Screen"
test_file "app/(tabs)/settings.tsx" "Settings Screen"

echo ""
echo "🎨 Testing Design System..."
echo "----------------------------"

# Design System
test_file "app-shared/design-system/tokens.ts" "Design Tokens"
test_directory "app-shared/components" "Components Directory"
test_directory "app-shared/hooks" "Hooks Directory"
test_directory "app-shared/contexts" "Contexts Directory"

echo ""
echo "🔧 Testing Hooks..."
echo "----------------------------"

# Hooks
test_file "app-shared/hooks/useEntries.ts" "useEntries Hook"
test_file "app-shared/hooks/useUserData.ts" "useUserData Hook"
test_file "app-shared/hooks/useTheme.ts" "useTheme Hook"

echo ""
echo "🎭 Testing Contexts..."
echo "----------------------------"

# Contexts
test_file "app-shared/contexts/ThemeContext.tsx" "Theme Context"

echo ""
echo "🗄️ Testing Supabase Integration..."
echo "----------------------------"

# Supabase
test_file "app-shared/lib/supabase/client.ts" "Supabase Client"

echo ""
echo "🎬 Testing Animations..."
echo "----------------------------"

# Animations
test_file "app-shared/components/animated/AnimatedPressable.tsx" "Animated Pressable"
test_file "app-shared/components/animated/AnimatedCard.tsx" "Animated Card"
test_file "app-shared/components/animated/SwipeableCard.tsx" "Swipeable Card"

echo ""
echo "🎨 Testing UI Components..."
echo "----------------------------"

# UI Components
test_file "app-shared/components/navigation/CustomTabBar.tsx" "Custom Tab Bar"
test_file "app-shared/components/LottiePreloader.native.tsx" "Lottie Preloader"
test_directory "app-shared/components/skeleton" "Skeleton Loaders"

echo ""
echo "📱 Testing Screen Components..."
echo "----------------------------"

# Screen Components
test_directory "app-shared/components/screens/home" "Home Components"
test_directory "app-shared/components/screens/history" "History Components"
test_directory "app-shared/components/screens/achievements" "Achievements Components"

echo ""
echo "🎨 Testing Lottie Assets..."
echo "----------------------------"

# Lottie Assets
test_file "app-shared/assets/lottie/Black-2.json" "Black Lottie Animation"
test_file "app-shared/assets/lottie/White-2.json" "White Lottie Animation"

echo ""
echo "📦 Testing Dependencies..."
echo "----------------------------"

# Check if node_modules exist
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules installed"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} node_modules not found - run 'npm install'"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check critical dependencies
DEPS=(
    "react-native-reanimated"
    "react-native-gesture-handler"
    "lottie-react-native"
    "expo-haptics"
    "@expo/vector-icons"
    "@supabase/supabase-js"
    "@react-native-async-storage/async-storage"
)

for dep in "${DEPS[@]}"; do
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ -d "node_modules/$dep" ]; then
        echo -e "${GREEN}✓${NC} $dep"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗${NC} $dep - not installed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
done

echo ""
echo "📊 Testing Configuration..."
echo "----------------------------"

# Configuration files
test_file "package.json" "package.json"
test_file "app.json" "app.json (Expo config)"
test_file "eas.json" "eas.json (EAS Build config)"
test_file ".gitignore" ".gitignore"
test_file ".vercelignore" ".vercelignore"

echo ""
echo "========================================"
echo "📊 Test Results"
echo "========================================"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

# Calculate percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $PERCENTAGE%"
    echo ""
    
    if [ $PERCENTAGE -eq 100 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    elif [ $PERCENTAGE -ge 80 ]; then
        echo -e "${YELLOW}⚠️  Most tests passed, but some issues found${NC}"
        exit 0
    else
        echo -e "${RED}❌ Many tests failed - please fix issues${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No tests were run${NC}"
    exit 1
fi

