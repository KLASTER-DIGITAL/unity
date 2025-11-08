import type React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import type { MobileSettingsProps } from './types';

export const GeneralSettings: React.FC<MobileSettingsProps> = ({ settings, onChange }) => {
	const handleChange = (field: string, value: any) => {
		onChange({
			...settings,
			[field]: value,
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Основная информация</CardTitle>
					<CardDescription>Название приложения и логотипы</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="app_name">Название приложения</Label>
						<Input
							id="app_name"
							onChange={(e) => handleChange('app_name', e.target.value)}
							placeholder="UNITY"
							value={settings.app_name}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="logo_light_url">Логотип (светлая тема)</Label>
							<Input
								id="logo_light_url"
								onChange={(e) => handleChange('logo_light_url', e.target.value)}
								placeholder="https://cdn.unity.com/logo-light.png"
								value={settings.logo_light_url || ''}
							/>
							{settings.logo_light_url && (
								<div className="mt-2 rounded-lg border bg-card p-4 transition-colors duration-300">
									<img
										alt="Logo Light"
										className="h-12 object-contain"
										src={settings.logo_light_url}
									/>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="logo_dark_url">Логотип (тёмная тема)</Label>
							<Input
								id="logo_dark_url"
								onChange={(e) => handleChange('logo_dark_url', e.target.value)}
								placeholder="https://cdn.unity.com/logo-dark.png"
								value={settings.logo_dark_url || ''}
							/>
							{settings.logo_dark_url && (
								<div className="mt-2 rounded-lg border bg-muted p-4 transition-colors duration-300">
									<img
										alt="Logo Dark"
										className="h-12 object-contain"
										src={settings.logo_dark_url}
									/>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Цветовая схема</CardTitle>
					<CardDescription>Основные цвета приложения</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="primary_color">Основной цвет</Label>
							<div className="flex gap-2">
								<Input
									className="h-10 w-20 cursor-pointer p-1"
									id="primary_color"
									onChange={(e) => handleChange('primary_color', e.target.value)}
									type="color"
									value={settings.primary_color}
								/>
								<Input
									className="flex-1"
									onChange={(e) => handleChange('primary_color', e.target.value)}
									placeholder="#756ef3"
									value={settings.primary_color}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="accent_color">Акцентный цвет</Label>
							<div className="flex gap-2">
								<Input
									className="h-10 w-20 cursor-pointer p-1"
									id="accent_color"
									onChange={(e) => handleChange('accent_color', e.target.value)}
									type="color"
									value={settings.accent_color}
								/>
								<Input
									className="flex-1"
									onChange={(e) => handleChange('accent_color', e.target.value)}
									placeholder="#8B78FF"
									value={settings.accent_color}
								/>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-muted p-4">
						<p className="mb-3 text-muted-foreground text-sm">Превью цветов:</p>
						<div className="flex gap-3">
							<div
								className="h-16 w-16 rounded-lg border shadow-sm"
								style={{ backgroundColor: settings.primary_color }}
								title="Primary Color"
							/>
							<div
								className="h-16 w-16 rounded-lg border shadow-sm"
								style={{ backgroundColor: settings.accent_color }}
								title="Accent Color"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Тема</CardTitle>
					<CardDescription>Настройки темной темы</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="dark_theme_enabled">Тёмная тема</Label>
							<p className="text-muted-foreground text-sm">
								Включить поддержку тёмной темы в приложении
							</p>
						</div>
						<Switch
							checked={settings.dark_theme_enabled}
							id="dark_theme_enabled"
							onCheckedChange={(checked) => handleChange('dark_theme_enabled', checked)}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
