import { memo } from "react";
import { NetworkStatusIndicator } from "@/shared/components/offline/NetworkStatusIndicator";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Pressable } from "@/shared/components/ui/universal";

type AchievementHeaderProps = {
	userName?: string;
	daysInApp?: number;
	userEmail?: string;
	avatarUrl?: string;
	onNavigateToSettings?: () => void;
	onNavigateToHistory?: () => void;
};

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL =
	"https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png";

// Компонент аватарки с пульсацией онлайн-статуса - memoized
const UserAvatar = memo(function UserAvatar({
	userName,
	avatarUrl,
	onClick,
}: {
	userName?: string;
	userEmail?: string;
	avatarUrl?: string;
	onClick?: () => void;
}) {
	// Используем дефолтное фото если нет аватара
	const displayAvatarUrl = avatarUrl || DEFAULT_AVATAR_URL;

	return (
		<Pressable
			aria-label="Перейти в настройки профиля"
			className="relative shrink-0"
			onPress={onClick}
			pressScale={0.95}
		>
			<Avatar className="h-[46px] w-[46px] ring-1 ring-border">
				<AvatarImage
					alt={userName}
					className="object-cover"
					src={displayAvatarUrl}
				/>
				<AvatarFallback className="bg-muted">
					<img
						alt="Default avatar"
						className="h-full w-full object-cover"
						src={DEFAULT_AVATAR_URL}
					/>
				</AvatarFallback>
			</Avatar>

			{/* Dynamic network status indicator (🟢🟡🔴) */}
			<NetworkStatusIndicator />
		</Pressable>
	);
});

export const AchievementHeader = memo(function AchievementHeader({
	userName = "Пользователь",
	daysInApp = 1,
	avatarUrl,
	onNavigateToSettings,
}: AchievementHeaderProps) {
	return (
		<>
			<div className="relative bg-background p-section transition-colors duration-300">
				{/* Top Bar - аватарка, приветствие и счетчик дней */}
				<div className="flex items-center justify-between gap-3">
					{/* Left: Avatar + Greeting */}
					<div className="flex min-w-0 flex-1 items-center gap-4">
						{/* Avatar with online pulse - клик переходит в настройки */}
						<UserAvatar
							avatarUrl={avatarUrl}
							onClick={onNavigateToSettings}
							userName={userName}
						/>

						{/* Greeting - адаптивный размер шрифта для узких экранов (340px Telegram) */}
						<div className="min-w-0 flex-1">
							{/* Приветствие - увеличено на 2px (20-26px вместо 18-24px) */}
							<h1 className="flex items-center gap-1 font-semibold! text-foreground leading-[1.2] tracking-[-0.5px]">
								<span className="shrink-0 text-[clamp(20px,5.5vw,26px)]">
									🙌
								</span>
								<span className="whitespace-nowrap text-[clamp(20px,5.5vw,26px)]!">
									Привет {userName.charAt(0).toUpperCase() + userName.slice(1)},
								</span>
							</h1>
							{/* Вопрос - увеличен до 15px для читаемости */}
							<p className="mt-0.5 whitespace-nowrap text-[15px]! text-muted-foreground leading-[1.3]!">
								Какие твои победы сегодня?
							</p>
						</div>
					</div>

					{/* Right: Days Counter - оптимальный размер кружка (130x130px) */}
					<div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
						{/* Кружок с обводкой - видна на обоих режимах */}
						<svg
							className="absolute h-[130px] w-[130px]"
							fill="none"
							preserveAspectRatio="xMidYMid meet"
							viewBox="0 0 130 130"
						>
							{/* Обводка для светлого режима - темная */}
							<circle
								className="block dark:hidden"
								cx="65"
								cy="65"
								fill="none"
								r="60"
								stroke="rgba(0,0,0,0.3)"
								strokeWidth="2"
							/>
							{/* Обводка для темного режима - белая с прозрачностью 80% */}
							<circle
								className="hidden dark:block"
								cx="65"
								cy="65"
								fill="none"
								r="60"
								stroke="rgba(255,255,255,0.8)"
								strokeWidth="2"
							/>
						</svg>

						{/* Текст внутри кружка - центрирован с минимальным отступом */}
						<div className="relative flex flex-col items-center justify-center gap-0">
							<p className="font-semibold! text-(--ios-green) text-[44px]! leading-none">
								{daysInApp}
							</p>
							<p className="text-[10px]! text-muted-foreground leading-none">
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
