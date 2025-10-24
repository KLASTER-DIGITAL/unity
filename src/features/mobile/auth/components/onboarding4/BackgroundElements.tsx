import { motion } from "motion/react";

/**
 * Background Elements Component
 * Animated decorative background elements
 */
export function BackgroundElements() {
  return (
    <>
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#756ef3]/10 to-[#756ef3]/5"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute top-32 right-16 w-12 h-12 rounded-full bg-gradient-to-br from-[#8B78FF]/20 to-[#5451D6]/10"
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 10, 0],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-24 left-20 w-6 h-6 rounded-full bg-gradient-to-br from-[#756ef3]/15 to-transparent"
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.2, 0.8, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </>
  );
}

