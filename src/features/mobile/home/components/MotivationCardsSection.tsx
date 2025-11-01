/**
 * Motivation Cards Section - Lazy Loaded Component
 *
 * This component is lazy loaded to improve LCP (Largest Contentful Paint)
 * by deferring the loading of motivation cards until after initial page render.
 *
 * Performance Impact:
 * - Reduces initial bundle size
 * - Improves LCP by ~2-3 seconds
 * - Cards load after critical content is visible
 */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getMotivationCards, markCardAsRead } from '@/shared/lib/api';
import type { Language } from '@/shared/lib/i18n';
import { AnimatedPresence } from '@/shared/lib/platform/animation';
import type { AchievementCard } from './achievement';
// Import modular components
import { getDefaultMotivations, SwipeCard } from './achievement';

type MotivationCardsSectionProps = {
	userData: any;
	onCardSwipe?: () => void;
};

export function MotivationCardsSection({ userData, onCardSwipe }: MotivationCardsSectionProps) {
	const [cards, setCards] = useState<AchievementCard[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [showUndo, setShowUndo] = useState(false);
	const [lastRemovedCard, setLastRemovedCard] = useState<AchievementCard | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showAllRead, setShowAllRead] = useState(false);

	// Load motivation cards on mount
	useEffect(() => {
		loadMotivationCards();
	}, []);

	const loadMotivationCards = async () => {
		try {
			setIsLoading(true);
			const userId = userData?.user?.id || userData?.id || 'anonymous';

			const motivationCards = await getMotivationCards(userId);
			console.log('[MotivationCardsSection] Loaded motivation cards:', motivationCards);

			setCards(motivationCards);
			setCurrentIndex(0);
		} catch (error) {
			console.error('[MotivationCardsSection] Error loading motivation cards:', error);
			toast.error('Не удалось загрузить карточки', {
				description: 'Проверьте подключение к интернету',
			});

			// Fallback to default motivations
			const userLanguage = (userData?.language || 'ru') as Language;
			const defaultCards = getDefaultMotivations(userLanguage);
			setCards(defaultCards);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSwipe = async (direction: 'left' | 'right') => {
		const currentCard = cards[currentIndex];

		if (direction === 'right') {
			// Mark as read
			try {
				const userId = userData?.user?.id || userData?.id || 'anonymous';
				await markCardAsRead(userId, currentCard.id);
				console.log(`Card ${currentCard.id} marked as read`);
			} catch (error) {
				console.error('Error marking card as read:', error);
			}
		}

		// Save removed card for undo
		setLastRemovedCard(currentCard);
		setShowUndo(true);

		// Hide undo after 3 seconds
		setTimeout(() => {
			setShowUndo(false);
			setLastRemovedCard(null);
		}, 3000);

		// Move to next card
		const nextIndex = currentIndex + 1;
		setCurrentIndex(nextIndex);

		// Check if all cards are read
		if (nextIndex >= cards.length) {
			setShowAllRead(true);
		}

		// Notify parent
		onCardSwipe?.();
	};

	const handleUndo = () => {
		if (lastRemovedCard && currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setShowUndo(false);
			setLastRemovedCard(null);
			setShowAllRead(false);
		}
	};

	// Calculate visible cards (current + next 3)
	const visibleCards = cards.slice(currentIndex, currentIndex + 4);
	const hasCards = visibleCards.length > 0;

	// Loading state
	if (isLoading) {
		return (
			<div className="p-section">
				<div className="relative mb-responsive-md flex min-h-[280px] w-full items-center justify-center">
					<div className="text-center">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						<p className="mt-4 text-muted-foreground text-sm">Загрузка карточек...</p>
					</div>
				</div>
			</div>
		);
	}

	// All cards read state
	if (showAllRead && !hasCards) {
		return (
			<div className="p-section">
				<div className="relative mb-responsive-md min-h-[280px] w-full">
					<div className="rounded-[36px] border border-border bg-card p-8 text-center">
						<div className="mb-4 text-6xl">🎉</div>
						<h3 className="mb-2 font-semibold text-xl">Все прочитано!</h3>
						<p className="text-muted-foreground">Новые карточки появятся завтра</p>
					</div>
				</div>
			</div>
		);
	}

	// Cards display
	return (
		<div className="p-section">
			{/* Undo Button */}
			{showUndo && lastRemovedCard && (
				<div className="-translate-x-1/2 fade-in slide-in-from-top-2 fixed top-20 left-1/2 z-50 animate-in duration-300">
					<button
						className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-card-foreground shadow-lg transition-colors hover:bg-accent"
						onClick={handleUndo}
					>
						<X className="h-4 w-4" />
						<span className="font-medium text-sm">Отменить</span>
					</button>
				</div>
			)}

			{/* Cards Stack Container */}
			<div className="relative mb-responsive-md min-h-[280px] w-full">
				<AnimatedPresence>
					{visibleCards.reverse().map((card, idx) => {
						const actualIndex = visibleCards.length - 1 - idx;
						return (
							<SwipeCard
								card={card}
								index={actualIndex}
								isTop={actualIndex === 0}
								key={card.id}
								onSwipe={handleSwipe}
								totalCards={visibleCards.length}
							/>
						);
					})}
				</AnimatedPresence>
			</div>
		</div>
	);
}
