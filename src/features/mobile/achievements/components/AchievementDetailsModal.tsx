import confetti from 'canvas-confetti';
import { AnimatePresence, motion, useSpring } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Share2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { RARITY_STYLES, type RarityType } from '../constants/rarityStyles';

interface AchievementDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	achievement: {
		name: string;
		description: string;
		icon: ComponentType<{ className?: string }> | null;
		rarity: RarityType;
		progress: number;
		earned: boolean;
		earnedDate?: string;
	} | null;
}

const EARNED_MOTIVATION_MESSAGES = {
	streak:
		'Вы удерживаете ритм — это важнее, чем идеальные дни. Продолжайте идти маленькими шагами.',
	entries:
		'Каждая запись — это честный разговор с собой. Вы уже делаете больше, чем большинство людей.',
	default:
		'Это достижение — доказательство того, что вы не просто мечтаете, а действуете. Продолжайте в том же духе.',
} as const;

function getMotivationMessageForAchievement(name: string): string {
	const lowerName = name.toLowerCase();

	if (
		lowerName.includes('дней подряд') ||
		lowerName.includes('неделя') ||
		lowerName.includes('подряд')
	) {
		return EARNED_MOTIVATION_MESSAGES.streak;
	}

	if (lowerName.includes('записей') || lowerName.includes('запись') || lowerName.includes('слов')) {
		return EARNED_MOTIVATION_MESSAGES.entries;
	}

	return EARNED_MOTIVATION_MESSAGES.default;
}

export function AchievementDetailsModal({
	isOpen,
	onClose,
	achievement,
}: AchievementDetailsModalProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isSharing, setIsSharing] = useState(false);

	// ✅ NEW: Animated progress bar
	const progressSpring = useSpring(0, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	// ✅ NEW: Animate progress when modal opens
	useEffect(() => {
		if (isOpen && achievement && !achievement.earned) {
			progressSpring.set(achievement.progress);
		}
	}, [isOpen, achievement, progressSpring]);

	// ✅ NEW: Confetti effect when opening modal for earned achievements
	useEffect(() => {
		if (isOpen && achievement?.earned) {
			// Check if user prefers reduced motion
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!prefersReducedMotion) {
				// Launch confetti with celebration effect
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
					colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
				});

				// Additional burst after a short delay
				setTimeout(() => {
					confetti({
						particleCount: 50,
						angle: 60,
						spread: 55,
						origin: { x: 0 },
						colors: ['#FFD700', '#FFA500', '#FF6347'],
					});
					confetti({
						particleCount: 50,
						angle: 120,
						spread: 55,
						origin: { x: 1 },
						colors: ['#00CED1', '#9370DB', '#FF6347'],
					});
				}, 300);
			}
		}
	}, [isOpen, achievement?.earned]);

	if (!achievement) return null;

	const Icon = achievement.icon;
	const rarityStyle = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;

	const handleShare = async () => {
		if (!cardRef.current) return;

		try {
			setIsSharing(true);

			// Генерируем красивый скриншот карточки достижения
			const dataUrl = await toPng(cardRef.current, {
				quality: 0.95,
				pixelRatio: 2,
			});

			// Конвертируем в blob
			const response = await fetch(dataUrl);
			const blob = await response.blob();
			const file = new File([blob], 'achievement.png', { type: 'image/png' });

			const text = `🏆 Я получил достижение "${achievement.name}" в UNITY!\n\n${achievement.description}`;

			// Пробуем Web Share API с изображением
			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: 'UNITY Achievement',
					text,
					files: [file],
				});
				toast.success('Достижение успешно отправлено!');
			} else if (navigator.share) {
				// Fallback: только текст
				await navigator.share({
					title: 'UNITY Achievement',
					text,
				});
				toast.success('Текст скопирован!');
			} else {
				// Fallback: скачать изображение
				const link = document.createElement('a');
				link.download = `achievement-${achievement.name}.png`;
				link.href = dataUrl;
				link.click();
				toast.success('Изображение скачано!');
			}
		} catch (err) {
			console.error('Share error:', err);
			if (err instanceof Error && err.name !== 'AbortError') {
				toast.error('Не удалось поделиться достижением');
			}
		} finally {
			setIsSharing(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={onClose}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						ref={cardRef}
						animate={{ scale: 1, opacity: 1 }}
						className="relative mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
						exit={{ scale: 0.9, opacity: 0 }}
						initial={{ scale: 0.9, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						transition={{ duration: 0.2, ease: 'easeOut' }}
					>
						{/* Close Button - красивый крестик в углу */}
						<button
							type="button"
							className="absolute top-4 right-4 rounded-full p-1 transition-colors duration-200 hover:bg-muted"
							onClick={onClose}
						>
							<X className="h-5 w-5 text-muted-foreground" />
						</button>

						<div className="space-y-4">
							{/* Large Badge Preview */}
							<div className="flex justify-center">
								<motion.div
									className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 sm:h-24 sm:w-24 ${
										achievement.earned ? rarityStyle.gradient : 'bg-muted border-2 border-border'
									} ${achievement.earned ? rarityStyle.glow : ''}`}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', stiffness: 260, damping: 20 }}
								>
									{Icon && (
										<Icon
											className={`h-10 w-10 transition-colors duration-300 sm:h-12 sm:w-12 ${achievement.earned ? 'text-white' : 'text-foreground'}`}
										/>
									)}
								</motion.div>
							</div>

							{/* Achievement Info */}
							<div className="space-y-2 text-center">
								<div>
									<h2 className="mb-2 font-bold text-foreground text-lg transition-colors duration-300 sm:text-2xl">
										{achievement.name}
									</h2>
									{achievement.earned ? (
										<>
											<p className="mb-2 font-semibold text-primary text-base transition-colors duration-300 sm:text-lg">
												🎉 Поздравляем! Вы сделали это!
											</p>
											<p className="text-muted-foreground text-xs italic transition-colors duration-300">
												Продолжайте в том же духе! Каждое достижение — это шаг к вашей цели.
											</p>
										</>
									) : (
										<p className="text-muted-foreground text-sm transition-colors duration-300">
											{achievement.description}
										</p>
									)}
								</div>

								{/* Rarity Badge */}
								<div className="flex justify-center">
									<Badge className={`text-xs transition-colors duration-300 ${rarityStyle.badge}`}>
										{achievement.rarity === 'legendary'
											? '🌟 Легендарное'
											: achievement.rarity === 'epic'
												? '⚡ Эпическое'
												: achievement.rarity === 'rare'
													? '💎 Редкое'
													: '⭐ Обычное'}
									</Badge>
								</div>

								{/* Progress or Earned Date */}
								{achievement.earned ? (
									<div className="space-y-1">
										<p className="font-semibold text-foreground text-xs transition-colors duration-300 sm:text-sm">
											✅ Получено
										</p>
										<p className="text-muted-foreground text-xs transition-colors duration-300 sm:text-sm">
											{achievement.earnedDate}
										</p>
										<p className="text-muted-foreground text-xs transition-colors duration-300 sm:text-sm">
											{getMotivationMessageForAchievement(achievement.name)}
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<div className="h-2 w-full rounded-full bg-muted transition-colors duration-300">
											<motion.div
												className="h-2 rounded-full bg-primary"
												style={{ width: progressSpring }}
												initial={{ width: 0 }}
												animate={{ width: `${achievement.progress}%` }}
												transition={{ duration: 1, ease: 'easeOut' }}
											/>
										</div>
										<p className="text-muted-foreground text-xs transition-colors duration-300 sm:text-sm">
											Прогресс: {achievement.progress}%
										</p>
									</div>
								)}
							</div>

							{/* Share Button */}
							{achievement.earned && (
								<Button
									onClick={handleShare}
									className="w-full text-sm"
									variant="outline"
									size="sm"
									disabled={isSharing}
								>
									<Share2 className="mr-2 h-3 w-3" />
									{isSharing ? 'Подготовка...' : 'Поделиться'}
								</Button>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
