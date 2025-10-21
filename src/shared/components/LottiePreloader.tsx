import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { useTheme } from '@/shared/components/theme-provider';

// Import Lottie animations
import blackAnimation from '@/components/preloader/Black.json';
import whiteAnimation from '@/components/preloader/White.json';

interface LottiePreloaderProps {
  /**
   * Текст сообщения под анимацией
   * @default "Загрузка..."
   */
  message?: string;
  
  /**
   * Минимальное время показа прелоадера в миллисекундах
   * @default 5000 (5 секунд)
   */
  minDuration?: number;
  
  /**
   * Показывать ли текст сообщения
   * @default true
   */
  showMessage?: boolean;
  
  /**
   * Размер анимации
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  
  /**
   * Callback когда минимальное время истекло
   */
  onMinDurationComplete?: () => void;
}

/**
 * Универсальный Lottie прелоадер с поддержкой тем
 * 
 * Автоматически переключается между черной и белой анимацией
 * в зависимости от текущей темы (light/dark)
 * 
 * @example
 * ```tsx
 * <LottiePreloader message="Загрузка данных..." minDuration={5000} />
 * ```
 */
export function LottiePreloader({
  message = "Загрузка...",
  minDuration = 5000,
  showMessage = true,
  size = 'md',
  className = '',
  onMinDurationComplete
}: LottiePreloaderProps) {
  const { theme } = useTheme();
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  
  // Определяем какую анимацию использовать в зависимости от темы
  // White.json - для светлой темы (светлая анимация на светлом фоне)
  // Black.json - для темной темы (темная анимация на темном фоне)
  const animationData = theme === 'dark' ? blackAnimation : whiteAnimation;
  
  // Размеры анимации
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };
  
  // Отслеживаем минимальное время показа
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDurationElapsed(true);
      onMinDurationComplete?.();
    }, minDuration);
    
    return () => clearTimeout(timer);
  }, [minDuration, onMinDurationComplete]);
  
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
      <div className="text-center">
        {/* Lottie Animation */}
        <div className={`${sizeClasses[size]} mx-auto mb-4`}>
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
          />
        </div>
        
        {/* Message */}
        {showMessage && (
          <p className="text-muted-foreground text-sm md:text-base">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Компактный вариант прелоадера для использования внутри компонентов
 * Поддерживает опциональный minDuration для страниц
 */
export function LottiePreloaderCompact({
  message = "Загрузка...",
  size = 'sm',
  showMessage = false,
  minDuration,
  onMinDurationComplete,
  className = ''
}: Omit<LottiePreloaderProps, 'minDuration' | 'onMinDurationComplete'> & {
  minDuration?: number;
  onMinDurationComplete?: () => void;
}) {
  const { theme } = useTheme();
  const animationData = theme === 'dark' ? blackAnimation : whiteAnimation;
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  // Если указан minDuration, запускаем таймер
  useEffect(() => {
    if (minDuration && minDuration > 0) {
      const timer = setTimeout(() => {
        setMinDurationElapsed(true);
        onMinDurationComplete?.();
      }, minDuration);

      return () => clearTimeout(timer);
    }
  }, [minDuration, onMinDurationComplete]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]}`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
      {showMessage && (
        <p className="text-muted-foreground text-xs md:text-sm">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Inline вариант прелоадера для использования в кнопках и других элементах
 */
export function LottiePreloaderInline({
  size = 'sm',
  className = ''
}: Pick<LottiePreloaderProps, 'size' | 'className'>) {
  const { theme } = useTheme();
  const animationData = theme === 'dark' ? whiteAnimation : blackAnimation;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}

export default LottiePreloader;

