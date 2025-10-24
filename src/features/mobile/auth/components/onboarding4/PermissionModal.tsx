import { motion } from "motion/react";
import { Bell } from "lucide-react";

interface PermissionModalProps {
  isOpen: boolean;
  title: string;
  laterLabel: string;
  allowLabel: string;
  onAllow: () => void;
  onLater: () => void;
}

/**
 * Permission Modal Component
 * Modal for requesting notification permissions
 */
export function PermissionModal({
  isOpen,
  title,
  laterLabel,
  allowLabel,
  onAllow,
  onLater
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onLater}
    >
      <motion.div
        className="bg-card rounded-[var(--radius)] p-6 w-full max-w-[300px] shadow-lg border border-border transition-colors duration-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-3 mb-6">
          <Bell className="w-12 h-12 text-[#756ef3] mx-auto" />
          <h3 className="!text-[17px] !font-semibold !text-[#002055] dark:!text-[#1a1a1a]">{title}</h3>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onLater}
            className="flex-1 py-3 px-4 rounded-[var(--radius)] bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 active:scale-95"
          >
            {laterLabel}
          </button>
          <button
            onClick={onAllow}
            className="flex-1 py-3 px-4 rounded-[var(--radius)] bg-[#756ef3] text-white hover:bg-[#6b62e8] transition-all duration-200 active:scale-95"
          >
            {allowLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

