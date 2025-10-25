/**
 * SettingsScreen - Additional Section Component
 */

import { Globe, Calendar, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SettingsRow, SettingsSection } from "../SettingsRow";

interface AdditionalSectionProps {
  currentLanguage?: string;
  languageName: string;
  firstDayOfWeek?: string;
  onLanguageClick: () => void;
  t: any;
}

export function AdditionalSection({
  currentLanguage: _currentLanguage,
  languageName,
  firstDayOfWeek,
  onLanguageClick,
  t
}: AdditionalSectionProps) {
  return (
    <SettingsSection title={t.additional || "Дополнительно"}>
      <SettingsRow
        icon={Globe}
        iconColor="text-[var(--ios-indigo)]"
        iconBgColor="bg-[var(--ios-indigo)]/10"
        title={t.language || "Язык"}
        description={languageName}
        onClick={onLanguageClick}
      />
      <SettingsRow
        icon={Calendar}
        iconColor="text-[var(--ios-blue)]"
        iconBgColor="bg-[var(--ios-blue)]/10"
        title={t.firstDayOfWeek || "Первый день недели"}
        description={firstDayOfWeek === 'monday' ? 'Понедельник' : 'Воскресенье'}
        onClick={() => toast.info('Feature coming soon')}
      />
      <SettingsRow
        icon={Download}
        iconColor="text-[var(--ios-green)]"
        iconBgColor="bg-[var(--ios-green)]/10"
        title={t.exportData || "Экспортировать данные"}
        description="JSON, CSV, ZIP"
        onClick={() => toast.info('Feature coming soon')}
      />
      <SettingsRow
        icon={Upload}
        iconColor="text-[var(--ios-purple)]"
        iconBgColor="bg-[var(--ios-purple)]/10"
        title={t.importData || "Импортировать данные"}
        description="Восстановить из файла"
        onClick={() => toast.info('Feature coming soon')}
      />
      <SettingsRow
        icon={Trash2}
        iconColor="text-[var(--ios-red)]"
        iconBgColor="bg-[var(--ios-red)]/10"
        title={t.deleteAllData || "Удалить все данные"}
        description="Необратимое действие"
        onClick={() => toast.error('Требуется подтверждение')}
      />
    </SettingsSection>
  );
}

