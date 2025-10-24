import { motion } from "motion/react";
import { Clock } from "lucide-react";

interface NotificationOptionProps {
  type: 'morning' | 'evening' | 'both';
  label: string;
  isSelected: boolean;
  morningTime: string;
  eveningTime: string;
  onSelect: () => void;
  onTimeClick?: (type: 'morning' | 'evening') => void;
}

/**
 * Notification Option Component
 * Single notification time option (morning, evening, or both)
 */
export function NotificationOption({
  type,
  label,
  isSelected,
  morningTime,
  eveningTime,
  onSelect,
  onTimeClick
}: NotificationOptionProps) {
  const renderTimeDisplay = () => {
    if (type === 'both') {
      return (
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-[#756ef3]" />
          <span className="!text-[#756ef3] !text-[13px] !font-medium">
            ({morningTime} & {eveningTime})
          </span>
        </div>
      );
    }

    const time = type === 'morning' ? morningTime : eveningTime;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onTimeClick?.(type);
        }}
        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
      >
        <Clock className="w-3 h-3 text-[#756ef3]" />
        <span className="!text-[#756ef3] !text-[13px] !font-medium">({time})</span>
      </div>
    );
  };

  return (
    <motion.button
      onClick={onSelect}
      className={`flex items-center justify-between bg-card rounded-lg p-3 w-full transition-all duration-200 ${
        isSelected ? 'ring-2 ring-[#756ef3] bg-[#756ef3]/5' : 'hover:bg-muted'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-[#756ef3] bg-[#756ef3]' : 'border-border'
        }`}>
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-card" />
          )}
        </div>
        <span className="!text-[#002055] dark:!text-[#1a1a1a] !text-[13px] !font-medium">{label}</span>
      </div>
      {renderTimeDisplay()}
    </motion.button>
  );
}

