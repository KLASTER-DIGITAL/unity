import { AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LottiePreloaderInline } from '@/shared/components/LottiePreloader';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { TabsContent } from '@/shared/components/ui/tabs';
import { Select } from '@/shared/components/ui/universal/Select.web';
import type { Language } from './types';

type AutoTranslateTabProps = {
	languages: Language[];
	onAutoTranslate: (sourceLanguage: string, targetLanguages: string[]) => Promise<void>;
};

/**
 * Auto Translate Tab Component
 * AI-powered automatic translation interface
 */
export function AutoTranslateTab({ languages, onAutoTranslate }: AutoTranslateTabProps) {
	const [isTranslating, setIsTranslating] = useState(false);
	const [autoTranslateSource, setAutoTranslateSource] = useState<string>('ru');
	const [autoTranslateTargets, setAutoTranslateTargets] = useState<string[]>([]);

	const handleAutoTranslate = async () => {
		setIsTranslating(true);
		try {
			await onAutoTranslate(autoTranslateSource, autoTranslateTargets);
		} finally {
			setIsTranslating(false);
		}
	};

	const toggleTargetLanguage = (code: string) => {
		setAutoTranslateTargets((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		);
	};

	return (
		<TabsContent className="space-y-4" value="auto-translate">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-yellow-500" />
						Автоматический перевод через AI
					</CardTitle>
					<CardDescription>
						Используйте GPT-4o-mini для автоматического перевода пропущенных ключей
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Source Language */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Исходный язык</label>
						<Select
							onValueChange={setAutoTranslateSource}
							options={languages
								.filter((l) => l.enabled)
								.map((lang) => ({
									value: lang.code,
									label: `${lang.native_name} (${lang.code})`,
								}))}
							placeholder="Выберите исходный язык"
							value={autoTranslateSource}
						/>
					</div>

					{/* Target Languages */}
					<div className="space-y-2">
						<label className="font-medium text-sm">Целевые языки</label>
						<div className="flex flex-wrap gap-2">
							{languages
								.filter((l) => l.enabled && l.code !== autoTranslateSource)
								.map((lang) => (
									<Button
										key={lang.code}
										onClick={() => toggleTargetLanguage(lang.code)}
										size="sm"
										variant={autoTranslateTargets.includes(lang.code) ? 'default' : 'outline'}
									>
										{lang.native_name}
									</Button>
								))}
						</div>
						{autoTranslateTargets.length > 0 && (
							<p className="text-muted-foreground text-sm">
								Выбрано языков: {autoTranslateTargets.length}
							</p>
						)}
					</div>

					{/* Info */}
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
						<div className="flex gap-3">
							<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
							<div className="space-y-1 text-sm">
								<p className="font-medium text-blue-900 dark:text-blue-100">
									Как работает автоперевод:
								</p>
								<ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300">
									<li>Переводятся только пропущенные ключи (не перезаписывает существующие)</li>
									<li>Используется модель GPT-4o-mini ($0.15/1M входных токенов)</li>
									<li>Обработка батчами по 10 ключей за раз</li>
									<li>Стоимость логируется в таблицу openai_usage</li>
									<li>Сохраняются эмодзи и специальные символы</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Action Button */}
					<Button
						className="w-full"
						disabled={isTranslating || !autoTranslateSource || autoTranslateTargets.length === 0}
						onClick={handleAutoTranslate}
						size="lg"
					>
						{isTranslating ? (
							<>
								<LottiePreloaderInline size="sm" />
								<span className="ml-2">Перевод в процессе...</span>
							</>
						) : (
							<>
								<Sparkles className="mr-2 h-4 w-4" />
								Запустить автоперевод
							</>
						)}
					</Button>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
