/**
 * SettingsScreen - Additional Section Component
 */

import { Calendar, Download, Globe, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SettingsRow, SettingsSection } from "../SettingsRow";

type AdditionalSectionProps = {
	currentLanguage?: string;
	languageName: string;
	firstDayOfWeek?: string;
	onLanguageClick: () => void;
	t: any;
};

export function AdditionalSection({
	currentLanguage: _currentLanguage,
	languageName,
	firstDayOfWeek,
	onLanguageClick,
	t,
}: AdditionalSectionProps) {
	return (
		<SettingsSection title={t.additional || "Дополнительно"}>
			<SettingsRow
				description={languageName}
				icon={Globe}
				iconBgColor="bg-[var(--ios-indigo)]/10"
				iconColor="text-[var(--ios-indigo)]"
				onClick={onLanguageClick}
				title={t.language || "Язык"}
			/>
			<SettingsRow
				description={
					firstDayOfWeek === "monday" ? "Понедельник" : "Воскресенье"
				}
				icon={Calendar}
				iconBgColor="bg-[var(--ios-blue)]/10"
				iconColor="text-[var(--ios-blue)]"
				onClick={() => toast.info("Feature coming soon")}
				title={t.firstDayOfWeek || "Первый день недели"}
			/>
			<SettingsRow
				description="JSON, CSV, ZIP"
				icon={Download}
				iconBgColor="bg-[var(--ios-green)]/10"
				iconColor="text-[var(--ios-green)]"
				onClick={() => toast.info("Feature coming soon")}
				title={t.exportData || "Экспортировать данные"}
			/>
			<SettingsRow
				description="Восстановить из файла"
				icon={Upload}
				iconBgColor="bg-[var(--ios-purple)]/10"
				iconColor="text-[var(--ios-purple)]"
				onClick={() => toast.info("Feature coming soon")}
				title={t.importData || "Импортировать данные"}
			/>
			<SettingsRow
				description="Необратимое действие"
				icon={Trash2}
				iconBgColor="bg-[var(--ios-red)]/10"
				iconColor="text-[var(--ios-red)]"
				onClick={() => toast.error("Требуется подтверждение")}
				title={t.deleteAllData || "Удалить все данные"}
			/>
		</SettingsSection>
	);
}
