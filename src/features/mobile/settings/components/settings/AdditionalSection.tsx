/**
 * SettingsScreen - Additional Section Component
 */

import { Calendar, Download, Globe, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n';
import { DeleteAllDataDialog } from '../DeleteAllDataDialog';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type AdditionalSectionProps = {
	currentLanguage?: string;
	languageName: string;
	firstDayOfWeek?: string;
	onLanguageClick: () => void;
	userId: string;
	userEmail: string;
	t: any;
};

export function AdditionalSection({
	currentLanguage: _currentLanguage,
	languageName,
	firstDayOfWeek,
	onLanguageClick,
	userId,
	userEmail,
	t: _t,
}: AdditionalSectionProps) {
	const { t } = useTranslation();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	return (
		<>
			<SettingsSection title={t('settings.additional.title', 'Дополнительно')}>
				<SettingsRow
					description={languageName}
					icon={Globe}
					iconBgColor="bg-(--ios-indigo)/10"
					iconColor="text-(--ios-indigo)"
					onClick={onLanguageClick}
					title={t('settings.additional.language', 'Язык')}
				/>
				<SettingsRow
					description={
						firstDayOfWeek === 'monday' ? 'Понедельник' : t('settings.additional.sunday', 'Воскресенье')
					}
					icon={Calendar}
					iconBgColor="bg-(--ios-blue)/10"
					iconColor="text-(--ios-blue)"
					onClick={() => toast.info('Feature coming soon')}
					title={t('settings.additional.first_day_of_week', 'Первый день недели')}
				/>
				<SettingsRow
					description="JSON, CSV, ZIP"
					icon={Download}
					iconBgColor="bg-(--ios-green)/10"
					iconColor="text-(--ios-green)"
					onClick={() => toast.info('Feature coming soon')}
					title={t('settings.additional.export_data', 'Экспортировать данные')}
				/>
				<SettingsRow
					description={t('settings.additional.restore_from_file', 'Восстановить из файла')}
					icon={Upload}
					iconBgColor="bg-(--ios-purple)/10"
					iconColor="text-(--ios-purple)"
					onClick={() => toast.info('Feature coming soon')}
					title={t('settings.additional.import_data', 'Импортировать данные')}
				/>
				<SettingsRow
					description={t('settings.additional.irreversible_action', 'Необратимое действие')}
					icon={Trash2}
					iconBgColor="bg-(--ios-red)/10"
					iconColor="text-(--ios-red)"
					onClick={() => setShowDeleteDialog(true)}
					title={t('settings.additional.delete_all_data', 'Удалить все данные')}
				/>
			</SettingsSection>

			{/* Delete All Data Dialog */}
			<DeleteAllDataDialog
				onOpenChange={setShowDeleteDialog}
				open={showDeleteDialog}
				userEmail={userEmail}
				userId={userId}
			/>
		</>
	);
}
