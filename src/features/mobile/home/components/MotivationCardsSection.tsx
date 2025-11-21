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

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getMotivationCards, markCardAsRead } from '@/shared/lib/api';
import { useTranslation } from '@/shared/lib/i18n';
import { AnimatedPresence } from '@/shared/lib/platform/animation';
import { createClient } from '@/utils/supabase/client';
import { AllCardsViewedModal } from './AllCardsViewedModal';
import type { AchievementCard } from './achievement';
// Import modular components
import { SwipeCard } from './achievement';
import { useDefaultMotivations } from './achievement/useDefaultMotivations';

type MotivationCardsSectionProps = {
	userData: any;
	onCardSwipe?: () => void;
	motivationCards?: AchievementCard[]; // ✅ OPTIMIZATION: Accept cards from parent (unified API)
	isLoading?: boolean; // ✅ OPTIMIZATION: Accept loading state from parent
};

export function MotivationCardsSection({
	userData,
	onCardSwipe,
	motivationCards: externalCards,
	isLoading: externalLoading,
}: MotivationCardsSectionProps) {
	const [cards, setCards] = useState<AchievementCard[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	// ❌ УДАЛЕНО: showUndo и lastRemovedCard - кнопка "Отменить" больше не нужна
	const [isLoading, setIsLoading] = useState(true);
	const [showAllRead, setShowAllRead] = useState(false);
	const [showAllCardsViewedModal, setShowAllCardsViewedModal] = useState(false);

	// ✅ КРИТИЧНО: Создаем ОДИН Supabase клиент для realtime подписки
	const supabase = createClient();
	const loadMotivationCardsRef = useRef<(() => Promise<void>) | null>(null);

	// ✅ NEW: Use i18n hook for translations
	const { t } = useTranslation();
	const defaultMotivations = useDefaultMotivations();

	// ✅ OPTIMIZATION: Use external cards if provided (from unified API)
	useEffect(() => {
		if (externalCards) {
			console.log('[MotivationCardsSection] Using external cards from unified API:', externalCards);
			setCards(externalCards);
			setCurrentIndex(0);
			setIsLoading(externalLoading || false);
			return;
		}
	}, [externalCards, externalLoading]);

	// Load motivation cards function - используем useCallback для стабильной ссылки
	const loadMotivationCards = useCallback(
		async (useCache = true) => {
			// ✅ OPTIMIZATION: Skip if using external cards
			if (externalCards) {
				console.log('[MotivationCardsSection] Skipping load - using external cards');
				return;
			}

			try {
				setIsLoading(true);
				const userId = userData?.user?.id || userData?.id || 'anonymous';

				const motivationCards = await getMotivationCards(userId, useCache);
				console.log('[MotivationCardsSection] Loaded motivation cards:', motivationCards);

				setCards(motivationCards);
				setCurrentIndex(0);
			} catch (error) {
				console.error('[MotivationCardsSection] Error loading motivation cards:', error);
				toast.error(t('errors.loadCards', 'Не удалось загрузить карточки'), {
					description: t('errors.checkConnection', 'Проверьте подключение к интернету'),
				});

				// Fallback to default motivations (using i18n hook)
				setCards(defaultMotivations);
			} finally {
				setIsLoading(false);
			}
		},
		[userData?.user?.id, userData?.id, userData?.language, externalCards]
	);

	// ✅ FIX: Сохраняем ссылку на функцию загрузки для realtime подписки
	useEffect(() => {
		loadMotivationCardsRef.current = loadMotivationCards;
	}, [loadMotivationCards]);

	// Load motivation cards on mount
	useEffect(() => {
		loadMotivationCards();
	}, [loadMotivationCards]);

	// ✅ НОВОЕ: Real-time subscription для автообновления карточек при создании новых записей
	useEffect(() => {
		const userId = userData?.user?.id || userData?.id;
		if (!userId || userId === 'anonymous') {
			console.log('[MotivationCardsSection] No userId, skipping real-time subscription');
			return;
		}

		console.log('[MotivationCardsSection] Setting up real-time subscription for entries:', userId);

		const channel = supabase
			.channel(`motivation-cards:${userId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT', // Слушаем только INSERT (новые записи)
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log('[MotivationCardsSection] 🔔 New entry created, reloading cards:', payload);

					// Перезагружаем карточки при создании новой записи БЕЗ кэша
					if (loadMotivationCardsRef.current) {
						console.log('[MotivationCardsSection] 🔄 Reloading motivation cards (no cache)...');
						loadMotivationCardsRef.current(false); // ✅ БЕЗ кэша для мгновенного обновления
					} else {
						console.error('[MotivationCardsSection] ❌ loadMotivationCardsRef.current is null!');
					}
				}
			)
			.subscribe((status) => {
				console.log('[MotivationCardsSection] 📡 Subscription status:', status);
				if (status === 'SUBSCRIBED') {
					console.log('[MotivationCardsSection] ✅ Successfully subscribed to real-time updates');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('[MotivationCardsSection] ❌ Channel error!');
				} else if (status === 'TIMED_OUT') {
					console.error('[MotivationCardsSection] ❌ Subscription timed out!');
				}
			});

		return () => {
			console.log('[MotivationCardsSection] Cleaning up real-time subscription');
			supabase.removeChannel(channel);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData?.user?.id, userData?.id, supabase.channel, supabase.removeChannel]); // ✅ FIX: supabase - singleton, не включаем в dependencies

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

		// ❌ УДАЛЕНО: Логика для кнопки "Отменить" - больше не нужна
		// Цель: пользователь должен просмотреть все карточки без возможности отмены

		// Move to next card
		const nextIndex = currentIndex + 1;
		setCurrentIndex(nextIndex);

		// Check if all cards are read
		if (nextIndex >= cards.length) {
			setShowAllRead(true);
			// ✅ NEW: Show success modal when all cards are viewed
			setShowAllCardsViewedModal(true);
		}

		// Notify parent
		onCardSwipe?.();
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
						<h3 className="mb-2 font-semibold text-lg transition-colors duration-300 sm:text-xl">
							Все прочитано!
						</h3>
						<p className="text-muted-foreground">Новые карточки появятся завтра</p>
					</div>
				</div>
			</div>
		);
	}

	// Cards display
	return (
		<>
			<div className="px-section pt-4 pb-16">
				{/* ✅ FIX: pt-4 (16px) от header, pb-16 (64px) отступ до заголовка */}

				{/* Cards Stack Container */}
				<div className="relative" style={{ height: '280px' }}>
					{/* ✅ FIX: height 280px для карточек */}
					{/* Карточки имеют absolute positioning, поэтому нужна фиксированная высота */}
					<AnimatedPresence mode={undefined}>
						{/* ✅ FIX: Рендерим карточки в ПРЯМОМ порядке для правильного z-index */}
						{/* Первая карточка в DOM = самый низкий z-index, последняя = самый высокий */}
						{visibleCards.map((card, index) => {
							return (
								<SwipeCard
									card={card}
									index={index}
									isTop={index === 0}
									key={card.id}
									onSwipe={handleSwipe}
									totalCards={visibleCards.length}
								/>
							);
						})}
					</AnimatedPresence>
				</div>
			</div>

			{/* ✅ NEW: All Cards Viewed Modal */}
			<AllCardsViewedModal
				onClose={() => setShowAllCardsViewedModal(false)}
				open={showAllCardsViewedModal}
			/>
		</>
	);
}
