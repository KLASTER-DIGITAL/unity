import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  initialTime: string;
  title: string;
}

export function TimePickerModal({ isOpen, onClose, onTimeSelect, initialTime, title }: TimePickerModalProps) {
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

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 pb-24 scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl w-full max-w-sm"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="!text-[17px] !font-semibold !text-[#002055]">{title}</h3>
          <button
            onClick={handleConfirm}
            className="!text-[17px] !font-semibold !text-[#756ef3] px-2 py-1"
          >
            Готово
          </button>
        </div>

        {/* Time Picker */}
        <div className="p-6">
          {/* Simple time inputs */}
          <div className="space-y-4">
            <div>
              <label className="!text-[13px] !text-gray-600 block mb-2">Время</label>
              <div className="flex items-center justify-center space-x-3">
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  className="w-20 h-12 border-2 border-gray-200 rounded-lg text-center !text-[16px] !font-medium focus:border-[#756ef3] outline-none"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                
                <span className="!text-[20px] !font-bold !text-gray-400">:</span>
                
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
                  className="w-20 h-12 border-2 border-gray-200 rounded-lg text-center !text-[16px] !font-medium focus:border-[#756ef3] outline-none"
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
            <div className="text-center">
              <p className="!text-[13px] !text-gray-600 mb-1">Выбранное время:</p>
              <p className="!text-[24px] !font-bold !text-[#756ef3]">
                {formatTime(selectedHour, selectedMinute)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}