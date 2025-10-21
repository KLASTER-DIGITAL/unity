import { LanguagesManagementTab } from '../LanguagesManagementTab';

interface LanguagesManagementContentProps {
  onNavigateToTranslations?: (languageCode: string) => void;
}

export function LanguagesManagementContent({ onNavigateToTranslations }: LanguagesManagementContentProps = {}) {
  return <LanguagesManagementTab onNavigateToTranslations={onNavigateToTranslations} />;
}

