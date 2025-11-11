/**
 * Template Manager Component
 *
 * Управление шаблонами push уведомлений:
 * - Просмотр встроенных шаблонов для 7 языков
 * - Создание кастомных шаблонов (будущая функциональность)
 */

import { FileText, Globe, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

// Встроенные шаблоны для разных типов уведомлений
const BUILT_IN_TEMPLATES = [
	{
		id: 'streak_milestone',
		name: 'Достижение серии',
		description: 'Уведомление о достижении milestone серии',
		languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'],
		examples: {
			ru: {
				title: '🔥 {days} дней подряд!',
				body: 'Поздравляем! Вы достигли серии в {days} дней. Продолжайте в том же духе!',
			},
			en: {
				title: '🔥 {days} days streak!',
				body: 'Congratulations! You reached a {days} day streak. Keep it up!',
			},
		},
	},
	{
		id: 'daily_reminder',
		name: 'Ежедневное напоминание',
		description: 'Напоминание о записи достижения',
		languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'],
		examples: {
			ru: {
				title: '📝 Время записать достижение',
				body: 'Не забудьте записать свои достижения за сегодня!',
			},
			en: {
				title: '📝 Time to log your achievement',
				body: "Don't forget to log your achievements for today!",
			},
		},
	},
	{
		id: 'premium_offer',
		name: 'Предложение Premium',
		description: 'Специальное предложение Premium подписки',
		languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'],
		examples: {
			ru: {
				title: '⭐ Специальное предложение Premium',
				body: 'Получите Premium со скидкой 50% только сегодня!',
			},
			en: {
				title: '⭐ Special Premium Offer',
				body: 'Get Premium with 50% discount today only!',
			},
		},
	},
	{
		id: 'ai_insight',
		name: 'AI Инсайт',
		description: 'Персонализированный инсайт от AI',
		languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'],
		examples: {
			ru: {
				title: '🤖 Персональный инсайт',
				body: 'Ваш AI помощник заметил интересную закономерность в ваших достижениях!',
			},
			en: {
				title: '🤖 Personal Insight',
				body: 'Your AI assistant noticed an interesting pattern in your achievements!',
			},
		},
	},
];

export function TemplateManager() {
	const [activeLanguage, setActiveLanguage] = useState('ru');

	return (
		<div className="space-y-6">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Шаблоны уведомлений</h3>
					<p className="text-sm text-muted-foreground">
						Встроенные шаблоны для 7 языков (ru/en/es/de/fr/zh/ja)
					</p>
				</div>
				<Button disabled>
					<Plus className="mr-2 h-4 w-4" />
					Создать шаблон
					<Badge className="ml-2" variant="secondary">
						Скоро
					</Badge>
				</Button>
			</div>

			{/* Выбор языка */}
			<Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
				<div className="w-full overflow-x-auto">
					<TabsList className="inline-flex h-auto w-auto min-w-full flex-nowrap gap-1 p-1">
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="ru">
							<Globe className="mr-2 h-4 w-4" />
							Русский
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="en">
							<Globe className="mr-2 h-4 w-4" />
							English
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="es">
							<Globe className="mr-2 h-4 w-4" />
							Español
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="de">
							<Globe className="mr-2 h-4 w-4" />
							Deutsch
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="fr">
							<Globe className="mr-2 h-4 w-4" />
							Français
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="zh">
							<Globe className="mr-2 h-4 w-4" />
							中文
						</TabsTrigger>
						<TabsTrigger className="whitespace-nowrap px-3 py-2" value="ja">
							<Globe className="mr-2 h-4 w-4" />
							日本語
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value={activeLanguage} className="space-y-4 mt-4">
					<div className="grid gap-4 md:grid-cols-2">
						{BUILT_IN_TEMPLATES.map((template) => (
							<Card key={template.id}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-base">
										<FileText className="h-4 w-4" />
										{template.name}
									</CardTitle>
									<CardDescription>{template.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									{/* Превью шаблона */}
									<div className="rounded-lg border bg-muted/50 p-3 space-y-2">
										<p className="font-semibold text-sm">
											{template.examples[activeLanguage as keyof typeof template.examples]?.title ||
												template.examples.en.title}
										</p>
										<p className="text-sm text-muted-foreground">
											{template.examples[activeLanguage as keyof typeof template.examples]?.body ||
												template.examples.en.body}
										</p>
									</div>

									{/* Информация */}
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Badge variant="outline">ID: {template.id}</Badge>
										<Badge variant="outline">{template.languages.length} языков</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
