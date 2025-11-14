// ✅ PERFORMANCE: Use lazy loaded version from LazyTabs
import { LazyLanguagesManagementTab } from '@/features/admin/dashboard/components/tabs/LazyTabs';

type LanguagesManagementContentProps = {
	onNavigateToTranslations?: (languageCode: string) => void;
};

export function LanguagesManagementContent({
	onNavigateToTranslations,
}: LanguagesManagementContentProps = {}) {
	// Note: LazyLanguagesManagementTab doesn't accept props yet
	// This is a wrapper component, props will be passed through when needed
	return <LazyLanguagesManagementTab />;
}
