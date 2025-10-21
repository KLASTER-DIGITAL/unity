import { TranslationsManagementTab } from '../TranslationsManagementTab';

interface TranslationsManagementContentProps {
  initialLanguage?: string;
}

export function TranslationsManagementContent({ initialLanguage }: TranslationsManagementContentProps = {}) {
  return <TranslationsManagementTab initialLanguage={initialLanguage} />;
}

