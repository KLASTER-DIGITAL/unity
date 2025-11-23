/**
 * Секция "UNITY" в настройках
 *
 * Показывает:
 * - "О проекте" - ссылка на сайт
 * - "Что нового" - модальное окно со всеми изменениями
 */

import { ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { WhatsNewModal } from '@/shared/components/version/WhatsNewModal';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type AboutSectionProps = {
	t: (key: string, fallback?: string) => string;
};

export function AboutSection({ t }: AboutSectionProps) {
	const [showWhatsNew, setShowWhatsNew] = useState(false);

	const handleAboutClick = () => {
		window.open('https://unity-ai-self-46.aura.build/', '_blank', 'noopener,noreferrer');
	};

	return (
		<>
			<SettingsSection title={t('about.title', 'UNITY')}>
				{/* О проекте - ссылка на сайт */}
				<SettingsRow
					description="unity-ai-self-46.aura.build"
					icon={ExternalLink}
					iconBgColor="bg-(--ios-blue)/10"
					iconColor="text-(--ios-blue)"
					onClick={handleAboutClick}
					title={t('about.project', 'О проекте')}
				/>

				{/* Что нового - модальное окно */}
				<SettingsRow
					description={t('about.whats_new_description', 'Все изменения и обновления')}
					icon={Sparkles}
					iconBgColor="bg-(--ios-purple)/10"
					iconColor="text-(--ios-purple)"
					onClick={() => setShowWhatsNew(true)}
					title={t('about.whats_new', 'Что нового')}
				/>
			</SettingsSection>

			{/* Модальное окно "Что нового" - показывает все изменения */}
			<WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
		</>
	);
}
