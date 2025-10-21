import React from 'react';
import { LottiePreloaderInline, LottiePreloaderCompact } from '@/shared/components/LottiePreloader';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  // Если есть текст, используем компактный вариант
  if (text) {
    return (
      <div className={className}>
        <LottiePreloaderCompact message={text} size={size} />
      </div>
    );
  }

  // Если нет текста, используем inline вариант
  return (
    <div className={className}>
      <LottiePreloaderInline size={size} />
    </div>
  );
};

export default LoadingIndicator;