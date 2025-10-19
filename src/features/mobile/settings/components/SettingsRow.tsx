import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/components/ui/utils';

interface SettingsRowProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: 'chevron' | 'switch' | 'custom' | 'none';
  switchChecked?: boolean;
  onSwitchChange?: (checked: boolean) => void;
  customRightElement?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  iconColor = 'text-[var(--ios-blue)]',
  iconBgColor = 'bg-[var(--ios-blue)]/10',
  title,
  description,
  onClick,
  rightElement = 'chevron',
  switchChecked = false,
  onSwitchChange,
  customRightElement,
  className,
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // For switch rows, toggle the switch when clicking anywhere on the row
    if (rightElement === 'switch' && onSwitchChange && !disabled) {
      // Don't toggle if clicking directly on the switch itself (it handles its own state)
      if (!(e.target as HTMLElement).closest('[role="switch"]')) {
        onSwitchChange(!switchChecked);
        return;
      }
    }
    // Allow onClick even when disabled (for premium modal trigger)
    if (onClick) {
      onClick();
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    if (!disabled && onSwitchChange) {
      onSwitchChange(checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center justify-between p-row transition-colors',
        // iOS HIG: minimum 44px touch target
        'min-h-[44px]',
        // Make entire row clickable for switch
        rightElement === 'switch' && !disabled && 'cursor-pointer hover:bg-muted active:bg-accent/10',
        // Regular onClick behavior
        !disabled && onClick && rightElement !== 'switch' && 'cursor-pointer hover:bg-muted active:bg-accent/10',
        disabled && onClick && 'cursor-pointer hover:bg-muted active:bg-accent/10',
        className
      )}
    >
      <div className="flex items-center gap-responsive-md flex-1 min-w-0">
        {/* Icon */}
        <div className={cn('p-2.5 rounded-xl shrink-0', iconBgColor)}>
          <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-headline text-foreground leading-tight">
            {title}
          </h4>
          {description && (
            <p className="text-footnote text-muted-foreground mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right Element */}
      <div className="shrink-0 ml-3">
        {rightElement === 'chevron' && (
          <ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
        )}
        {rightElement === 'switch' && (
          <Switch
            checked={switchChecked}
            onCheckedChange={handleSwitchChange}
            disabled={disabled}
          />
        )}
        {rightElement === 'custom' && customRightElement}
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={cn('px-4 pt-6 pb-2', className)}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
        {title}
      </h3>
      <div className="bg-card rounded-2xl shadow-sm border-0 overflow-hidden divide-y divide-border transition-colors duration-300">
        {children}
      </div>
    </div>
  );
};

