import { AlertCircle, Languages as LanguagesIcon, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type {
	Language,
	MissingTranslation,
	Translation,
	TranslationsManagementTabProps,
} from './translations-management';
// Import modular components and utilities
import {
	AutoTranslateTab,
	autoTranslate,
	calculateStats,
	filterTranslations,
	loadLanguages,
	loadMissingKeys,
	loadTranslations,
	MissingTab,
	StatsCards,
	saveTranslation,
	TranslationsTab,
} from './translations-management';

// Re-export types for backward compatibility
export type { TranslationsManagementTabProps };

export function TranslationsManagementTab({
	initialLanguage,
}: TranslationsManagementTabProps = {}) {
	const [translations, setTranslations] = useState<Translation[]>([]);
	const [languages, setLanguages] = useState<Language[]>([]);
	const [missingKeys, setMissingKeys] = useState<MissingTranslation[]>([]);
	const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage || 'ru');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('translations');

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadData is stable
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
				loadMissingKeys(),
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
				toast.success(`✅ ${result.message}\nСтоимость: $${result.totalCost}`, {
					duration: 5000,
				});
			}
		}
	};

	const filteredTranslations = filterTranslations(translations, selectedLanguage, searchQuery);
	const uniqueKeys = [...new Set(translations.map((t) => t.translation_key))];
	const translationStats = calculateStats(translations, languages, missingKeys);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-2xl text-foreground">Управление переводами</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Редактирование и управление переводами приложения
					</p>
				</div>
				<Button disabled={isLoading} onClick={loadData} variant="outline">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка...
						</>
					) : (
						<>🔄 Обновить</>
					)}
				</Button>
			</div>

			{/* Stats Cards */}
			<StatsCards stats={translationStats} />

			{/* Main Content */}
			<Tabs onValueChange={setActiveTab} value={activeTab}>
				<TabsList>
					<TabsTrigger value="translations">
						<LanguagesIcon className="mr-2 h-4 w-4" />
						Переводы
					</TabsTrigger>
					<TabsTrigger value="missing">
						<AlertCircle className="mr-2 h-4 w-4" />
						Пропущенные ({missingKeys.length})
					</TabsTrigger>
					<TabsTrigger value="auto-translate">
						<Sparkles className="mr-2 h-4 w-4" />
						Автоперевод AI
					</TabsTrigger>
				</TabsList>

				<TranslationsTab
					languages={languages}
					onLanguageChange={setSelectedLanguage}
					onSaveTranslation={handleSaveTranslation}
					onSearchChange={setSearchQuery}
					searchQuery={searchQuery}
					selectedLanguage={selectedLanguage}
					translations={filteredTranslations}
					uniqueKeysCount={uniqueKeys.length}
				/>

				<MissingTab languages={languages} missingKeys={missingKeys} />

				<AutoTranslateTab languages={languages} onAutoTranslate={handleAutoTranslate} />
			</Tabs>
		</div>
	);
}
