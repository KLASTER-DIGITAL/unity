import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Confetti } from "@/shared/components/Confetti";

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
}

/**
 * Success Modal Component
 * Modal showing success message with confetti animation
 */
export function SuccessModal({ isOpen, message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <Confetti trigger={isOpen} duration={2000} particleCount={80} />
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pb-24 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-card rounded-xl p-6 space-y-4 w-[300px] mx-4 text-center border border-border transition-colors duration-300"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          </motion.div>
          <p className="text-[16px]! !text-[#002055] dark:!text-[#1a1a1a]">{message}</p>
        </motion.div>
      </motion.div>
    </>
  );
}

