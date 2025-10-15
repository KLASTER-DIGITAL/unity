import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const importMappings: Record<string, string> = {
  // UI components
  'from "./components/ui/': 'from "@/shared/components/ui/',
  'from "../components/ui/': 'from "@/shared/components/ui/',
  'from "../../components/ui/': 'from "@/shared/components/ui/',
  'from "../../../components/ui/': 'from "@/shared/components/ui/',

  // Layout
  'from "./components/MobileBottomNav"': 'from "@/shared/components/layout/MobileBottomNav"',
  'from "../components/MobileBottomNav"': 'from "@/shared/components/layout/MobileBottomNav"',
  'from "../../components/MobileBottomNav"': 'from "@/shared/components/layout/MobileBottomNav"',
  'from "./components/MobileHeader"': 'from "@/shared/components/layout/MobileHeader"',
  'from "../components/MobileHeader"': 'from "@/shared/components/layout/MobileHeader"',
  'from "../../components/MobileHeader"': 'from "@/shared/components/layout/MobileHeader"',
  'from "./components/AchievementHeader"': 'from "@/shared/components/layout/AchievementHeader"',
  'from "../components/AchievementHeader"': 'from "@/shared/components/layout/AchievementHeader"',
  'from "../../components/AchievementHeader"': 'from "@/shared/components/layout/AchievementHeader"',

  // PWA
  'from "./components/PWAHead"': 'from "@/shared/components/pwa/PWAHead"',
  'from "../components/PWAHead"': 'from "@/shared/components/pwa/PWAHead"',
  'from "../../components/PWAHead"': 'from "@/shared/components/pwa/PWAHead"',
  'from "./components/PWASplash"': 'from "@/shared/components/pwa/PWASplash"',
  'from "../components/PWASplash"': 'from "@/shared/components/pwa/PWASplash"',
  'from "../../components/PWASplash"': 'from "@/shared/components/pwa/PWASplash"',
  'from "./components/PWAStatus"': 'from "@/shared/components/pwa/PWAStatus"',
  'from "../components/PWAStatus"': 'from "@/shared/components/pwa/PWAStatus"',
  'from "../../components/PWAStatus"': 'from "@/shared/components/pwa/PWAStatus"',
  'from "./components/PWAUpdatePrompt"': 'from "@/shared/components/pwa/PWAUpdatePrompt"',
  'from "../components/PWAUpdatePrompt"': 'from "@/shared/components/pwa/PWAUpdatePrompt"',
  'from "../../components/PWAUpdatePrompt"': 'from "@/shared/components/pwa/PWAUpdatePrompt"',
  'from "./components/InstallPrompt"': 'from "@/shared/components/pwa/InstallPrompt"',
  'from "../components/InstallPrompt"': 'from "@/shared/components/pwa/InstallPrompt"',
  'from "../../components/InstallPrompt"': 'from "@/shared/components/pwa/InstallPrompt"',

  // Utils - API
  'from "./utils/api"': 'from "@/shared/lib/api"',
  'from "../utils/api"': 'from "@/shared/lib/api"',
  'from "../../utils/api"': 'from "@/shared/lib/api"',
  'from "../../../utils/api"': 'from "@/shared/lib/api"',
  'from "./utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',
  'from "../utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',
  'from "../../utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',
  'from "../../../utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',

  // Utils - Auth
  'from "./utils/auth"': 'from "@/shared/lib/auth"',
  'from "../utils/auth"': 'from "@/shared/lib/auth"',
  'from "../../utils/auth"': 'from "@/shared/lib/auth"',
  'from "../../../utils/auth"': 'from "@/shared/lib/auth"',

  // i18n
  'from "./components/i18n"': 'from "@/shared/lib/i18n"',
  'from "../components/i18n"': 'from "@/shared/lib/i18n"',
  'from "../../components/i18n"': 'from "@/shared/lib/i18n"',
  'from "../../../components/i18n"': 'from "@/shared/lib/i18n"',
  'from "./utils/i18n"': 'from "@/shared/lib/i18n"',
  'from "../utils/i18n"': 'from "@/shared/lib/i18n"',
  'from "../../utils/i18n"': 'from "@/shared/lib/i18n"',

  // Screens - Mobile
  'from "./components/screens/AchievementHomeScreen"': 'from "@/features/mobile/home"',
  'from "../components/screens/AchievementHomeScreen"': 'from "@/features/mobile/home"',
  'from "../../components/screens/AchievementHomeScreen"': 'from "@/features/mobile/home"',
  'from "./components/screens/HistoryScreen"': 'from "@/features/mobile/history"',
  'from "../components/screens/HistoryScreen"': 'from "@/features/mobile/history"',
  'from "../../components/screens/HistoryScreen"': 'from "@/features/mobile/history"',
  'from "./components/screens/AchievementsScreen"': 'from "@/features/mobile/achievements"',
  'from "../components/screens/AchievementsScreen"': 'from "@/features/mobile/achievements"',
  'from "../../components/screens/AchievementsScreen"': 'from "@/features/mobile/achievements"',
  'from "./components/screens/ReportsScreen"': 'from "@/features/mobile/reports"',
  'from "../components/screens/ReportsScreen"': 'from "@/features/mobile/reports"',
  'from "../../components/screens/ReportsScreen"': 'from "@/features/mobile/reports"',
  'from "./components/screens/SettingsScreen"': 'from "@/features/mobile/settings"',
  'from "../components/screens/SettingsScreen"': 'from "@/features/mobile/settings"',
  'from "../../components/screens/SettingsScreen"': 'from "@/features/mobile/settings"',

  // Screens - Admin
  'from "./components/screens/AdminDashboard"': 'from "@/features/admin/dashboard"',
  'from "../components/screens/AdminDashboard"': 'from "@/features/admin/dashboard"',
  'from "../../components/screens/AdminDashboard"': 'from "@/features/admin/dashboard"',
  'from "./components/AdminLoginScreen"': 'from "@/features/admin/auth"',
  'from "../components/AdminLoginScreen"': 'from "@/features/admin/auth"',
  'from "../../components/AdminLoginScreen"': 'from "@/features/admin/auth"',

  // Auth screens
  'from "./components/WelcomeScreen"': 'from "@/features/mobile/auth"',
  'from "../components/WelcomeScreen"': 'from "@/features/mobile/auth"',
  'from "../../components/WelcomeScreen"': 'from "@/features/mobile/auth"',
  'from "./components/AuthScreen"': 'from "@/features/mobile/auth"',
  'from "../components/AuthScreen"': 'from "@/features/mobile/auth"',
  'from "../../components/AuthScreen"': 'from "@/features/mobile/auth"',
  'from "./components/OnboardingScreen2"': 'from "@/features/mobile/auth"',
  'from "../components/OnboardingScreen2"': 'from "@/features/mobile/auth"',
  'from "../../components/OnboardingScreen2"': 'from "@/features/mobile/auth"',
  'from "./components/OnboardingScreen3"': 'from "@/features/mobile/auth"',
  'from "../components/OnboardingScreen3"': 'from "@/features/mobile/auth"',
  'from "../../components/OnboardingScreen3"': 'from "@/features/mobile/auth"',
  'from "./components/OnboardingScreen4"': 'from "@/features/mobile/auth"',
  'from "../components/OnboardingScreen4"': 'from "@/features/mobile/auth"',
  'from "../../components/OnboardingScreen4"': 'from "@/features/mobile/auth"',

  // Media components
  'from "./components/MediaLightbox"': 'from "@/features/mobile/media"',
  'from "../components/MediaLightbox"': 'from "@/features/mobile/media"',
  'from "../../components/MediaLightbox"': 'from "@/features/mobile/media"',
  'from "./components/MediaPreview"': 'from "@/features/mobile/media"',
  'from "../components/MediaPreview"': 'from "@/features/mobile/media"',
  'from "../../components/MediaPreview"': 'from "@/features/mobile/media"',
  'from "./components/VoiceRecordingModal"': 'from "@/features/mobile/media"',
  'from "../components/VoiceRecordingModal"': 'from "@/features/mobile/media"',
  'from "../../components/VoiceRecordingModal"': 'from "@/features/mobile/media"',

  // Home components
  'from "./components/RecentEntriesFeed"': 'from "@/features/mobile/home"',
  'from "../components/RecentEntriesFeed"': 'from "@/features/mobile/home"',
  'from "../../components/RecentEntriesFeed"': 'from "@/features/mobile/home"',
  'from "./components/ChatInputSection"': 'from "@/features/mobile/home"',
  'from "../components/ChatInputSection"': 'from "@/features/mobile/home"',
  'from "../../components/ChatInputSection"': 'from "@/features/mobile/home"',
};

function updateImportsInFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let updated = false;

    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        updated = true;
      }
    }

    if (updated) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
    return false;
  }
}

function processDirectory(dirPath: string): number {
  let updatedCount = 0;
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, build, dist
      if (['node_modules', 'build', 'dist', '.git'].includes(entry)) {
        continue;
      }
      updatedCount += processDirectory(fullPath);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      if (updateImportsInFile(fullPath)) {
        updatedCount++;
      }
    }
  }

  return updatedCount;
}

// Main execution
const srcPath = join(process.cwd(), 'src');
console.log('🔄 Starting import updates...\n');
const updatedFiles = processDirectory(srcPath);
console.log(`\n✅ Updated ${updatedFiles} files`);

