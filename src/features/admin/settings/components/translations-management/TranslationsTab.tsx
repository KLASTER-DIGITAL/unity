import { AlertCircle, Edit2, Save, Search, X } from 'lucide-react';
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
import { Input } from '@/shared/components/ui/input';
import { TabsContent } from '@/shared/components/ui/tabs';
import type { Language, Translation } from './types';

type TranslationsTabProps = {
	translations: Translation[];
	languages: Language[];
	selectedLanguage: string;
	searchQuery: string;
	uniqueKeysCount: number;
	onLanguageChange: (code: string) => void;
	onSearchChange: (query: string) => void;
	onSaveTranslation: (key: string, value: string) => Promise<void>;
};

/**
 * Translations Tab Component
 * Displays and allows editing of translations
 */
export function TranslationsTab({
	translations,
	languages,
	selectedLanguage,
	searchQuery,
	uniqueKeysCount,
	onLanguageChange,
	onSearchChange,
	onSaveTranslation,
}: TranslationsTabProps) {
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	const handleSave = async () => {
		if (!editingKey) {
			return;
		}

		await onSaveTranslation(editingKey, editValue);
		setEditingKey(null);
		setEditValue('');
	};

	const handleEdit = (key: string, value: string) => {
		setEditingKey(key);
		setEditValue(value);
	};

	const handleCancel = () => {
		setEditingKey(null);
		setEditValue('');
	};

	return (
		<TabsContent className="space-y-4" value="translations">
			{/* Language Selector & Search */}
			<div className="flex gap-4">
				<div className="flex flex-wrap gap-2">
					{languages
						.filter((l) => l.enabled)
						.map((lang) => (
							<Button
								key={lang.code}
								onClick={() => onLanguageChange(lang.code)}
								size="sm"
								variant={selectedLanguage === lang.code ? 'default' : 'outline'}
							>
								{lang.native_name}
							</Button>
						))}
				</div>
				<div className="flex-1">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
						<Input
							autoComplete="off"
							className="pl-10"
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="Поиск по ключу или значению..."
							value={searchQuery}
						/>
					</div>
				</div>
			</div>

			{/* Translations List */}
			<Card>
				<CardHeader>
					<CardTitle>
						Переводы для {languages.find((l) => l.code === selectedLanguage)?.native_name}
					</CardTitle>
					<CardDescription>
						Найдено: {translations.length} из {uniqueKeysCount} ключей
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="max-h-[600px] space-y-2 overflow-y-auto">
						{translations.length === 0 ? (
							<div className="py-8 text-center text-muted-foreground">
								<AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
								<p>Переводы не найдены</p>
							</div>
						) : (
							translations.map((translation) => (
								<div
									className="rounded-lg border p-4 transition-colors hover:bg-accent/50"
									key={`${translation.translation_key}-${translation.lang_code}`}
								>
									<div className="mb-2 flex items-start justify-between">
										<div className="flex-1">
											<div className="mb-1 font-mono text-muted-foreground text-sm">
												{translation.translation_key}
											</div>
											{translation.category && (
												<Badge className="mb-2 text-xs" variant="outline">
													{translation.category}
												</Badge>
											)}
										</div>
										<Badge variant="secondary">{translation.lang_code.toUpperCase()}</Badge>
									</div>

									{editingKey === translation.translation_key ? (
										<div className="space-y-2">
											<Input
												autoFocus
												onChange={(e) => setEditValue(e.target.value)}
												placeholder="Введите перевод..."
												value={editValue}
											/>
											<div className="flex gap-2">
												<Button onClick={handleSave} size="sm">
													<Save className="mr-1 h-4 w-4" />
													Сохранить
												</Button>
												<Button onClick={handleCancel} size="sm" variant="outline">
													<X className="mr-1 h-4 w-4" />
													Отмена
												</Button>
											</div>
										</div>
									) : (
										<div className="flex items-center justify-between">
											<span className="mr-4 flex-1 text-foreground">
												{translation.translation_value}
											</span>
											<Button
												onClick={() =>
													handleEdit(translation.translation_key, translation.translation_value)
												}
												size="sm"
												variant="ghost"
											>
												<Edit2 className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
