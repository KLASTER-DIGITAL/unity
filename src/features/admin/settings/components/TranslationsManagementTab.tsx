import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Loader2, Languages as LanguagesIcon, AlertCircle, Sparkles } from 'lucide-react';

// Import modular components and utilities
import {
  StatsCards,
  TranslationsTab,
  MissingTab,
  AutoTranslateTab,
  loadTranslations,
  loadLanguages,
  loadMissingKeys,
  saveTranslation,
  autoTranslate,
  filterTranslations,
  calculateStats
} from './translations-management';
import type {
  Translation,
  Language,
  MissingTranslation,
  TranslationsManagementTabProps
} from './translations-management';

// Re-export types for backward compatibility
export type { TranslationsManagementTabProps };

export function TranslationsManagementTab({ initialLanguage }: TranslationsManagementTabProps = {}) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [missingKeys, setMissingKeys] = useState<MissingTranslation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage || 'ru');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('translations');

  useEffect(() => {
    loadData();
  }, []);

  // Update selected language when initialLanguage prop changes
  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [translationsData, languagesData, missingKeysData] = await Promise.all([
        loadTranslations(),
        loadLanguages(),
        loadMissingKeys()
      ]);
      setTranslations(translationsData);
      setLanguages(languagesData);
      setMissingKeys(missingKeysData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTranslation = async (key: string, value: string) => {
    const success = await saveTranslation(key, selectedLanguage, value);
    if (success) {
      const translationsData = await loadTranslations();
      setTranslations(translationsData);
    }
  };

  const handleAutoTranslate = async (sourceLanguage: string, targetLanguages: string[]) => {
    const result = await autoTranslate(sourceLanguage, targetLanguages);
    if (result.success) {
      await loadData();
      if (result.message && result.totalCost !== undefined) {
        toast.success(
          `✅ ${result.message}\nСтоимость: $${result.totalCost}`,
          { duration: 5000 }
        );
      }
    }
  };

  const filteredTranslations = filterTranslations(translations, selectedLanguage, searchQuery);
  const uniqueKeys = [...new Set(translations.map(t => t.translation_key))];
  const translationStats = calculateStats(translations, languages, missingKeys);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Управление переводами</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Редактирование и управление переводами приложения
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading} variant="outline">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Загрузка...</>
          ) : (
            <>🔄 Обновить</>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={translationStats} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="translations">
            <LanguagesIcon className="w-4 h-4 mr-2" />
            Переводы
          </TabsTrigger>
          <TabsTrigger value="missing">
            <AlertCircle className="w-4 h-4 mr-2" />
            Пропущенные ({missingKeys.length})
          </TabsTrigger>
          <TabsTrigger value="auto-translate">
            <Sparkles className="w-4 h-4 mr-2" />
            Автоперевод AI
          </TabsTrigger>
        </TabsList>

        <TranslationsTab
          translations={filteredTranslations}
          languages={languages}
          selectedLanguage={selectedLanguage}
          searchQuery={searchQuery}
          uniqueKeysCount={uniqueKeys.length}
          onLanguageChange={setSelectedLanguage}
          onSearchChange={setSearchQuery}
          onSaveTranslation={handleSaveTranslation}
        />

        <MissingTab
          missingKeys={missingKeys}
          languages={languages}
        />

        <AutoTranslateTab
          languages={languages}
          onAutoTranslate={handleAutoTranslate}
        />
      </Tabs>
    </div>
  );
}

