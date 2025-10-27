import { motion } from "motion/react";
import { MoreVertical, Sparkles } from "lucide-react";
import type { DiaryEntry } from "@/shared/lib/api";
import { MediaPreview } from "@/features/mobile/media";
import { CATEGORY_ICONS, SENTIMENT_COLORS } from "./constants";
import { formatEntryDate } from "./utils";

interface EntryCardProps {
  entry: DiaryEntry;
  index: number;
  onOpenActions: (entry: DiaryEntry) => void;
}

/**
 * Entry Card Component
 * Displays a single diary entry
 */
export function EntryCard({ entry, index, onOpenActions }: EntryCardProps) {
  // ✅ SAFETY: Case-insensitive category icon lookup with fallback for custom categories
  const getCategoryIcon = (category: string) => {
    if (!category) return Sparkles; // Empty category fallback

    // Try exact match first
    if (CATEGORY_ICONS[category]) {
      return CATEGORY_ICONS[category];
    }

    // Try case-insensitive match for default categories
    const matchedKey = Object.keys(CATEGORY_ICONS).find(
      key => key.toLowerCase() === category.toLowerCase()
    );

    if (matchedKey && CATEGORY_ICONS[matchedKey]) {
      return CATEGORY_ICONS[matchedKey];
    }

    // Fallback to Sparkles for custom user categories
    return Sparkles;
  };

  const CategoryIcon = getCategoryIcon(entry.category);
  const entryDate = new Date(entry.createdAt);
  const dateStr = formatEntryDate(entryDate);

  return (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-[16px] p-4 border border-border hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/10 rounded-[8px] flex items-center justify-center">
            <CategoryIcon className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14px]! font-semibold! text-foreground dark:text-white">
              {entry.category}
            </p>
            <p className="text-[12px]! text-muted-foreground">
              {dateStr}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenActions(entry)}
          className="p-1 hover:bg-accent/10 rounded-[6px] transition-colors"
        >
          <MoreVertical className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
        </button>
      </div>

      {/* Media Preview */}
      {entry.media && entry.media.length > 0 && (
        <div className="mb-3">
          <MediaPreview
            media={entry.media}
            editable={false}
            layout={entry.media.length > 1 ? 'row' : 'grid'}
          />
        </div>
      )}

      <p className="text-[15px]! text-foreground dark:text-white leading-[22px] mb-3">
        {entry.text}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-[6px] text-[11px]! font-medium! border ${SENTIMENT_COLORS[entry.sentiment]} border-current/30`}>
          {entry.sentiment === 'positive' ? '😊 Позитив' : entry.sentiment === 'neutral' ? '😐 Нейтрал' : '😔 Грусть'}
        </span>
        {(entry.tags || []).map(tag => (
          <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-[6px] text-[11px]! border border-muted-foreground/30 dark:border-muted-foreground/50">
            #{tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

