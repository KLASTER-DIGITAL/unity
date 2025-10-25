import { motion } from "motion/react";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { SidebarProps } from "./types";

/**
 * Desktop Sidebar Component
 * Fixed sidebar for desktop view (lg+)
 */
export function DesktopSidebar({ menuItems, activeTab, userData, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-card lg:border-r lg:border-border">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6 bg-accent">
        <div className="w-10 h-10 rounded-(--radius) bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white text-[17px]!">Admin Panel</h1>
          <p className="text-white/80 text-[13px]! font-normal!">Дневник Достижений</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                console.log('[DesktopSidebar] Menu item clicked:', item.id);
                onTabChange(item.id);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-(--radius) transition-all text-[15px]! relative
                ${isActive
                  ? 'bg-accent text-accent-foreground shadow-lg'
                  : 'text-foreground hover:bg-muted'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-accent/20 rounded-(--radius)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted rounded-(--radius)">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0">
            {userData?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px]! text-foreground truncate">{userData?.email}</p>
            <p className="text-[12px]! text-muted-foreground font-normal!">Супер-администратор</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-[15px]!"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Выход
        </Button>
      </div>
    </aside>
  );
}

