import { TranslationsManagementTab } from '../TranslationsManagementTab';

type TranslationsManagementContentProps = {
	initialLanguage?: string;
};

export function TranslationsManagementContent({
	initialLanguage,
}: TranslationsManagementContentProps = {}) {
	return <TranslationsManagementTab initialLanguage={initialLanguage} />;
}
