import { useState, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { getEntries, type DiaryEntry } from "@/shared/lib/api";
import { getCategoryTranslation, type Language } from "@/shared/lib/i18n";
import { MediaPreview } from "@/features/mobile/media";
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface RecentEntriesFeedProps {
  userData?: any;
  language?: Language;
  onEntryClick?: (entry: DiaryEntry) => void;
  onViewAllClick?: () => void;
}

export function RecentEntriesFeed({ userData, language = 'ru', onEntryClick, onViewAllClick }: RecentEntriesFeedProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  useEffect(() => {
    loadRecentEntries();
  }, [userData?.id]);

  const loadRecentEntries = async () => {
    try {
      setIsLoading(true);
      const userId = userData?.user?.id || userData?.id || "anonymous";  // ✅ FIXED: Try user.id first
      const allEntries = await getEntries(userId, 3); // Загружаем только последние 3
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading recent entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Только что";
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    if (diffInDays === 0) return "Сегодня";
    if (diffInDays === 1) return "Вчера";
    if (diffInDays < 7) return `${diffInDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      'Работа': '💼',
      'Спорт': '⚽',
      'Здоровье': '🏃',
      'Семья': '👨‍👩‍👧',
      'Друзья': '👥',
      'Путешествия': '✈️',
      'Хобби': '🎨',
      'Чтение': '📚',
      'Обучение': '📖',
      'Личное развитие': '🌱',
      'Финансы': '💰',
      'Творчество': '🎭',
      'Другое': '📝'
    };
    return emojiMap[category] || '📝';
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive': return 'bg-[var(--ios-green)]/10 text-[var(--ios-green)] border-[var(--ios-green)]/20';
      case 'neutral': return 'bg-[var(--ios-blue)]/10 text-[var(--ios-blue)] border-[var(--ios-blue)]/20';
      case 'negative': return 'bg-[var(--ios-red)]/10 text-[var(--ios-red)] border-[var(--ios-red)]/20';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 mb-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Лента последних записей</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl p-4 animate-pulse transition-colors duration-300">
              <div className="h-3 bg-muted rounded w-20 mb-3"></div>
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-1"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return null; // Не показываем блок если нет записей
  }

  return (
    <div className="mb-6 mt-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="!text-[20px] !font-semibold text-foreground">Лента последних записей</h2>
        <button
          onClick={onViewAllClick}
          className="flex items-center justify-center w-8 h-8 rounded-full text-foreground hover:bg-muted transition-colors"
          aria-label="Смотреть все"
        >
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {/* Горизонтальный скролл */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 px-4">
          {/* Последние 3 записи - ФИКСИРОВАННЫЙ размер 240x140px */}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex-shrink-0 w-[240px] h-[140px] bg-card rounded-[16px] p-3 cursor-pointer hover:shadow-sm transition-shadow border border-border relative overflow-hidden flex flex-col"
              onClick={() => onEntryClick?.(entry)}
            >
              {/* Время и категория */}
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <span className="!text-[11px] text-muted-foreground whitespace-nowrap">{formatTimeAgo(entry.createdAt)}</span>
                <Badge
                  className={`!text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${getSentimentColor(entry.sentiment)}`}
                >
                  {getCategoryEmoji(entry.category)}
                </Badge>
              </div>

              {/* Заголовок */}
              <h3 className="!font-semibold text-foreground mb-1 !text-[13px] line-clamp-1 flex-shrink-0 min-w-0">
                {entry.text.split('\n')[0].substring(0, 30)}
              </h3>

              {/* Превью текста с тонким градиентом затухания - РАСТЯГИВАЕТСЯ */}
              <div className="relative flex-1 min-h-0">
                <p className="!text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                  {entry.text}
                </p>
                {/* Тонкий градиент затухания только в конце (20-30px) */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Карточка "Смотреть все" - 240x140px */}
          <div
            onClick={onViewAllClick}
            className="flex-shrink-0 w-[240px] h-[140px] bg-gradient-to-br from-accent/10 to-accent/5 rounded-[16px] p-4 cursor-pointer hover:shadow-sm transition-all border border-accent/20 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-accent" strokeWidth={2} />
            </div>
            <p className="!text-[13px] !font-medium text-accent text-center">
              Смотреть все
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

