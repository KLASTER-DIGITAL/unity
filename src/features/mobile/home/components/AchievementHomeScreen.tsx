import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { AchievementHeader } from "./AchievementHeader";
import { ChatInputSection } from "./ChatInputSection";
import { RecentEntriesFeed } from "./RecentEntriesFeed";
import { getEntries, getUserStats, getMotivationCards, markCardAsRead, type DiaryEntry, type MotivationCard } from "@/shared/lib/api";
import { useTranslation, getCategoryTranslation, type Language } from "@/shared/lib/i18n";
import { toast } from "sonner";
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";
import {
  Undo2,
  Heart,
  X
} from "lucide-react";

interface DiaryData {
  name: string;
  emoji: string;
}

interface AchievementHomeScreenProps {
  diaryData?: DiaryData;
  userData?: any;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
}

interface AchievementCard {
  id: string;
  entryId?: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  isDefault?: boolean;
  sentiment?: string;
  mood?: string;
}

// Градиенты для карточек в зависимости от sentiment
const GRADIENTS = {
  positive: [
    "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
    "from-[var(--gradient-positive-2-start)] to-[var(--gradient-positive-2-end)]",
    "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
    "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]"
  ],
  neutral: [
    "from-[var(--gradient-neutral-1-start)] to-[var(--gradient-neutral-1-end)]",
    "from-[var(--gradient-neutral-2-start)] to-[var(--gradient-neutral-2-end)]"
  ],
  negative: [
    "from-[var(--gradient-negative-1-start)] to-[var(--gradient-negative-1-end)]",
    "from-[var(--gradient-negative-2-start)] to-[var(--gradient-negative-2-end)]"
  ]
};

// Мультиязычные дефолтные мотивации
const DEFAULT_MOTIVATIONS: { [key: string]: AchievementCard[] } = {
  ru: [
    {
      id: "default_1",
      date: "Начни сегодня",
      title: "Сегодня отличное время",
      description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Совет дня",
      title: "Даже одна мысль делает день осмысленным",
      description: "Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Мотивация",
      title: "Запиши момент благодарности",
      description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  en: [
    {
      id: "default_1",
      date: "Start today",
      title: "Today is a great time",
      description: "Write down a small victory — it's the first step to recognizing your achievements.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Daily tip",
      title: "Even one thought makes the day meaningful",
      description: "You don't have to write a lot — one phrase can change your perspective on the day.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Write down a moment of gratitude",
      description: "Feel the lightness when you notice the good in your life. This is the path to happiness.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  es: [
    {
      id: "default_1",
      date: "Empieza hoy",
      title: "Hoy es un gran momento",
      description: "Escribe una pequeña victoria — es el primer paso para reconocer tus logros.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Consejo del día",
      title: "Incluso un pensamiento hace el día significativo",
      description: "No tienes que escribir mucho — una frase puede cambiar tu perspectiva del día.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivación",
      title: "Escribe un momento de gratitud",
      description: "Siente la ligereza cuando notas lo bueno en tu vida. Este es el camino a la felicidad.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  de: [
    {
      id: "default_1",
      date: "Fang heute an",
      title: "Heute ist eine gute Zeit",
      description: "Schreibe einen kleinen Sieg auf — es ist der erste Schritt, um deine Erfolge zu erkennen.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Tipp des Tages",
      title: "Selbst ein Gedanke macht den Tag bedeutsam",
      description: "Du musst nicht viel schreiben — ein Satz kann deine Perspektive auf den Tag ändern.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Schreibe einen Moment der Dankbarkeit auf",
      description: "Fühl die Leichtigkeit, wenn du das Gute in deinem Leben bemerkst. Das ist der Weg zum Glück.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  fr: [
    {
      id: "default_1",
      date: "Commencez aujourd'hui",
      title: "Aujourd'hui est un bon moment",
      description: "Écrivez une petite victoire — c'est le premier pas pour reconnaître vos réalisations.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Conseil du jour",
      title: "Même une pensée rend la journée significative",
      description: "Vous n'avez pas besoin d'écrire beaucoup — une phrase peut changer votre regard sur la journée.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Écrivez un moment de gratitude",
      description: "Ressentez la légèreté lorsque vous remarquez le bien dans votre vie. C'est le chemin vers le bonheur.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  zh: [
    {
      id: "default_1",
      date: "今天开始",
      title: "今天是个好时机",
      description: "写下一个小胜利——这是认识自己成就的第一步。",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "每日提示",
      title: "即使一个想法也能让这一天有意义",
      description: "不需要写很多——一句话就能改变你对这一天的看法。",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "动力",
      title: "写下感恩的时刻",
      description: "当你注意到生活中的美好时，感受那份轻松。这是通往幸福的道路。",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  ja: [
    {
      id: "default_1",
      date: "今日から始めよう",
      title: "今日は良い時です",
      description: "小さな勝利を書き留めましょう——それはあなたの成果を認識する第一歩です。",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "今日のヒント",
      title: "一つの考えでも一日を意味のあるものにします",
      description: "たくさん書く必要はありません——一つのフレーズがあなたの一日への見方を変えることができます。",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "モチベーション",
      title: "感謝の瞬間を書き留めましょう",
      description: "人生の良いことに気づいたとき、その軽さを感じましょう。それが幸せへの道です。",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ]
};

// Функция получения дефолтных мотиваций с учетом языка
function getDefaultMotivations(language: string): AchievementCard[] {
  return DEFAULT_MOTIVATIONS[language] || DEFAULT_MOTIVATIONS['ru'];
}

// Функция для конвертации DiaryEntry в AchievementCard
function entryToCard(entry: DiaryEntry, index: number, userLanguage: Language = 'ru'): AchievementCard {
  const gradientList = GRADIENTS[entry.sentiment] || GRADIENTS.positive;
  const gradient = gradientList[index % gradientList.length];
  
  const entryDate = new Date(entry.createdAt);
  const localeMap: Record<Language, string> = {
    ru: 'ru-RU',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    zh: 'zh-CN',
    ja: 'ja-JP'
  };
  const dateFormatter = new Intl.DateTimeFormat(localeMap[userLanguage] || 'ru-RU', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Используем aiSummary как title, если доступно
  const title = entry.aiSummary || getCategoryTranslation(entry.category || "Achievement", userLanguage);
  
  // Используем aiInsight как description, если доступно
  const description = entry.aiInsight || entry.text;
  
  return {
    id: entry.id,
    date: dateFormatter.format(entryDate),
    title,
    description,
    gradient,
    isMarked: false,
    category: entry.category,
    sentiment: entry.sentiment
  };
}

// Свайп-карточка с улучшенной визуализацией
function SwipeCard({ 
  card, 
  index, 
  totalCards, 
  onSwipe, 
  isTop
}: { 
  card: AchievementCard; 
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Overlay для визуального feedback при свайпе (только лайк)
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);

  const cardRef = useRef<HTMLDivElement>(null);

  // Вычисляем положение карточек в стеке (улучшенная видимость)
  const getStackStyle = () => {
    switch(index) {
      case 0: // Верхняя карточка - полностью видна
        return {
          scale: 1,
          y: 0,
          rotate: 0,
          opacity: 1,
          blur: 0,
          zIndex: 40
        };
      case 1: // Вторая карточка - хорошо видна сзади
        return {
          scale: 0.96,
          y: -16,
          rotate: -3,
          opacity: 0.95,
          blur: 1,
          zIndex: 30
        };
      case 2: // Третья карточка - видна за второй
        return {
          scale: 0.92,
          y: -32,
          rotate: 3,
          opacity: 0.85,
          blur: 2,
          zIndex: 20
        };
      default: // Остальные карточки - слегка видны
        return {
          scale: 0.88,
          y: -48,
          rotate: 0,
          opacity: 0.7,
          blur: 3,
          zIndex: 10
        };
    }
  };

  const stackStyle = getStackStyle();

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Если свайп достаточно быстрый или далекий
    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      onSwipe(offset > 0 ? 'right' : 'left');
    } else {
      // Возвращаем карточку на место
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : stackStyle.y,
        rotate: isTop ? rotate : stackStyle.rotate,
        scale: isTop ? opacity.get() > 0.8 ? stackStyle.scale : useTransform(opacity, [0.5, 1], [0.9, stackStyle.scale]) : stackStyle.scale,
        zIndex: stackStyle.zIndex,
      }}
      initial={{ 
        scale: stackStyle.scale,
        y: stackStyle.y,
        rotate: stackStyle.rotate,
        opacity: stackStyle.opacity
      }}
      animate={{ 
        scale: stackStyle.scale,
        y: stackStyle.y,
        rotate: stackStyle.rotate,
        opacity: stackStyle.opacity,
        filter: `blur(${stackStyle.blur}px)`,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 30 : -30,
        transition: { duration: 0.3, ease: "easeIn" }
      }}
      className={`${index === 0 ? 'relative' : 'absolute'} w-full cursor-grab active:cursor-grabbing`}
      whileTap={{ cursor: "grabbing", scale: isTop ? 1.02 : stackStyle.scale }}
    >
      <div
        className={`bg-gradient-to-br ${card.gradient} rounded-[36px] overflow-hidden relative`}
        style={{
          boxShadow: index === 0 ? '0 20px 60px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
          backgroundColor: '#FE7669', // Непрозрачный фон под градиентом
        }}
      >
        {/* Like overlay - показывается при свайпе вправо */}
        {isTop && (
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-green-500/40 pointer-events-none z-10 flex items-center justify-center"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl rotate-12 border-4 border-white shadow-xl">
              <Heart className="w-12 h-12" fill="currentColor" />
            </div>
          </motion.div>
        )}

        {/* Основное содержимое карточки */}
        <div className="p-card relative z-0">
          {/* Date - ✅ FIX #3: Уменьшили отступ снизу */}
          <motion.div
            className="text-white/90 mb-3"
            animate={{ opacity: 0.9 }}
          >
            <p className="text-caption-1 text-white/90">{card.date}</p>
          </motion.div>

          {/* Title - ✅ FIX #3: Уменьшили размер заголовка */}
          <motion.div className="mb-3">
            <h3 className="text-title-2 text-white tracking-[-0.5px] leading-tight">
              {card.title}
            </h3>
          </motion.div>

          {/* Description */}
          <motion.div className="mb-0">
            <p className="text-callout text-white leading-[22px] opacity-95">
              {card.description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

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
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden scrollbar-hide">
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
            <AnimatePresence initial={false}>
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
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ✅ FIX: "Все прочитано!" с крестиком для закрытия */}
      {!isLoading && !hasCards && showAllRead && (
        <div className="px-6 pt-0 pb-3">
          <motion.div
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
            <h3 className="text-foreground mb-1.5 !text-[16px]">Все прочитано!</h3>
            <p className="text-muted-foreground !text-[13px] leading-[1.4]">
              Вы просмотрели все карточки. Создайте новую запись, чтобы добавить больше достижений.
            </p>
          </motion.div>
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
            console.log("Entry clicked:", entry);
            // TODO: Открыть детальный просмотр записи
          }}
          onViewAllClick={() => {
            console.log("Navigate to History");
            onNavigateToHistory?.();
          }}
        />
      )}
    </div>
  );
}
