import { motion } from 'motion/react';

/**
 * Background Elements Component
 * Animated decorative background elements
 */
export function BackgroundElements() {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.6, 0.3],
        }}
        className="absolute top-10 left-10 h-20 w-20 rounded-full bg-linear-to-br from-[#756ef3]/10 to-[#756ef3]/5"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 10, 0],
          y: [0, -5, 0],
        }}
        className="absolute top-32 right-16 h-12 w-12 rounded-full bg-linear-to-br from-[#8B78FF]/20 to-[#5451D6]/10"
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.2, 0.8, 0.2],
        }}
        className="absolute bottom-24 left-20 h-6 w-6 rounded-full bg-linear-to-br from-[#756ef3]/15 to-transparent"
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
