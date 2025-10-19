/**
 * Enhanced Mobile Bottom Navigation for UNITY-v2
 *
 * Features:
 * - Floating effect with shadow and rounded top corners
 * - Pill-style active tab with smooth animations
 * - Label shows only for active tab (space-efficient)
 * - Framer Motion animations for smooth transitions
 * - iOS Design System compliance
 * - React Native ready (90%+ compatibility)
 *
 * Reference: https://21st.dev/community/components/arunachalam0606/bottom-nav-bar/default
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { Home, History, Trophy, BarChart3, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, Language } from "@/utils/i18n";
import { cn } from "@/shared/components/ui/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language?: Language;
  stickyBottom?: boolean; // Enable sticky bottom mode (no margin)
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  language = 'ru',
  stickyBottom = false
}: MobileBottomNavProps) {
  const t = useTranslations(language);

  const tabs = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'history', label: t.history, icon: History },
    { id: 'achievements', label: t.achievements, icon: Trophy },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        // Position & Layout
        "fixed left-0 right-0 z-navigation max-w-md mx-auto",
        // Floating effect (unless sticky)
        stickyBottom ? "bottom-0" : "bottom-4",
        // Background & Border
        "bg-card/95 backdrop-blur-lg border border-border",
        // Rounded corners (top only for floating, all for sticky)
        stickyBottom ? "rounded-none border-t" : "rounded-t-3xl shadow-xl",
        // Padding
        "px-2 py-3",
        // Transitions
        "transition-colors duration-300"
      )}
      style={{
        // iOS-style blur effect
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex justify-around items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                // Base styles - HORIZONTAL layout (flex-row)
                "relative flex flex-row items-center justify-center gap-2",
                "min-w-[44px] min-h-[44px]", // iOS touch target size
                "rounded-full transition-all duration-200",
                // Active state - pill style with padding
                isActive && "bg-primary/15 px-3 py-2",
                // Inactive state - compact
                !isActive && "px-2 py-2",
                // Hover effect (only for inactive)
                !isActive && "hover:bg-primary/5 active:bg-primary/10"
              )}
              whileTap={{ scale: 0.95 }}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Icon */}
              <motion.div
                layout
                className={cn(
                  "flex items-center justify-center shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </motion.div>

              {/* Label - only show for active tab, HORIZONTAL next to icon */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] font-normal text-primary whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}