import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { loadTranslations } from '../translations-management/api';
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

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const translationsData = await loadTranslations();

			// Get all unique keys from all translations (русский язык имеет все ключи)
			const allKeys = Array.from(new Set(translationsData.map((t) => t.translation_key)));

			// Filter translations for this language
			const languageTranslations = translationsData.filter((t) => t.lang_code === language.code);
			setTranslations(languageTranslations);

			// Find missing keys for this language
			const translatedKeys = new Set(languageTranslations.map((t) => t.translation_key));
			const missing = allKeys.filter((key) => !translatedKeys.has(key));
			setMissingKeys(missing);
		} finally {
			setIsLoading(false);
		}
	}, [language.code]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleAutoTranslate = async () => {
		if (missingKeys.length === 0) {
			toast.info('Нет пропущенных ключей для перевода');
			return;
		}

		setIsTranslating(true);
		try {
			// Get session token
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			console.log('🔑 Session token:', `${session.access_token.substring(0, 50)}...`);
			console.log('👤 User ID:', session.user.id);

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-translate`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						sourceLanguage: 'ru',
						targetLanguages: [language.code],
					}),
				}
			);

			console.log('📡 Response status:', response.status);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('❌ Error response:', errorData);
				throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
			}

			const result = await response.json();
			console.log('✅ Success:', result);
			toast.success(`Переведено ${result.translated || 0} ключей для ${language.native_name}`);
			await loadData(); // Reload data
		} catch (error) {
			console.error('Auto-translate error:', error);
			toast.error(
				`Ошибка автоперевода: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsTranslating(false);
		}
	};

	const filteredTranslations = translations.filter(
		(t) =>
			t.translation_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
			t.translation_value.toLowerCase().includes(searchQuery.toLowerCase())
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
						<Card className="p-4" key={translation.translation_key}>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="font-medium text-sm">{translation.translation_key}</div>
									<div className="mt-1 text-muted-foreground">{translation.translation_value}</div>
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
