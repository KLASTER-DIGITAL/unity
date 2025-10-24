import { memo } from "react";
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

// Компонент аватарки с пульсацией онлайн-статуса - memoized
const UserAvatar = memo(function UserAvatar({ userName, avatarUrl, onClick }: { userName?: string; userEmail?: string; avatarUrl?: string; onClick?: () => void }) {
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
});

export const AchievementHeader = memo(function AchievementHeader({
  userName = "Пользователь",
  daysInApp = 1,
  avatarUrl,
  onNavigateToSettings
}: AchievementHeaderProps) {

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
});
