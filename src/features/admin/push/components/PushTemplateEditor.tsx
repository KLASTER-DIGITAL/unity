/**
 * Push Template Editor Component
 *
 * Editor for push notification templates with Premium/AI settings
 * Features:
 * - Template type selection
 * - Multi-language editing (7 languages: ru/en/es/de/fr/zh/ja)
 * - Premium/AI toggles
 * - Variables support
 * - AI settings configuration
 */

import { Crown, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/universal/Button';

interface TemplateData {
	id?: string;
	type: string;
	title: string;
	body: string;
	icon?: string;
	is_premium_only: boolean;
	is_ai_enabled: boolean;
	variables: string[];
	translations: Record<string, { title: string; body: string }>;
	ai_settings?: {
		tone?: string;
		use_behavior_analysis?: boolean;
		use_mood_analysis?: boolean;
		max_length?: number;
	};
	description?: string;
	is_active: boolean;
}

interface PushTemplateEditorProps {
	template?: TemplateData;
	onSave: (data: TemplateData) => void;
	onCancel: () => void;
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

const TEMPLATE_TYPES = [
	{ value: 'daily_reminder', label: 'Daily Reminder' },
	{ value: 'weekly_motivation', label: 'Weekly Motivation' },
	{ value: 'goal_reminder', label: 'Goal Reminder' },
	{ value: 'streak_milestone', label: 'Streak Milestone' },
	{ value: 'achievement_unlocked', label: 'Achievement Unlocked' },
	{ value: 'entry_created', label: 'Entry Created' },
	{ value: 'trial_expiry_reminder', label: 'Trial Expiry Reminder' },
	{ value: 'subscription_expired', label: 'Subscription Expired' },
	{ value: 'custom', label: 'Custom' },
];

const AI_TONES = [
	{ value: 'motivational', label: 'Motivational' },
	{ value: 'friendly', label: 'Friendly' },
	{ value: 'professional', label: 'Professional' },
	{ value: 'casual', label: 'Casual' },
	{ value: 'encouraging', label: 'Encouraging' },
];

export function PushTemplateEditor({ template, onSave, onCancel }: PushTemplateEditorProps) {
	const [data, setData] = useState<TemplateData>(
		template || {
			type: 'custom',
			title: '',
			body: '',
			icon: '/icon-192.png',
			is_premium_only: false,
			is_ai_enabled: false,
			variables: [],
			translations: {},
			ai_settings: {
				tone: 'motivational',
				use_behavior_analysis: false,
				use_mood_analysis: false,
				max_length: 120,
			},
			is_active: true,
		}
	);

	const [activeLanguage, setActiveLanguage] = useState('ru');
	const [newVariable, setNewVariable] = useState('');

	const handleChange = (field: keyof TemplateData, value: string | boolean | string[]) => {
		setData({ ...data, [field]: value });
	};

	const handleTranslationChange = (lang: string, field: 'title' | 'body', value: string) => {
		const translations = { ...data.translations };
		if (!translations[lang]) {
			translations[lang] = { title: '', body: '' };
		}
		translations[lang][field] = value;
		setData({ ...data, translations });
	};

	const handleAISettingChange = (field: string, value: string | boolean | number) => {
		setData({
			...data,
			ai_settings: {
				...data.ai_settings,
				[field]: value,
			},
		});
	};

	const addVariable = () => {
		if (newVariable && !data.variables.includes(newVariable)) {
			setData({ ...data, variables: [...data.variables, newVariable] });
			setNewVariable('');
		}
	};

	const removeVariable = (variable: string) => {
		setData({ ...data, variables: data.variables.filter((v) => v !== variable) });
	};

	const handleSubmit = () => {
		// Validation
		if (!data.title.trim() || !data.body.trim()) {
			alert('Заголовок и текст обязательны');
			return;
		}
		onSave(data);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl">
						{template ? 'Редактировать шаблон' : 'Создать шаблон'}
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Настройте шаблон push уведомления с поддержкой Premium и AI
					</p>
				</div>
			</div>

			{/* Template Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Настройки шаблона</CardTitle>
					<CardDescription>Основные параметры шаблона</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Type */}
					<div className="space-y-2">
						<Label htmlFor="type">Тип шаблона *</Label>
						<Select value={data.type} onValueChange={(value) => handleChange('type', value)}>
							<SelectTrigger id="type">
								<SelectValue placeholder="Выберите тип" />
							</SelectTrigger>
							<SelectContent>
								{TEMPLATE_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Описание</Label>
						<Input
							id="description"
							value={data.description || ''}
							onChange={(e) => handleChange('description', e.target.value)}
							placeholder="Краткое описание шаблона"
						/>
					</div>

					{/* Premium/AI Toggles */}
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<div className="flex items-center gap-2">
								<Crown className="h-4 w-4 text-yellow-500" />
								<Label htmlFor="is_premium">Premium Only</Label>
							</div>
							<p className="text-muted-foreground text-sm">
								Доступно только для Premium пользователей
							</p>
						</div>
						<Switch
							id="is_premium"
							checked={data.is_premium_only}
							onCheckedChange={(checked) => handleChange('is_premium_only', checked)}
						/>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-purple-500" />
								<Label htmlFor="is_ai">AI Персонализация</Label>
							</div>
							<p className="text-muted-foreground text-sm">
								Использовать AI для персонализации контента
							</p>
						</div>
						<Switch
							id="is_ai"
							checked={data.is_ai_enabled}
							onCheckedChange={(checked) => handleChange('is_ai_enabled', checked)}
						/>
					</div>

					{/* Active Toggle */}
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label htmlFor="is_active">Активен</Label>
							<p className="text-muted-foreground text-sm">Шаблон доступен для использования</p>
						</div>
						<Switch
							id="is_active"
							checked={data.is_active}
							onCheckedChange={(checked) => handleChange('is_active', checked)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Content */}
			<Card>
				<CardHeader>
					<CardTitle>Контент (Русский)</CardTitle>
					<CardDescription>Основной контент шаблона</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Заголовок *</Label>
						<Input
							id="title"
							value={data.title}
							onChange={(e) => handleChange('title', e.target.value)}
							placeholder="Введите заголовок"
							maxLength={50}
						/>
						<p className="text-muted-foreground text-sm">{data.title.length}/50 символов</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="body">Текст *</Label>
						<Textarea
							id="body"
							value={data.body}
							onChange={(e) => handleChange('body', e.target.value)}
							placeholder="Введите текст уведомления"
							rows={4}
							maxLength={200}
						/>
						<p className="text-muted-foreground text-sm">{data.body.length}/200 символов</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="icon">Иконка URL</Label>
						<Input
							id="icon"
							value={data.icon || ''}
							onChange={(e) => handleChange('icon', e.target.value)}
							placeholder="/icon-192.png"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Variables */}
			<Card>
				<CardHeader>
					<CardTitle>Переменные</CardTitle>
					<CardDescription>
						Динамические переменные для персонализации (например: user_name, streak_count)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							value={newVariable}
							onChange={(e) => setNewVariable(e.target.value)}
							placeholder="Название переменной (например: user_name)"
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addVariable();
								}
							}}
						/>
						<Button onClick={addVariable} size="sm">
							<Plus className="h-4 w-4" />
						</Button>
					</div>

					{data.variables.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{data.variables.map((variable) => (
								<Badge key={variable} variant="secondary" className="gap-1">
									{variable}
									<button
										type="button"
										onClick={() => removeVariable(variable)}
										className="ml-1 rounded-full hover:bg-muted"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					<p className="text-muted-foreground text-sm">
						Используйте переменные в тексте: {'{'}variable_name{'}'}
					</p>
				</CardContent>
			</Card>

			{/* AI Settings */}
			{data.is_ai_enabled && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-purple-500" />
							AI Настройки
						</CardTitle>
						<CardDescription>Параметры AI персонализации</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="tone">Тон сообщения</Label>
							<Select
								value={data.ai_settings?.tone || 'motivational'}
								onValueChange={(value) => handleAISettingChange('tone', value)}
							>
								<SelectTrigger id="tone">
									<SelectValue placeholder="Выберите тон" />
								</SelectTrigger>
								<SelectContent>
									{AI_TONES.map((tone) => (
										<SelectItem key={tone.value} value={tone.value}>
											{tone.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<Label>Анализ поведения</Label>
								<p className="text-muted-foreground text-sm">
									Учитывать паттерны активности пользователя
								</p>
							</div>
							<Switch
								checked={data.ai_settings?.use_behavior_analysis || false}
								onCheckedChange={(checked) =>
									handleAISettingChange('use_behavior_analysis', checked)
								}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<Label>Анализ настроения</Label>
								<p className="text-muted-foreground text-sm">
									Адаптировать тон под настроение пользователя
								</p>
							</div>
							<Switch
								checked={data.ai_settings?.use_mood_analysis || false}
								onCheckedChange={(checked) => handleAISettingChange('use_mood_analysis', checked)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="max_length">Максимальная длина (символов)</Label>
							<Input
								id="max_length"
								type="number"
								value={data.ai_settings?.max_length || 120}
								onChange={(e) =>
									handleAISettingChange('max_length', Number.parseInt(e.target.value, 10))
								}
								min={50}
								max={200}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Translations */}
			<Card>
				<CardHeader>
					<CardTitle>Переводы</CardTitle>
					<CardDescription>Переводы на 7 языков (опционально)</CardDescription>
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

			{/* Actions */}
			<div className="flex justify-end gap-4">
				<Button variant="outline" onClick={onCancel}>
					Отмена
				</Button>
				<Button onClick={handleSubmit}>
					{template ? 'Сохранить изменения' : 'Создать шаблон'}
				</Button>
			</div>
		</div>
	);
}
