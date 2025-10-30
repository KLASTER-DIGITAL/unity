/**
 * SettingsScreen - Support Section Component
 */

import { Bug, HelpCircle, MessageCircle, Smartphone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { showFeedbackWidget } from '@/shared/lib/monitoring/sentry';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type SupportSectionProps = {
	onSupportClick: () => void;
	onRateAppClick: () => void;
	onFAQClick: () => void;
	onPWAInstallClick: () => void;
	t: any;
};

export function SupportSection({
	onSupportClick,
	onRateAppClick,
	onFAQClick,
	onPWAInstallClick,
	t,
}: SupportSectionProps) {
	return (
		<SettingsSection title={t.support || 'Поддержка'}>
			<SettingsRow
				description="Напишите нам"
				icon={MessageCircle}
				iconBgColor="bg-[var(--ios-blue)]/10"
				iconColor="text-[var(--ios-blue)]"
				onClick={onSupportClick}
				title={t.contactSupport || 'Связаться с поддержкой'}
			/>
			<SettingsRow
				description="Поделитесь отзывом"
				icon={Star}
				iconBgColor="bg-[var(--ios-yellow)]/10"
				iconColor="text-[var(--ios-yellow)]"
				onClick={onRateAppClick}
				title={t.rateApp || 'Оценить приложение'}
			/>
			<SettingsRow
				description="Помогите улучшить приложение"
				icon={Bug}
				iconBgColor="bg-[var(--ios-red)]/10"
				iconColor="text-[var(--ios-red)]"
				onClick={() => {
					try {
						// Открываем форму сразу в раскрытом состоянии
						showFeedbackWidget(true);
					} catch (error) {
						console.error('Failed to show feedback widget:', error);
						toast.error('Не удалось открыть форму обратной связи');
					}
				}}
				title="Сообщить об ошибке"
			/>
			<SettingsRow
				description="Часто задаваемые вопросы"
				icon={HelpCircle}
				iconBgColor="bg-[var(--ios-green)]/10"
				iconColor="text-[var(--ios-green)]"
				onClick={onFAQClick}
				title={t.faq || 'FAQ'}
			/>
			<SettingsRow
				description="PWA на главный экран"
				icon={Smartphone}
				iconBgColor="bg-[var(--ios-purple)]/10"
				iconColor="text-[var(--ios-purple)]"
				onClick={onPWAInstallClick}
				title={t.installPWA || 'Установить приложение'}
			/>
		</SettingsSection>
	);
}
