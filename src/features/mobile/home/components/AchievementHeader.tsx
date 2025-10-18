import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "@/imports/svg-wgvq4zqu0u";
import {
  Plus,
  Mic,
  Camera,
  Sparkles,
  BookOpen,
  Settings
} from "lucide-react";

interface AchievementHeaderProps {
  userName?: string;
  daysInApp?: number;
}

// Компонент иконки категории (4 квадратика)
function CategoryIcon() {
  return (
    <div className="absolute inset-[12.5%]">
      <div className="absolute inset-[-5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g>
            <path 
              clipRule="evenodd" 
              d={svgPaths.p30955100} 
              fillRule="evenodd" 
              stroke="#002055" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
            />
            <path 
              clipRule="evenodd" 
              d={svgPaths.p2ab2d180} 
              fillRule="evenodd" 
              stroke="#002055" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
            />
            <path 
              clipRule="evenodd" 
              d={svgPaths.p2d147e00} 
              fillRule="evenodd" 
              stroke="#002055" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
            />
            <path 
              clipRule="evenodd" 
              d={svgPaths.p3a3f5900} 
              fillRule="evenodd" 
              stroke="#002055" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

// Модальное окно быстрых действий
function QuickActionsMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const quickActions = [
    {
      icon: Plus,
      label: "Новая запись",
      color: "bg-blue-500",
      action: () => console.log("Новая запись")
    },
    {
      icon: Mic,
      label: "Голосовая запись",
      color: "bg-purple-500",
      action: () => console.log("Голосовая запись")
    },
    {
      icon: Camera,
      label: "Фото достижение",
      color: "bg-green-500",
      action: () => console.log("Фото")
    },
    {
      icon: Sparkles,
      label: "AI подсказка",
      color: "bg-orange-500",
      action: () => console.log("AI подсказка")
    },
    {
      icon: BookOpen,
      label: "История записей",
      color: "bg-pink-500",
      action: () => console.log("История")
    },
    {
      icon: Settings,
      label: "Настройки",
      color: "bg-gray-500",
      action: () => console.log("Настройки")
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-[24px] shadow-2xl p-4 w-[280px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div className="mb-3">
              <h3 className="!text-[17px] !font-semibold text-[#202224]">Быстрые действия</h3>
            </div>
            
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <div className={`${action.color} w-10 h-10 rounded-[10px] flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="!text-[15px] !font-normal text-[#202224]">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AchievementHeader({ userName = "Пользователь", daysInApp = 1 }: AchievementHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Получаем текущую дату
  const currentDate = new Date();
  const dayOfWeek = new Intl.DateTimeFormat('ru', { weekday: 'long' }).format(currentDate);
  const dayOfMonth = currentDate.getDate();
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return (
    <>
      <div className="relative pt-6 pb-5 px-6 bg-white">
        {/* Top Bar - день недели и кнопка меню */}
        <div className="flex items-center justify-between mb-5">
          {/* Menu Button */}
          <button 
            onClick={() => setShowMenu(true)}
            className="relative w-[42px] h-[42px] active:scale-95 transition-transform"
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
              <circle cx="21" cy="21" fill="white" r="20.5" stroke="#E9F1FF" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[17px] h-[17px] relative">
                <CategoryIcon />
              </div>
            </div>
          </button>

          {/* Day of week */}
          <p className="!text-[18px] !font-medium text-[#002055]">
            {capitalizedDay}, {dayOfMonth}
          </p>

          {/* Days Counter - уменьшенный */}
          <div className="relative w-[72px] h-[72px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="35.5" stroke="#AFAFAF" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="!text-[24px] !font-semibold text-[#b1d199] leading-[1]">
                {daysInApp}
              </p>
              <p className="!text-[9px] !font-medium text-black mt-0.5">
                День
              </p>
            </div>
          </div>
        </div>

        {/* Greeting - компактное */}
        <div>
          <h1 className="!text-[24px] !font-semibold text-[#202224] tracking-[-0.5px] leading-[1.15]">
            🙌 <span className="!text-[24px]">Привет {userName.charAt(0).toUpperCase() + userName.slice(1)},</span>{" "}
            <span className="text-[#797981] !text-[24px] block !leading-[1.3] mt-0.5">
              Какие твои победы сегодня?
            </span>
          </h1>
        </div>
      </div>

      {/* Quick Actions Menu */}
      <QuickActionsMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
