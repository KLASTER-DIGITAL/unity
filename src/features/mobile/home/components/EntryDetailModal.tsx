/**
 * Entry Detail Modal - Модальное окно для просмотра полной записи
 * 
 * Features:
 * - Полный текст записи
 * - Медиа-файлы (изображения, видео, аудио)
 * - Категория и настроение
 * - Дата и время создания
 * - Анимация появления/исчезновения
 * - Закрытие по клику на backdrop или кнопку
 * 
 * @author UNITY Team
 * @date 2025-10-21
 */

import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { MediaLightbox } from "@/features/mobile/media";
import { useState } from "react";
import type { DiaryEntry } from "@/shared/lib/api";

interface EntryDetailModalProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

// Утилиты для форматирования
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    work: '💼',
    health: '💪',
    relationships: '❤️',
    personal: '🌟',
    finance: '💰',
    education: '📚',
    hobby: '🎨',
    travel: '✈️',
    other: '📝'
  };
  return emojiMap[category] || '📝';
}

function getSentimentColor(sentiment: string): string {
  const colorMap: Record<string, string> = {
    positive: 'bg-green-500/10 text-green-600 dark:text-green-400',
    neutral: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    negative: 'bg-red-500/10 text-red-600 dark:text-red-400'
  };
  return colorMap[sentiment] || colorMap.neutral;
}

function getSentimentLabel(sentiment: string): string {
  const labelMap: Record<string, string> = {
    positive: 'Позитивное',
    neutral: 'Нейтральное',
    negative: 'Негативное'
  };
  return labelMap[sentiment] || 'Нейтральное';
}

export function EntryDetailModal({ entry, isOpen, onClose }: EntryDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!entry) return null;

  const handleMediaClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-modal flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-card rounded-t-[24px] sm:rounded-[24px] w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Badge className={`!text-[12px] px-2 py-1 rounded-full ${getSentimentColor(entry.sentiment)}`}>
                  {getCategoryEmoji(entry.category)} {getSentimentLabel(entry.sentiment)}
                </Badge>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-4 text-muted-foreground !text-[13px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(entry.createdAt)}</span>
                </div>
              </div>

              {/* Entry Text */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground !text-[15px] leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>

              {/* Media Files */}
              {entry.mediaFiles && entry.mediaFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="!text-[14px] !font-semibold text-foreground">Медиа-файлы</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {entry.mediaFiles.map((media, index) => (
                      <div
                        key={media.id}
                        className="relative aspect-square rounded-[12px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleMediaClick(index)}
                      >
                        {media.type === 'image' && (
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {media.type === 'video' && (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                        {media.type === 'audio' && (
                          <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                            <span className="text-4xl">🎵</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Recording */}
              {entry.voiceUrl && (
                <div className="space-y-2">
                  <h4 className="!text-[14px] !font-semibold text-foreground">Голосовая запись</h4>
                  <audio
                    src={entry.voiceUrl}
                    controls
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Media Lightbox */}
          {entry.mediaFiles && entry.mediaFiles.length > 0 && (
            <MediaLightbox
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              media={entry.mediaFiles}
              initialIndex={lightboxIndex}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

