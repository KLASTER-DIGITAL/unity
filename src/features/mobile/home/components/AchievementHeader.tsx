import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "@/imports/svg-wgvq4zqu0u";
import {
  BookOpen,
  Settings
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";

interface AchievementHeaderProps {
  userName?: string;
  daysInApp?: number;
  userEmail?: string;
  avatarUrl?: string;
  onNavigateToSettings?: () => void;
  onNavigateToHistory?: () => void;
}

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';

// Компонент аватарки с пульсацией онлайн-статуса
function UserAvatar({ userName, userEmail, avatarUrl, onClick }: { userName?: string; userEmail?: string; avatarUrl?: string; onClick?: () => void }) {
  // Используем дефолтное фото если нет аватара
  const displayAvatarUrl = avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Перейти в настройки профиля"
    >
      <Avatar className="h-[46px] w-[46px] ring-1 ring-border">
        <AvatarImage src={displayAvatarUrl} alt={userName} className="object-cover" />
        <AvatarFallback className="bg-muted">
          <img src={DEFAULT_AVATAR_URL} alt="Default avatar" className="h-full w-full object-cover" />
        </AvatarFallback>
      </Avatar>

      {/* Пульсирующий зеленый индикатор онлайн-статуса - пульсация от края */}
      <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 z-10">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
      </span>
    </div>
  );
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
              stroke="var(--icon-primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              clipRule="evenodd"
              d={svgPaths.p2ab2d180}
              fillRule="evenodd"
              stroke="var(--icon-primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              clipRule="evenodd"
              d={svgPaths.p2d147e00}
              fillRule="evenodd"
              stroke="var(--icon-primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              clipRule="evenodd"
              d={svgPaths.p3a3f5900}
              fillRule="evenodd"
              stroke="var(--icon-primary)"
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
function QuickActionsMenu({
  isOpen,
  onClose,
  onNavigateToHistory,
  onNavigateToSettings
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
}) {
  const quickActions = [
    {
      icon: BookOpen,
      label: "История записей",
      color: "bg-[var(--action-history)]",
      action: () => {
        onNavigateToHistory?.();
        onClose();
      }
    },
    {
      icon: Settings,
      label: "Настройки",
      color: "bg-[var(--action-settings)]",
      action: () => {
        onNavigateToSettings?.();
        onClose();
      }
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
            className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
          />
          
          {/* Menu - без заголовка "Быстрые действия" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal bg-card rounded-[24px] shadow-2xl p-modal w-[280px] border border-border transition-colors duration-300"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={action.action}
                  className="w-full flex items-center gap-responsive-sm p-row rounded-[12px] hover:bg-muted transition-colors active:scale-95"
                >
                  <div className={`${action.color} w-10 h-10 rounded-[10px] flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-subhead text-foreground">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AchievementHeader({
  userName = "Пользователь",
  daysInApp = 1,
  userEmail,
  avatarUrl,
  onNavigateToSettings,
  onNavigateToHistory
}: AchievementHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="relative p-section bg-background transition-colors duration-300">
        {/* Top Bar - аватарка, приветствие и счетчик дней */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar with online pulse - клик переходит в настройки */}
            <UserAvatar
              userName={userName}
              userEmail={userEmail}
              avatarUrl={avatarUrl}
              onClick={onNavigateToSettings}
            />

            {/* Greeting - адаптивный размер шрифта для узких экранов (340px Telegram) */}
            <div className="flex-1 min-w-0">
              {/* Приветствие - увеличено на 2px (20-26px вместо 18-24px) */}
              <h1 className="!font-semibold text-foreground tracking-[-0.5px] leading-[1.2] flex items-center gap-1">
                <span className="text-[clamp(20px,5.5vw,26px)] flex-shrink-0">🙌</span>
                <span className="!text-[clamp(20px,5.5vw,26px)] whitespace-nowrap">Привет {userName.charAt(0).toUpperCase() + userName.slice(1)},</span>
              </h1>
              {/* Вопрос - увеличен до 15px для читаемости */}
              <p className="text-muted-foreground !text-[15px] !leading-[1.3] mt-0.5 whitespace-nowrap">
                Какие твои победы сегодня?
              </p>
            </div>
          </div>

          {/* Right: Days Counter - оптимальный размер кружка (130x130px) */}
          <div className="relative w-[130px] h-[130px] flex-shrink-0 flex items-center justify-center">
            {/* Кружок с обводкой - видна на обоих режимах */}
            <svg className="absolute w-[130px] h-[130px]" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 130 130">
              {/* Обводка для светлого режима - темная */}
              <circle cx="65" cy="65" r="60" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" className="dark:hidden block" />
              {/* Обводка для темного режима - белая с прозрачностью 80% */}
              <circle cx="65" cy="65" r="60" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" className="dark:block hidden" />
            </svg>

            {/* Текст внутри кружка - центрирован с минимальным отступом */}
            <div className="relative flex flex-col items-center justify-center gap-0">
              <p className="!text-[44px] !font-semibold text-[var(--ios-green)] leading-[1]">
                {daysInApp}
              </p>
              <p className="!text-[10px] text-muted-foreground leading-[1]">
                День
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAB кнопка скрыта по запросу пользователя */}
      {/* <motion.button
        onClick={() => setShowMenu(true)}
        className="fixed bottom-28 right-6 z-50 w-14 h-14 backdrop-blur-md bg-black/30 dark:bg-white/10 border border-white/20 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="h-6 w-6 text-white" strokeWidth={2.5} />
      </motion.button>

      <QuickActionsMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToSettings={onNavigateToSettings}
      /> */}
    </>
  );
}
