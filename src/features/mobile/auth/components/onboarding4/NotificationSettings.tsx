import { motion } from "motion/react";
import { Bell } from "lucide-react";
import { NotificationOption } from "./NotificationOption";

interface NotificationSettingsProps {
  selectedTime: 'none' | 'morning' | 'evening' | 'both';
  morningTime: string;
  eveningTime: string;
  reminderTitle: string;
  morningLabel: string;
  eveningLabel: string;
  bothLabel: string;
  onSelect: (type: 'none' | 'morning' | 'evening' | 'both') => void;
  onTimeClick: (type: 'morning' | 'evening') => void;
}

/**
 * Notification Settings Component
 * Section for configuring notification reminders
 */
export function NotificationSettings({
  selectedTime,
  morningTime,
  eveningTime,
  reminderTitle,
  morningLabel,
  eveningLabel,
  bothLabel,
  onSelect,
  onTimeClick
}: NotificationSettingsProps) {
  return (
    <motion.div
      className="bg-[#756ef3]/10 rounded-xl p-4 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
        <Bell className="w-4 h-4 text-[#756ef3]" />
        <h3 className="!text-[#756ef3] text-[14px]! font-semibold!">{reminderTitle}</h3>
      </div>

      <div className="space-y-2">
        <NotificationOption
          type="morning"
          label={morningLabel}
          isSelected={selectedTime === 'morning'}
          morningTime={morningTime}
          eveningTime={eveningTime}
          onSelect={() => onSelect('morning')}
          onTimeClick={onTimeClick}
        />

        <NotificationOption
          type="evening"
          label={eveningLabel}
          isSelected={selectedTime === 'evening'}
          morningTime={morningTime}
          eveningTime={eveningTime}
          onSelect={() => onSelect('evening')}
          onTimeClick={onTimeClick}
        />

        <NotificationOption
          type="both"
          label={bothLabel}
          isSelected={selectedTime === 'both'}
          morningTime={morningTime}
          eveningTime={eveningTime}
          onSelect={() => onSelect('both')}
        />
      </div>
    </motion.div>
  );
}

