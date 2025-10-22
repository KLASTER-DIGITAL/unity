/**
 * Confetti Component for Success Celebrations
 * 
 * Displays confetti animation when success events occur
 * Uses canvas-confetti library for smooth performance
 * 
 * @author UNITY Team
 * @date 2025-10-22
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  /**
   * Trigger confetti animation
   */
  trigger?: boolean;
  
  /**
   * Duration of confetti animation in milliseconds
   * @default 3000
   */
  duration?: number;
  
  /**
   * Number of confetti pieces
   * @default 100
   */
  particleCount?: number;
  
  /**
   * Spread angle in degrees
   * @default 90
   */
  spread?: number;
  
  /**
   * Origin position (0-1 for x and y)
   * @default { x: 0.5, y: 0.5 }
   */
  origin?: { x: number; y: number };
  
  /**
   * Confetti colors
   * @default ['#8B78FF', '#5451D6', '#756ef3', '#00d4ff', '#00ff88']
   */
  colors?: string[];
}

/**
 * Confetti component that triggers celebration animation
 * 
 * Usage:
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 * 
 * return (
 *   <>
 *     <Confetti trigger={showConfetti} />
 *     <button onClick={() => setShowConfetti(true)}>Celebrate!</button>
 *   </>
 * );
 * ```
 */
export function Confetti({
  trigger = false,
  duration = 3000,
  particleCount = 100,
  spread = 90,
  origin = { x: 0.5, y: 0.5 },
  colors = ['#8B78FF', '#5451D6', '#756ef3', '#00d4ff', '#00ff88']
}: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    // Calculate end time
    const end = Date.now() + duration;

    // Recursive function to create continuous confetti
    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount,
        spread,
        origin,
        colors,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0,
        ticks: 200,
        zIndex: 9999
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, [trigger, duration, particleCount, spread, origin, colors]);

  return null;
}

/**
 * Hook to trigger confetti animation
 * 
 * Usage:
 * ```tsx
 * const triggerConfetti = useConfetti();
 * 
 * const handleSuccess = () => {
 *   triggerConfetti();
 * };
 * ```
 */
export function useConfetti() {
  return (options?: Partial<ConfettiProps>) => {
    const defaultOptions: ConfettiProps = {
      duration: 3000,
      particleCount: 100,
      spread: 90,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#8B78FF', '#5451D6', '#756ef3', '#00d4ff', '#00ff88'],
      ...options
    };

    const end = Date.now() + (defaultOptions.duration || 3000);

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: defaultOptions.particleCount || 100,
        spread: defaultOptions.spread || 90,
        origin: defaultOptions.origin || { x: 0.5, y: 0.5 },
        colors: defaultOptions.colors,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0,
        ticks: 200,
        zIndex: 9999
      });

      requestAnimationFrame(frame);
    };

    frame();
  };
}

