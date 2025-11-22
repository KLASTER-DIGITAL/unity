import type React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import type { MobileSettingsProps } from './types';

export const LanguageSettings: React.FC<MobileSettingsProps> = ({ settings, onChange }) => {
	const handleConfigChange = (field: string, value: unknown) => {
		onChange({
			...settings,
			languages_config: {
				...settings.languages_config,
				[field]: value,
			},
		});
	};

	const languages = [
		{ code: 'ru', name: 'Русский' },
		{ code: 'en', name: 'English' },
		{ code: 'es', name: 'Español' },
		{ code: 'de', name: 'Deutsch' },
		{ code: 'fr', name: 'Français' },
		{ code: 'zh', name: '中文' },
		{ code: 'ja', name: '日本語' },
	];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Настройки языков</CardTitle>
					<CardDescription>Управление мультиязычностью приложения</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Язык по умолчанию</Label>
						<Select
							onValueChange={(value) => handleConfigChange('default', value)}
							value={settings.languages_config.default}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{languages.map((lang) => (
									<SelectItem key={lang.code} value={lang.code}>
										{lang.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Автоопределение языка</Label>
							<p className="text-muted-foreground text-sm">
								Определять язык устройства автоматически
							</p>
						</div>
						<Switch
							checked={settings.languages_config.autoDetect}
							onCheckedChange={(checked) => handleConfigChange('autoDetect', checked)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Offline кэширование</Label>
							<p className="text-muted-foreground text-sm">
								Кэшировать переводы для работы без интернета
							</p>
						</div>
						<Switch
							checked={settings.languages_config.offlineCache}
							onCheckedChange={(checked) => handleConfigChange('offlineCache', checked)}
						/>
					</div>

					<div className="rounded-lg bg-muted p-4">
						<p className="mb-2 font-medium text-sm">Доступные языки:</p>
						<div className="flex flex-wrap gap-2">
							{settings.languages_config.available.map((code) => {
								const lang = languages.find((l) => l.code === code);
								return (
									<span className="rounded-full border bg-background px-3 py-1 text-sm" key={code}>
										{lang?.name || code}
									</span>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
