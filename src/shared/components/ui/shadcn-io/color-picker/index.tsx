import type React from 'react';
import { cn } from '../../utils';

type ColorPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#3b82f6',
  onChange,
  className,
}) => (
  <input
    className={cn('h-10 w-10 cursor-pointer rounded border border-border', className)}
    onChange={(e) => onChange?.(e.target.value)}
    type="color"
    value={value}
  />
);
