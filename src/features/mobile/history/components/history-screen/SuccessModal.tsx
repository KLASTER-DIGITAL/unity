import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Confetti } from "@/shared/components/Confetti";

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
}

/**
 * Success Modal Component
 * Modal for success messages with confetti
 */
export function SuccessModal({ isOpen, message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        <Confetti trigger={isOpen} duration={2000} particleCount={80} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-modal bg-card p-8 rounded-[24px] max-w-[320px] w-[90%] mx-auto shadow-xl border border-border transition-colors duration-300"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--ios-green)]/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-[var(--ios-green)]" strokeWidth={2} />
            </div>

            <h3 className="!text-[20px] !font-semibold text-foreground">
              Успешно!
            </h3>

            <p className="!text-[15px] text-muted-foreground">
              {message}
            </p>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

