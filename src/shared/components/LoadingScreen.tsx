import React from 'react';
import { LottiePreloader } from './LottiePreloader';

interface LoadingScreenProps {
  message?: string;
  /**
   * Минимальное время показа прелоадера в миллисекундах
   * @default 5000 (5 секунд)
   */
  minDuration?: number;
  /**
   * Callback когда минимальное время истекло
   */
  onMinDurationComplete?: () => void;
}

export function LoadingScreen({
  message = "Загрузка...",
  minDuration = 5000,
  onMinDurationComplete
}: LoadingScreenProps) {
  return (
    <LottiePreloader
      showMessage={false}
      minDuration={minDuration}
      onMinDurationComplete={onMinDurationComplete}
      size="lg"
    />
  );
}

export default LoadingScreen;
