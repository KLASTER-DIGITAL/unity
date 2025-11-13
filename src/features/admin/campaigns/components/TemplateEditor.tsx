/**
 * Template Editor Component
 *
 * Editor for push notification content with i18n support
 * Features:
 * - Multi-language editing (7 languages: ru/en/es/de/fr/zh/ja)
 * - Preview
 * - Icon/badge/image upload
 */

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';

interface CampaignData {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	translations: Record<string, { title: string; body: string }>;
}

interface TemplateEditorProps {
	data: CampaignData;
	onChange: (data: CampaignData) => void;
	validationErrors?: Record<string, string>;
	onValidate?: (field: 'title' | 'body', value: string) => void;
}

const LANGUAGES = [
	{ code: 'ru', name: 'Русский' },
	{ code: 'en', name: 'English' },
	{ code: 'es', name: 'Español' },
	{ code: 'de', name: 'Deutsch' },
	{ code: 'fr', name: 'Français' },
	{ code: 'zh', name: '中文' },
	{ code: 'ja', name: '日本語' },
];

export function TemplateEditor({
	data,
	onChange,
	validationErrors = {},
	onValidate,
}: TemplateEditorProps) {
	const [activeLanguage, setActiveLanguage] = useState('ru');

	const handleDefaultChange = (field: keyof CampaignData, value: string) => {
		onChange({
			...data,
			[field]: value,
		});

		// Trigger validation
		if (onValidate && (field === 'title' || field === 'body')) {
			onValidate(field, value);
		}
	};

	const handleTranslationChange = (lang: string, field: 'title' | 'body', value: string) => {
		const translations = { ...data.translations };
		if (!translations[lang]) {
			translations[lang] = { title: '', body: '' };
		}
		translations[lang][field] = value;

		onChange({
			...data,
			translations,
		});
	};

	return (
		<div className="space-y-6">
			{/* Default Content (Russian) */}
			<Card>
				<CardHeader>
					<CardTitle>Основной контент (Русский)</CardTitle>
					<CardDescription>Этот контент будет использоваться по умолчанию</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Заголовок *</Label>
						<Input
							id="title"
							value={data.title}
							onChange={(e) => handleDefaultChange('title', e.target.value)}
							placeholder="Введите заголовок уведомления"
							maxLength={50}
							className={validationErrors.title ? 'border-destructive' : ''}
						/>
						{validationErrors.title ? (
							<p className="text-sm text-destructive">{validationErrors.title}</p>
						) : (
							<p className="text-sm text-muted-foreground">{data.title.length}/50 символов</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="body">Текст *</Label>
						<Textarea
							id="body"
							value={data.body}
							onChange={(e) => handleDefaultChange('body', e.target.value)}
							placeholder="Введите текст уведомления"
							rows={4}
							maxLength={200}
							className={validationErrors.body ? 'border-destructive' : ''}
						/>
						{validationErrors.body ? (
							<p className="text-sm text-destructive">{validationErrors.body}</p>
						) : (
							<p className="text-sm text-muted-foreground">{data.body.length}/200 символов</p>
						)}
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="icon">Иконка URL</Label>
							<Input
								id="icon"
								value={data.icon || ''}
								onChange={(e) => handleDefaultChange('icon', e.target.value)}
								placeholder="/icon-192x192.png"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="badge">Badge URL</Label>
							<Input
								id="badge"
								value={data.badge || ''}
								onChange={(e) => handleDefaultChange('badge', e.target.value)}
								placeholder="/badge-72x72.png"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="image">Изображение URL</Label>
							<Input
								id="image"
								value={data.image || ''}
								onChange={(e) => handleDefaultChange('image', e.target.value)}
								placeholder="https://..."
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Translations */}
			<Card>
				<CardHeader>
					<CardTitle>Переводы</CardTitle>
					<CardDescription>Добавьте переводы для других языков (опционально)</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
						<TabsList className="grid w-full grid-cols-7">
							{LANGUAGES.map((lang) => (
								<TabsTrigger key={lang.code} value={lang.code}>
									{lang.name}
								</TabsTrigger>
							))}
						</TabsList>

						{LANGUAGES.map((lang) => (
							<TabsContent key={lang.code} value={lang.code} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor={`title-${lang.code}`}>Заголовок ({lang.name})</Label>
									<Input
										id={`title-${lang.code}`}
										value={data.translations[lang.code]?.title || ''}
										onChange={(e) => handleTranslationChange(lang.code, 'title', e.target.value)}
										placeholder={`Перевод заголовка на ${lang.name.toLowerCase()}`}
										maxLength={50}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`body-${lang.code}`}>Текст ({lang.name})</Label>
									<Textarea
										id={`body-${lang.code}`}
										value={data.translations[lang.code]?.body || ''}
										onChange={(e) => handleTranslationChange(lang.code, 'body', e.target.value)}
										placeholder={`Перевод текста на ${lang.name.toLowerCase()}`}
										rows={4}
										maxLength={200}
									/>
								</div>
							</TabsContent>
						))}
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
