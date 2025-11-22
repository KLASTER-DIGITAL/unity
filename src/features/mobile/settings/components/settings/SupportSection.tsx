/**
 * SettingsScreen - Support Section Component
 */

import { Bug, HelpCircle, MessageCircle, Smartphone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18n';
import { showFeedbackWidget } from '@/shared/lib/monitoring/sentry';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type SupportSectionProps = {
	onSupportClick: () => void;
	onRateAppClick: () => void;
	onFAQClick: () => void;
	onPWAInstallClick: () => void;
	t: (key: string, fallback?: string) => string;
};

export function SupportSection({
	onSupportClick,
	onRateAppClick,
	onFAQClick,
	onPWAInstallClick,
	t: _t,
}: SupportSectionProps) {
	const { t } = useTranslation();

	return (
		<SettingsSection title={t('settings.support.title', 'Поддержка')}>
			<SettingsRow
				description={t('settings.support.write_us', 'Напишите нам')}
				icon={MessageCircle}
				iconBgColor="bg-(--ios-blue)/10"
				iconColor="text-(--ios-blue)"
				onClick={onSupportClick}
				title={t('settings.support.contact', 'Связаться с поддержкой')}
			/>
			<SettingsRow
				description={t('settings.support.share_feedback', 'Поделитесь отзывом')}
				icon={Star}
				iconBgColor="bg-(--ios-yellow)/10"
				iconColor="text-(--ios-yellow)"
				onClick={onRateAppClick}
				title={t('settings.support.rate_app', 'Оценить приложение')}
			/>
			<SettingsRow
				description={t('settings.support.help_improve', 'Помогите улучшить приложение')}
				icon={Bug}
				iconBgColor="bg-(--ios-red)/10"
				iconColor="text-(--ios-red)"
				onClick={() => {
					try {
						// Открываем форму сразу в раскрытом состоянии
						showFeedbackWidget(true);
					} catch (error) {
						console.error('Failed to show feedback widget:', error);
						toast.error(
							t('settings.support.feedback_error', 'Не удалось открыть форму обратной связи')
						);
					}
				}}
				title={t('settings.support.report_bug', 'Сообщить об ошибке')}
			/>
			<SettingsRow
				description={t('settings.support.faq_description', 'Часто задаваемые вопросы')}
				icon={HelpCircle}
				iconBgColor="bg-(--ios-green)/10"
				iconColor="text-(--ios-green)"
				onClick={onFAQClick}
				title={t('settings.support.faq', 'FAQ')}
			/>
			<SettingsRow
				description={t('settings.support.pwa_to_home', 'PWA на главный экран')}
				icon={Smartphone}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onClick={onPWAInstallClick}
				title={t('settings.support.install_app', 'Установить приложение')}
			/>
		</SettingsSection>
	);
}
