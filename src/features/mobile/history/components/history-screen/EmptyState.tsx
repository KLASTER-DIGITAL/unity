import { Calendar } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n";

type EmptyStateProps = {
	hasFilters: boolean;
};

/**
 * Empty State Component
 * Displayed when no entries are found
 */
export function EmptyState({ hasFilters }: EmptyStateProps) {
	const { t } = useTranslation();

	return (
		<div className="py-12 text-center">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
				<Calendar className="h-8 w-8 text-accent" strokeWidth={2} />
			</div>
			<h3 className="mb-2 font-semibold! text-[18px]! text-foreground">
				{t("no_entries_found", "Записей не найдено")}
			</h3>
			<p className="text-[14px]! text-muted-foreground">
				{hasFilters
					? t("try_change_filters", "Попробуйте изменить фильтры")
					: t("create_first_entry", "Создайте первую запись")}
			</p>
		</div>
	);
}
