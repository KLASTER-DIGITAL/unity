import { LanguagesManagementTab } from '../LanguagesManagementTab';

type LanguagesManagementContentProps = {
	onNavigateToTranslations?: (languageCode: string) => void;
};

export function LanguagesManagementContent({
	onNavigateToTranslations,
}: LanguagesManagementContentProps = {}) {
	return <LanguagesManagementTab onNavigateToTranslations={onNavigateToTranslations} />;
}
