import { LottiePreloader } from './LottiePreloader';

type LoadingScreenProps = {
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
};

export function LoadingScreen({
  message: _message = 'Загрузка...',
  minDuration = 5000,
  onMinDurationComplete,
}: LoadingScreenProps) {
  return (
    <LottiePreloader
      minDuration={minDuration}
      onMinDurationComplete={onMinDurationComplete}
      showMessage={false}
      size="lg"
    />
  );
}

export default LoadingScreen;
