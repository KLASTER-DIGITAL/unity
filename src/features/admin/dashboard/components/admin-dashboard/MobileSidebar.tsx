import { motion, AnimatePresence } from "motion/react";
import { Shield, LogOut, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/lib/i18n";
import type { MobileSidebarProps } from "./types";

/**
 * Mobile Sidebar Component
 * Slide-in sidebar for mobile view
 */
export function MobileSidebar({ menuItems, activeTab, userData, isOpen, onTabChange, onClose, onLogout }: MobileSidebarProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden overflow-y-auto"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-6 bg-accent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white !text-[17px]">Admin</h1>
                  <p className="text-white/80 !text-[13px] !font-normal">{t('admin_panel', 'Панель управления')}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] transition-all !text-[15px] relative
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
                        className="absolute inset-0 bg-accent/20 rounded-[var(--radius)]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted rounded-[var(--radius)]">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shrink-0">
                  {userData?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="!text-[14px] text-foreground truncate">{userData?.email}</p>
                  <p className="!text-[12px] text-muted-foreground !font-normal">Супер-админ</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 !text-[15px]"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                Выход
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

