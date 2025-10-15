import React from 'react';
import { cn } from '../../utils';

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#3b82f6',
  onChange,
  className
}) => {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        'w-10 h-10 rounded border border-gray-300 cursor-pointer',
        className
      )}
    />
  );
};
