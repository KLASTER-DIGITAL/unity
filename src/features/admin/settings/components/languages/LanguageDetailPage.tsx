import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { loadMissingKeys, loadTranslations } from '../translations-management/api';
import type { Language, Translation } from '../translations-management/types';

interface LanguageDetailPageProps {
	language: Language;
	onBack: () => void;
}

export function LanguageDetailPage({ language, onBack }: LanguageDetailPageProps) {
	const [translations, setTranslations] = useState<Translation[]>([]);
	const [missingKeys, setMissingKeys] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isTranslating, setIsTranslating] = useState(false);

	useEffect(() => {
		loadData();
	}, [language.code]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			const [translationsData, missingKeysData] = await Promise.all([
				loadTranslations(),
				loadMissingKeys(),
			]);

			// Filter translations for this language
			const languageTranslations = translationsData.filter(
				(t) => t.language_code === language.code
			);
			setTranslations(languageTranslations);

			// Filter missing keys for this language
			const languageMissingKeys = missingKeysData.filter(
				(mk) => mk.language_code === language.code
			);
			setMissingKeys(languageMissingKeys.map((mk) => mk.key));
		} finally {
			setIsLoading(false);
		}
	};

	const handleAutoTranslate = async () => {
		if (missingKeys.length === 0) {
			toast.info('Нет пропущенных ключей для перевода');
			return;
		}

		setIsTranslating(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-translate`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
					},
					body: JSON.stringify({
						sourceLanguage: 'ru',
						targetLanguages: [language.code],
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result = await response.json();
			toast.success(`Переведено ${result.translated || 0} ключей для ${language.native_name}`);
			await loadData(); // Reload data
		} catch (error) {
			console.error('Auto-translate error:', error);
			toast.error('Ошибка автоперевода');
		} finally {
			setIsTranslating(false);
		}
	};

	const filteredTranslations = translations.filter(
		(t) =>
			t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.value.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalKeys = translations.length + missingKeys.length;
	const progress = totalKeys > 0 ? Math.round((translations.length / totalKeys) * 100) : 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button onClick={onBack} size="sm" variant="ghost">
						<ArrowLeft className="mr-2 size-4" />
						Назад к языкам
					</Button>
					<div>
						<h2 className="font-semibold text-2xl">
							{language.flag} {language.native_name}
						</h2>
						<p className="text-muted-foreground text-sm">{language.name}</p>
					</div>
				</div>
				<Button disabled={isTranslating || missingKeys.length === 0} onClick={handleAutoTranslate}>
					<Sparkles className="mr-2 size-4" />
					{isTranslating ? 'Перевод...' : `Автоперевод (${missingKeys.length})`}
				</Button>
			</div>

			{/* Statistics */}
			<div className="gap-4 grid grid-cols-1 md:grid-cols-4">
				<Card className="p-4">
					<div className="font-medium text-muted-foreground text-sm">Всего ключей</div>
					<div className="font-bold text-2xl">{totalKeys}</div>
				</Card>
				<Card className="p-4">
					<div className="font-medium text-muted-foreground text-sm">Переведено</div>
					<div className="font-bold text-2xl">{translations.length}</div>
				</Card>
				<Card className="p-4">
					<div className="font-medium text-muted-foreground text-sm">Пропущено</div>
					<div className="font-bold text-2xl text-orange-600">{missingKeys.length}</div>
				</Card>
				<Card className="p-4">
					<div className="font-medium text-muted-foreground text-sm">Прогресс</div>
					<div className="font-bold text-2xl text-green-600">{progress}%</div>
				</Card>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="top-3 left-3 absolute size-4 text-muted-foreground" />
				<Input
					className="pl-10"
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Поиск по ключу или значению..."
					value={searchQuery}
				/>
			</div>

			{/* Translations List */}
			{isLoading ? (
				<div className="py-8 text-center">Загрузка...</div>
			) : (
				<div className="space-y-2">
					{filteredTranslations.map((translation) => (
						<Card className="p-4" key={translation.key}>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="font-medium text-sm">{translation.key}</div>
									<div className="mt-1 text-muted-foreground">{translation.value}</div>
								</div>
								<Button size="sm" variant="outline">
									Редактировать
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
