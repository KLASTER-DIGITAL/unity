import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Heart } from "lucide-react";
import type { SwipeCardProps } from "./types";

/**
 * Swipe Card Component
 * Features:
 * - Drag and swipe gestures
 * - Stack visualization (up to 4 cards visible)
 * - Like overlay on right swipe
 * - Haptic feedback
 * - Smooth animations
 */
export function SwipeCard({ 
  card, 
  index, 
  totalCards, 
  onSwipe, 
  isTop
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Overlay для визуального feedback при свайпе (только лайк)
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);

  const cardRef = useRef<HTMLDivElement>(null);

  // Вычисляем положение карточек в стеке (улучшенная видимость)
  const getStackStyle = () => {
    switch(index) {
      case 0: // Верхняя карточка - полностью видна
        return {
          scale: 1,
          y: 0,
          rotate: 0,
          opacity: 1,
          blur: 0,
          zIndex: 40
        };
      case 1: // Вторая карточка - хорошо видна сзади
        return {
          scale: 0.96,
          y: -16,
          rotate: -3,
          opacity: 0.95,
          blur: 1,
          zIndex: 30
        };
      case 2: // Третья карточка - видна за второй
        return {
          scale: 0.92,
          y: -32,
          rotate: 3,
          opacity: 0.85,
          blur: 2,
          zIndex: 20
        };
      default: // Остальные карточки - слегка видны
        return {
          scale: 0.88,
          y: -48,
          rotate: 0,
          opacity: 0.7,
          blur: 3,
          zIndex: 10
        };
    }
  };

  const stackStyle = getStackStyle();

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Если свайп достаточно быстрый или далекий
    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      onSwipe(offset > 0 ? 'right' : 'left');
    } else {
      // Возвращаем карточку на место
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : stackStyle.y,
        rotate: isTop ? rotate : stackStyle.rotate,
        scale: isTop ? opacity.get() > 0.8 ? stackStyle.scale : useTransform(opacity, [0.5, 1], [0.9, stackStyle.scale]) : stackStyle.scale,
        zIndex: stackStyle.zIndex,
      }}
      initial={{ 
        scale: stackStyle.scale,
        y: stackStyle.y,
        rotate: stackStyle.rotate,
        opacity: stackStyle.opacity
      }}
      animate={{ 
        scale: stackStyle.scale,
        y: stackStyle.y,
        rotate: stackStyle.rotate,
        opacity: stackStyle.opacity,
        filter: `blur(${stackStyle.blur}px)`,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 30 : -30,
        transition: { duration: 0.3, ease: "easeIn" }
      }}
      className={`${index === 0 ? 'relative' : 'absolute'} w-full cursor-grab active:cursor-grabbing`}
      whileTap={{ cursor: "grabbing", scale: isTop ? 1.02 : stackStyle.scale }}
    >
      <div
        className={`bg-gradient-to-br ${card.gradient} rounded-[36px] overflow-hidden relative`}
        style={{
          boxShadow: index === 0 ? '0 20px 60px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
          backgroundColor: '#FE7669', // Непрозрачный фон под градиентом
        }}
      >
        {/* Like overlay - показывается при свайпе вправо */}
        {isTop && (
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-green-500/40 pointer-events-none z-10 flex items-center justify-center"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl rotate-12 border-4 border-white shadow-xl">
              <Heart className="w-12 h-12" fill="currentColor" />
            </div>
          </motion.div>
        )}

        {/* Основное содержимое карточки */}
        <div className="p-card relative z-0">
          {/* Date - ✅ FIX #3: Уменьшили отступ снизу */}
          <motion.div
            className="text-white/90 mb-3"
            animate={{ opacity: 0.9 }}
          >
            <p className="text-caption-1 text-white/90">{card.date}</p>
          </motion.div>

          {/* Title - ✅ FIX #3: Уменьшили размер заголовка */}
          <motion.div className="mb-3">
            <h3 className="text-title-2 text-white tracking-[-0.5px] leading-tight">
              {card.title}
            </h3>
          </motion.div>

          {/* Description */}
          <motion.div className="mb-0">
            <p className="text-callout text-white leading-[22px] opacity-95">
              {card.description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

