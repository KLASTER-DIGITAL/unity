import { Calendar } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n";

interface EmptyStateProps {
  hasFilters: boolean;
}

/**
 * Empty State Component
 * Displayed when no entries are found
 */
export function EmptyState({ hasFilters }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-8 w-8 text-accent" strokeWidth={2} />
      </div>
      <h3 className="text-[18px]! font-semibold! text-foreground mb-2">
        {t('no_entries_found', 'Записей не найдено')}
      </h3>
      <p className="text-[14px]! text-muted-foreground">
        {hasFilters
          ? t('try_change_filters', 'Попробуйте изменить фильтры')
          : t('create_first_entry', 'Создайте первую запись')}
      </p>
    </div>
  );
}

