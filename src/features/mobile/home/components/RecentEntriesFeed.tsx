import { useState, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { getEntries, type DiaryEntry } from "@/shared/lib/api";
import { getCategoryTranslation, type Language } from "@/shared/lib/i18n";
import { MediaPreview } from "@/features/mobile/media";
import {
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from "lucide-react";

interface RecentEntriesFeedProps {
  userData?: any;
  language?: Language;
  onEntryClick?: (entry: DiaryEntry) => void;
}

export function RecentEntriesFeed({ userData, language = 'ru', onEntryClick }: RecentEntriesFeedProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 mb-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Лента последних записей</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
    <div className="px-4 mb-6 mt-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Лента последних записей</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 p-0 h-auto"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Список записей */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => onEntryClick?.(entry)}
          >
            {/* Время */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{formatTimeAgo(entry.createdAt)}</span>
              <Badge
                className={`text-xs px-2.5 py-0.5 rounded-full ${getSentimentColor(entry.sentiment)}`}
              >
                {getCategoryEmoji(entry.category)} {getCategoryTranslation(entry.category, language)}
              </Badge>
            </div>

            {/* ✅ FIX: Медиа над текстом в 1 ряд (как в ClickUp) */}
            {entry.media && entry.media.length > 0 && (
              <div className="mb-3">
                <MediaPreview
                  media={entry.media}
                  editable={false}
                  layout={entry.media.length > 1 ? 'row' : 'grid'}
                  onImageClick={(index) => {
                    // TODO: Открыть lightbox
                  }}
                />
              </div>
            )}

            {/* Заголовок - БЕЗ AI описания, только первая строка текста */}
            <h3 className="font-semibold text-gray-900 mb-1.5 text-base line-clamp-1">
              {entry.text.split('\n')[0].substring(0, 60)}
            </h3>

            {/* Превью текста - 2 строки */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {entry.text}
            </p>

            {/* Действия */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Добавить функционал лайка
                }}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Добавить функционал дизлайка
                }}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 ml-auto text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Добавить меню действий
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

