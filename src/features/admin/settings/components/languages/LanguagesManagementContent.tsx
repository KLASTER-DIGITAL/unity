// ✅ FIX: Pass onNavigateToTranslations prop to LazyLanguagesManagementTab
import { LazyLanguagesManagementTab } from '@/features/admin/dashboard/components/tabs/LazyTabs';

type LanguagesManagementContentProps = {
	onNavigateToTranslations?: (languageCode: string) => void;
};

export function LanguagesManagementContent({
	onNavigateToTranslations,
}: LanguagesManagementContentProps = {}) {
	return <LazyLanguagesManagementTab onNavigateToTranslations={onNavigateToTranslations} />;
}
