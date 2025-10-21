import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Languages, FileText, BarChart3 } from 'lucide-react';
import { LanguagesManagementContent } from './languages/LanguagesManagementContent';
import { TranslationsManagementContent } from './languages/TranslationsManagementContent';
import { TranslationsStatisticsContent } from './languages/TranslationsStatisticsContent';

interface LanguagesAndTranslationsTabProps {
  initialLanguage?: string;
}

export function LanguagesAndTranslationsTab({ initialLanguage }: LanguagesAndTranslationsTabProps = {}) {
  const [activeTab, setActiveTab] = useState('languages');
  const [selectedLanguageForTranslations, setSelectedLanguageForTranslations] = useState<string>(initialLanguage || 'ru');

  const handleNavigateToTranslations = (languageCode: string) => {
    setSelectedLanguageForTranslations(languageCode);
    setActiveTab('translations');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="w-6 h-6" />
          Языки и переводы
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление языками приложения и переводами интерфейса
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Языки
          </TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Переводы
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Статистика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="mt-6">
          <LanguagesManagementContent onNavigateToTranslations={handleNavigateToTranslations} />
        </TabsContent>

        <TabsContent value="translations" className="mt-6">
          <TranslationsManagementContent initialLanguage={selectedLanguageForTranslations} />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <TranslationsStatisticsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

