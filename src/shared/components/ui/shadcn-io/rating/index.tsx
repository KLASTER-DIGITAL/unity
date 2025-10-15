import React from 'react';
import { cn } from '../../utils';

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  className
}) => {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          className={cn(
            'text-2xl transition-colors',
            star <= value
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-gray-300 hover:text-yellow-400'
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
};
