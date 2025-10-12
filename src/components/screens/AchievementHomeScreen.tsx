import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { AchievementHeader } from "../AchievementHeader";
import { ChatInputSection } from "../ChatInputSection";
import { getEntries, getUserStats, type DiaryEntry } from "../../utils/api";
import { useTranslations, getCategoryTranslation, type Language } from "../../utils/i18n";
import { toast } from "sonner";
import { 
  Undo2,
  Heart
} from "lucide-react";

interface DiaryData {
  name: string;
  emoji: string;
}

interface AchievementHomeScreenProps {
  diaryData?: DiaryData;
  userData?: any;
}

interface AchievementCard {
  id: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  category?: string;
  sentiment?: string;
}

// Градиенты для карточек в зависимости от sentiment
const GRADIENTS = {
  positive: [
    "from-[#FE7669] to-[#ff8969]",
    "from-[#ff7769] to-[#ff6b9d]",
    "from-[#ff6b9d] to-[#c471ed]",
    "from-[#c471ed] to-[#8B78FF]"
  ],
  neutral: [
    "from-[#92BFFF] to-[#6BA3FF]",
    "from-[#6BA3FF] to-[#5B93EF]"
  ],
  negative: [
    "from-[#FFB74D] to-[#FFA726]",
    "from-[#FFA726] to-[#FF9800]"
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
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Совет дня",
      title: "Даже одна мысль делает день осмысленным",
      description: "Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Мотивация",
      title: "Запиши момент благодарности",
      description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  en: [
    {
      id: "default_1",
      date: "Start today",
      title: "Today is a great time",
      description: "Write down a small victory — it's the first step to recognizing your achievements.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Daily tip",
      title: "Even one thought makes the day meaningful",
      description: "You don't have to write a lot — one phrase can change your perspective on the day.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Write down a moment of gratitude",
      description: "Feel the lightness when you notice the good in your life. This is the path to happiness.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  es: [
    {
      id: "default_1",
      date: "Empieza hoy",
      title: "Hoy es un gran momento",
      description: "Escribe una pequeña victoria — es el primer paso para reconocer tus logros.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Consejo del día",
      title: "Incluso un pensamiento hace el día significativo",
      description: "No tienes que escribir mucho — una frase puede cambiar tu perspectiva del día.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivación",
      title: "Escribe un momento de gratitud",
      description: "Siente la ligereza cuando notas lo bueno en tu vida. Este es el camino a la felicidad.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  de: [
    {
      id: "default_1",
      date: "Fang heute an",
      title: "Heute ist eine gute Zeit",
      description: "Schreibe einen kleinen Sieg auf — es ist der erste Schritt, um deine Erfolge zu erkennen.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Tipp des Tages",
      title: "Selbst ein Gedanke macht den Tag bedeutsam",
      description: "Du musst nicht viel schreiben — ein Satz kann deine Perspektive auf den Tag ändern.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Schreibe einen Moment der Dankbarkeit auf",
      description: "Fühl die Leichtigkeit, wenn du das Gute in deinem Leben bemerkst. Das ist der Weg zum Glück.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  fr: [
    {
      id: "default_1",
      date: "Commencez aujourd'hui",
      title: "Aujourd'hui est un bon moment",
      description: "Écrivez une petite victoire — c'est le premier pas pour reconnaître vos réalisations.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Conseil du jour",
      title: "Même une pensée rend la journée significative",
      description: "Vous n'avez pas besoin d'écrire beaucoup — une phrase peut changer votre regard sur la journée.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Écrivez un moment de gratitude",
      description: "Ressentez la légèreté lorsque vous remarquez le bien dans votre vie. C'est le chemin vers le bonheur.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  zh: [
    {
      id: "default_1",
      date: "今天开始",
      title: "今天是个好时机",
      description: "写下一个小胜利——这是认识自己成就的第一步。",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "每日提示",
      title: "即使一个想法也能让这一天有意义",
      description: "不需要写很多——一句话就能改变你对这一天的看法。",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "动力",
      title: "写下感恩的时刻",
      description: "当你注意到生活中的美好时，感受那份轻松。这是通往幸福的道路。",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isMarked: false
    }
  ],
  ja: [
    {
      id: "default_1",
      date: "今日から始めよう",
      title: "今日は良い時です",
      description: "小さな勝利を書き留めましょう——それはあなたの成果を認識する第一歩です。",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "今日のヒント",
      title: "一つの考えでも一日を意味のあるものにします",
      description: "たくさん書く必要はありません——一つのフレーズがあなたの一日への見方を変えることができます。",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "モチベーション",
      title: "感謝の瞬間を書き留めましょう",
      description: "人生の良いことに気づいたとき、その軽さを感じましょう。それが幸せへの道です。",
      gradient: "from-[#c471ed] to-[#8B78FF]",
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
      className="absolute w-full cursor-grab active:cursor-grabbing"
      whileTap={{ cursor: "grabbing", scale: isTop ? 1.02 : stackStyle.scale }}
    >
      <div 
        className={`bg-gradient-to-br ${card.gradient} rounded-[36px] shadow-2xl overflow-hidden backdrop-blur-[32.5px] relative`}
        style={{
          boxShadow: index === 0 ? '0 20px 60px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)'
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
        <div className="p-8 py-10 relative z-0">
          {/* Date */}
          <motion.div 
            className="text-white/90 mb-6"
            animate={{ opacity: 0.9 }}
          >
            <p className="!text-[12px] !font-normal">{card.date}</p>
          </motion.div>
          
          {/* Title */}
          <motion.div className="mb-4">
            <h3 className="text-white !text-[24px] !font-semibold tracking-[-0.5px] leading-tight">
              {card.title}
            </h3>
          </motion.div>
          
          {/* Description */}
          <motion.div className="mb-2">
            <p className="text-white !text-[16px] !font-normal leading-[24px] opacity-95">
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
  userData 
}: AchievementHomeScreenProps) {
  const [cards, setCards] = useState<AchievementCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUndo, setShowUndo] = useState(false);
  const [lastRemovedCard, setLastRemovedCard] = useState<AchievementCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
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
      const userId = userData?.id || "anonymous";
      const userLanguage = (userData?.language || 'ru') as Language;

      // Загружаем записи и статистику параллельно
      const [entries, stats] = await Promise.all([
        getEntries(userId, 20),
        getUserStats(userId)
      ]);

      console.log("Loaded entries:", entries);
      console.log("User stats:", stats);

      // Фильтруем записи за вчера и сегодня для карточек мотивации
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const recentEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        return entryDay >= yesterday;
      });

      console.log(`Filtered ${recentEntries.length} entries from yesterday/today out of ${entries.length} total`);

      // Конвертируем записи в карточки
      if (recentEntries.length > 0) {
        // Показываем до 3 карточек из последних записей
        const cardsToShow = recentEntries.slice(0, 3);
        const loadedCards = cardsToShow.map((entry, index) => entryToCard(entry, index, userLanguage));
        setCards(loadedCards);
        setCurrentIndex(0); // Сброс индекса при загрузке новых карточек
      } else {
        // Показываем дефолтные мотивации с учетом языка пользователя
        const defaultCards = getDefaultMotivations(userLanguage);
        
        if (isFirstLoad && !userData?.id) {
          setCards(defaultCards);
          setCurrentIndex(0);
        } else {
          // Для авторизованных пользователей без записей за вчера/сегодня показываем дефолтные мотивации
          setCards(defaultCards);
          setCurrentIndex(0);
        }
      }

      // Обновляем streak
      setCurrentStreak(stats.currentStreak);

    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error("Не удалось загрузить записи", {
        description: "Проверьте подключение к интернету"
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
    
    // Добавляем новую карточку в начало
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
    
    toast.success("Отлично! 🎉", {
      description: "Твоё достижение сохранено"
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    
    if (direction === 'right') {
      // Mark as loved
      setLastRemovedCard(currentCard);
      setShowUndo(true);
      
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

  // Получаем имя пользователя из userData или используем дефолтное
  const userName = userData?.name || "Анна";
  // Вычисляем количество дней в приложении (используем streak)
  const daysInApp = currentStreak > 0 ? currentStreak : 1;

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden scrollbar-hide">
      {/* Achievement Header */}
      <AchievementHeader userName={userName} daysInApp={daysInApp} />

      {/* Loading State */}
      {isLoading && (
        <div className="px-6 pt-8 pb-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="!text-[14px] text-muted-foreground">Загрузка записей...</p>
          </div>
        </div>
      )}

      {/* Swipe Cards Section */}
      {!isLoading && hasCards && (
        <div className="px-6 pt-5 pb-2">
          {/* Cards Stack Container */}
          <div className="relative w-full" style={{ height: '260px' }}>
            {/* Background blur effect для создания глубины */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-0" 
                 style={{ top: '20px' }} 
            />
            
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

      {!isLoading && !hasCards && (
        <div className="px-6 pt-0 pb-3">
          <div className="bg-card rounded-[var(--radius-xl)] p-5 border border-border text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-[24px]">🎉</span>
            </div>
            <h3 className="text-foreground mb-1.5 !text-[16px]">Все прочитано!</h3>
            <p className="text-muted-foreground !text-[13px] leading-[1.4]">
              Вы просмотрели все карточки. Создайте новую запись, чтобы добавить больше достижений.
            </p>
          </div>
        </div>
      )}

      {/* Chat Input Section - основная функция создания записей */}
      {!isLoading && (
        <ChatInputSection 
          userName={userName}
          userId={userData?.id || "anonymous"}
          onMessageSent={(message) => {
            console.log("New achievement message:", message);
          }}
          onEntrySaved={handleNewEntry}
        />
      )}
    </div>
  );
}
