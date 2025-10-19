/**
 * Time Picker Modal - Refactored with BottomSheet
 *
 * Features:
 * - Uses universal BottomSheet component
 * - Slide-up animation from bottom
 * - Swipe-down to close
 * - iOS-style design
 * - Proper z-index hierarchy
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { useState } from "react";
import { BottomSheet, BottomSheetFooter } from "@/shared/components/ui/BottomSheet";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  initialTime: string;
  title: string;
}

export function TimePickerModal({
  isOpen,
  onClose,
  onTimeSelect,
  initialTime,
  title
}: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(parseInt(initialTime.split(':')[0]) || 8);
  const [selectedMinute, setSelectedMinute] = useState(parseInt(initialTime.split(':')[1]) || 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    onTimeSelect(formatTime(selectedHour, selectedMinute));
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      enableSwipeDown={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      maxHeight="60vh"
      footer={
        <BottomSheetFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          cancelText="Отмена"
          confirmText="Готово"
        />
      }
    >
      {/* Time Picker Content */}
      <div className="space-y-6">
        {/* Time Selectors */}
        <div>
          <label className="text-sm text-muted-foreground block mb-3">Выберите время</label>
          <div className="flex items-center justify-center space-x-4">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="w-24 h-14 border-2 border-border rounded-xl text-center text-lg font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background text-foreground transition-all"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}
                </option>
              ))}
            </select>

            <span className="text-2xl font-bold text-muted-foreground">:</span>

            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
              className="w-24 h-14 border-2 border-border rounded-xl text-center text-lg font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background text-foreground transition-all"
            >
              {minutes.filter(m => m % 5 === 0).map((minute) => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="text-center p-4 bg-muted/30 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Выбранное время</p>
          <p className="text-3xl font-bold text-primary">
            {formatTime(selectedHour, selectedMinute)}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}