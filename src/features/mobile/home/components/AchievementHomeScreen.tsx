import { useState, useRef, useEffect } from "react";
import { AnimatedView, AnimatedPresence } from "@/shared/lib/platform/animation";
import { AchievementHeader } from "./AchievementHeader";
import { ChatInputSection } from "./ChatInputSection";
import { RecentEntriesFeed } from "./RecentEntriesFeed";
import { EntryDetailModal } from "./EntryDetailModal";
import { getUserStats, getMotivationCards, markCardAsRead, type DiaryEntry } from "@/shared/lib/api";
import { useTranslation, type Language } from "@/shared/lib/i18n";
import { toast } from "sonner";
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";
import { Undo2, X } from "lucide-react";

// Import modular components
import {
  SwipeCard,
  getDefaultMotivations,
  entryToCard
} from "./achievement";
import type {
  DiaryData,
  AchievementHomeScreenProps,
  AchievementCard
} from "./achievement";

// Re-export types for backward compatibility
export type { DiaryData, AchievementHomeScreenProps, AchievementCard };

// ✅ REMOVED: GRADIENTS moved to ./achievement/constants.ts
// ✅ REMOVED: DEFAULT_MOTIVATIONS moved to ./achievement/constants.ts
// ✅ REMOVED: getDefaultMotivations() moved to ./achievement/utils.ts
// ✅ REMOVED: entryToCard() moved to ./achievement/utils.ts
// ✅ REMOVED: SwipeCard component moved to ./achievement/SwipeCard.tsx

// Основной компонент
export function AchievementHomeScreen({
  diaryData = { name: "Мой дневник", emoji: "🏆" },
  userData,
  onNavigateToHistory,
  onNavigateToSettings
}: AchievementHomeScreenProps) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<AchievementCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [lastRemovedCard, setLastRemovedCard] = useState<AchievementCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showAllRead, setShowAllRead] = useState(true); // ✅ NEW: "Все прочитано!" visibility
  const undoTimeoutRef = useRef<NodeJS.Timeout>();

  // Получаем текущую дату
  const currentDate = new Date();
  const dateFormatter = new Intl.DateTimeFormat('ru', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'long'
  });
  const formattedDate = dateFormatter.format(currentDate);

  // Загрузка записей и статистики при монтировании
  useEffect(() => {
    loadEntriesAndStats();
  }, []);

  const loadEntriesAndStats = async () => {
    try {
      setIsLoading(true);
      const userId = userData?.user?.id || userData?.id || "anonymous";  // ✅ FIXED: Try user.id first
      const userLanguage = (userData?.profile?.language || userData?.language || 'ru') as Language;

      // Загружаем мотивационные карточки и статистику параллельно
      const [motivationCards, stats] = await Promise.all([
        getMotivationCards(userId),
        getUserStats(userId)
      ]);

      console.log("Loaded motivation cards:", motivationCards);
      console.log("User stats:", stats);

      // Устанавливаем карточки
      setCards(motivationCards);
      setCurrentIndex(0); // Сброс индекса при загрузке новых карточек

      // Обновляем streak
      setCurrentStreak(stats.currentStreak);

    } catch (error) {
      console.error("Error loading motivation cards:", error);
      toast.error(t('failed_load_cards', 'Не удалось загрузить карточки'), {
        description: t('check_internet_connection', 'Проверьте подключение к интернету')
      });
      // В случае ошибки показываем дефолтные мотивации
      const userLanguage = (userData?.language || 'ru') as Language;
      const defaultCards = getDefaultMotivations(userLanguage);
      setCards(defaultCards);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  // Обработчик создания новой записи
  const handleNewEntry = (entry: DiaryEntry) => {
    console.log("New entry created:", entry);

    const userLanguage = (userData?.language || 'ru') as Language;

    // Добавляем новую карточку в начало (временно, пока AI обрабатывает)
    const newCard = entryToCard(entry, 0, userLanguage);
    setCards(prev => [newCard, ...prev]);

    // Если это была первая запись (карточек не было), сбрасываем индекс
    if (cards.length === 0) {
      setCurrentIndex(0);
    }

    // Перезагружаем статистику (не полностью, только stats)
    const userId = userData?.id || "anonymous";
    getUserStats(userId).then(stats => {
      setCurrentStreak(stats.currentStreak);
    }).catch(err => {
      console.error("Error updating stats:", err);
    });

    // ✅ NEW: Trigger feed refresh
    setFeedRefreshKey(prev => prev + 1);

    // ✅ NEW: Показываем "Все прочитано!" снова при новой записи
    setShowAllRead(true);

    // ✅ FIX: Перезагружаем карточки с сервера через 3 секунды (после AI-анализа)
    setTimeout(() => {
      console.log("Reloading motivation cards after AI analysis...");
      getMotivationCards(userId).then(motivationCards => {
        console.log("Reloaded motivation cards:", motivationCards);
        setCards(motivationCards);
        setCurrentIndex(0); // Сброс индекса на первую карточку
      }).catch(err => {
        console.error("Error reloading motivation cards:", err);
      });
    }, 3000); // 3 секунды - достаточно для AI-анализа

    toast.success(t('achievement_saved_title', 'Отлично! 🎉'), {
      description: t('achievement_saved_desc', 'Твоё достижение сохранено')
    });
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    
    if (direction === 'right') {
      // Mark as loved/read
      setLastRemovedCard(currentCard);
      setShowUndo(true);
      
      // Отмечаем карточку как просмотренную в API
      if (currentCard.entryId && userData?.id) {
        try {
          await markCardAsRead(userData.id, currentCard.entryId);
          console.log('Card marked as read:', currentCard.entryId);
        } catch (error) {
          console.error('Error marking card as read:', error);
        }
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Auto-hide undo after 5 seconds
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastRemovedCard(null);
      }, 5000);
    }

    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (lastRemovedCard) {
      setCurrentIndex(prev => prev - 1);
      setShowUndo(false);
      setLastRemovedCard(null);
      
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    }
  };

  const visibleCards = cards.slice(currentIndex, currentIndex + 4);
  const hasCards = currentIndex < cards.length;

  // Получаем имя пользователя из userData.profile.name или userData.name или используем дефолтное
  const userName = userData?.profile?.name || userData?.name || "Пользователь";
  const userEmail = userData?.profile?.email || userData?.email;
  const avatarUrl = userData?.profile?.avatar || userData?.avatar;

  // Вычисляем количество дней в приложении (используем streak)
  const daysInApp = currentStreak > 0 ? currentStreak : 1;

  return (
    <div className="min-h-screen bg-background pb-20 scrollbar-hide">
      {/* Achievement Header */}
      <AchievementHeader
        userName={userName}
        daysInApp={daysInApp}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        onNavigateToSettings={onNavigateToSettings}
        onNavigateToHistory={onNavigateToHistory}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="p-section flex items-center justify-center">
          <LottiePreloaderCompact showMessage={false} size="md" />
        </div>
      )}

      {/* ✅ FIX: Swipe Cards Section - адаптивный контейнер по высоте карточек */}
      {!isLoading && hasCards && (
        <div className="p-section">
          {/* Cards Stack Container - адаптивная высота по содержимому */}
          <div className="relative w-full min-h-[280px] mb-responsive-md">
            <AnimatedPresence initial={false}>
              {visibleCards.reverse().map((card, idx) => {
                const actualIndex = visibleCards.length - 1 - idx;
                return (
                  <SwipeCard
                    key={card.id}
                    card={card}
                    index={actualIndex}
                    totalCards={visibleCards.length}
                    onSwipe={handleSwipe}
                    isTop={actualIndex === 0}
                  />
                );
              })}
            </AnimatedPresence>
          </div>
        </div>
      )}

      {/* ✅ FIX: "Все прочитано!" с крестиком для закрытия */}
      {!isLoading && !hasCards && showAllRead && (
        <div className="px-6 pt-0 pb-3">
          <AnimatedView
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card rounded-[var(--radius-xl)] p-5 border border-border text-center relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAllRead(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-[24px]">🎉</span>
            </div>
            <h3 className="text-foreground mb-1.5 text-[16px]!">Все прочитано!</h3>
            <p className="text-muted-foreground text-[13px]! leading-[1.4]">
              Вы просмотрели все карточки. Создайте новую запись, чтобы добавить больше достижений.
            </p>
          </AnimatedView>
        </div>
      )}

      {/* ✅ FIX: Chat Container - адаптивный контейнер под карточками */}
      {!isLoading && (
        <div className="relative w-full">
          <ChatInputSection
            userName={userName}
            userId={userData?.user?.id || userData?.id || "anonymous"}  // ✅ FIXED: Try user.id first
            onMessageSent={(message) => {
              console.log("New achievement message:", message);
            }}
            onEntrySaved={handleNewEntry}
          />
        </div>
      )}

      {/* Recent Entries Feed - Лента последних записей */}
      {!isLoading && (
        <RecentEntriesFeed
          key={feedRefreshKey} // ✅ NEW: Force refresh when key changes
          userData={userData}
          language={userData?.language || 'ru'}
          onEntryClick={(entry) => {
            setSelectedEntry(entry);
          }}
          onViewAllClick={() => {
            console.log("Navigate to History");
            onNavigateToHistory?.();
          }}
        />
      )}

      {/* Entry Detail Modal */}
      <EntryDetailModal
        entry={selectedEntry}
        isOpen={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

export default AchievementHomeScreen;
