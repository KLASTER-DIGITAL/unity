import { Bell, Download, Loader2, Save, Settings, Smartphone, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
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
import { Select } from '@/shared/components/ui/universal/Select.web';
import { createClient } from '@/utils/supabase/client';

type PWASettings = {
	enableNotifications: boolean;
	enableOfflineMode: boolean;
	enableInstallPrompt: boolean;
	installPromptTiming: 'immediate' | 'after_visits' | 'after_time' | 'manual';
	installPromptVisitsCount: number;
	installPromptDelayMinutes: number;
	installPromptLocation: 'onboarding' | 'user_cabinet' | 'both' | 'anywhere';
	installPromptTitle: string;
	installPromptDescription: string;
	installPromptButtonText: string;
	installPromptSkipText: string;
};

type PWAManifest = {
	appName: string;
	shortName: string;
	description: string;
	themeColor: string;
	backgroundColor: string;
};

export function PWASettings() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [settings, setSettings] = useState<PWASettings>({
		enableNotifications: true,
		enableOfflineMode: true,
		enableInstallPrompt: true,
		installPromptTiming: 'after_visits',
		installPromptVisitsCount: 3,
		installPromptDelayMinutes: 5,
		installPromptLocation: 'anywhere',
		installPromptTitle: 'pwa.install.title',
		installPromptDescription: 'pwa.install.description',
		installPromptButtonText: 'pwa.install.button',
		installPromptSkipText: 'pwa.install.skip',
	});

	const [manifest, setManifest] = useState<PWAManifest>({
		appName: 'Дневник Достижений',
		shortName: 'Дневник',
		description: 'Персональный дневник для отслеживания достижений',
		themeColor: '#3b82f6',
		backgroundColor: '#ffffff',
	});

	const supabase = createClient();

	useEffect(() => {
		loadSettings();
		// biome-ignore lint/correctness/useExhaustiveDependencies: loadSettings is stable
	}, []);

	const loadSettings = async () => {
		setIsLoading(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			// Load PWA settings
			const { data: settingsData, error: settingsError } = await supabase
				.from('admin_settings')
				.select('value')
				.eq('key', 'pwa_settings');

			if (settingsError) {
				throw settingsError;
			}

			if (settingsData && settingsData.length > 0 && settingsData[0]?.value) {
				setSettings(JSON.parse(settingsData[0].value as string));
			}

			// Load PWA manifest
			const { data: manifestData, error: manifestError } = await supabase
				.from('admin_settings')
				.select('value')
				.eq('key', 'pwa_manifest');

			if (manifestError) {
				throw manifestError;
			}

			if (manifestData && manifestData.length > 0 && manifestData[0]?.value) {
				setManifest(JSON.parse(manifestData[0].value as string));
			}
		} catch (error) {
			console.error('Error loading PWA settings:', error);
			toast.error('Ошибка загрузки настроек');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		console.log('[PWASettings] Saving settings:', settings);
		console.log('[PWASettings] Saving manifest:', manifest);
		setIsSaving(true);
		try {
			// Save PWA settings
			const settingsPayload = {
				key: 'pwa_settings',
				value: JSON.stringify(settings),
				category: 'pwa',
				updated_at: new Date().toISOString(),
			};
			console.log('[PWASettings] Settings upsert payload:', settingsPayload);

			const { data: settingsData, error: settingsError } = await supabase
				.from('admin_settings')
				.upsert(settingsPayload, {
					onConflict: 'key',
				})
				.select();

			console.log('[PWASettings] Settings upsert result:', {
				data: settingsData,
				error: settingsError,
			});

			if (settingsError) {
				throw settingsError;
			}

			// Save PWA manifest
			const manifestPayload = {
				key: 'pwa_manifest',
				value: JSON.stringify(manifest),
				category: 'pwa',
				updated_at: new Date().toISOString(),
			};
			console.log('[PWASettings] Manifest upsert payload:', manifestPayload);

			const { data: manifestData, error: manifestError } = await supabase
				.from('admin_settings')
				.upsert(manifestPayload, {
					onConflict: 'key',
				})
				.select();

			console.log('[PWASettings] Manifest upsert result:', {
				data: manifestData,
				error: manifestError,
			});

			if (manifestError) {
				throw manifestError;
			}

			toast.success('Настройки PWA успешно сохранены! 📱');
		} catch (error: any) {
			console.error('[PWASettings] Error saving PWA settings:', error);
			toast.error(`Ошибка сохранения: ${error.message}`);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Settings className="h-6 w-6" />
						Настройки PWA
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Настройки Progressive Web App для лучшего пользовательского опыта
					</p>
				</div>
				<Button disabled={isSaving} onClick={handleSave}>
					{isSaving ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Сохраняю...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Сохранить
						</>
					)}
				</Button>
			</div>

			{/* Манифест PWA */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Smartphone className="h-5 w-5" />
						Манифест PWA
					</CardTitle>
					<CardDescription className="text-sm">Настройка веб-манифеста приложения</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="app-name">Название приложения</Label>
							<Input
								id="app-name"
								onChange={(e) => setManifest((prev) => ({ ...prev, appName: e.target.value }))}
								type="text"
								value={manifest.appName}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="short-name">Короткое название</Label>
							<Input
								id="short-name"
								onChange={(e) =>
									setManifest((prev) => ({
										...prev,
										shortName: e.target.value,
									}))
								}
								type="text"
								value={manifest.shortName}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Описание</Label>
						<Input
							id="description"
							onChange={(e) =>
								setManifest((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							type="text"
							value={manifest.description}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="theme-color">Цвет темы</Label>
							<div className="flex items-center gap-3">
								<Input
									className="flex-1"
									id="theme-color"
									onChange={(e) =>
										setManifest((prev) => ({
											...prev,
											themeColor: e.target.value,
										}))
									}
									type="text"
									value={manifest.themeColor}
								/>
								<div
									aria-hidden="true"
									className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
									style={{ backgroundColor: manifest.themeColor }}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="bg-color">Цвет фона</Label>
							<div className="flex items-center gap-3">
								<Input
									className="flex-1"
									id="bg-color"
									onChange={(e) =>
										setManifest((prev) => ({
											...prev,
											backgroundColor: e.target.value,
										}))
									}
									type="text"
									value={manifest.backgroundColor}
								/>
								<div
									aria-hidden="true"
									className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
									style={{ backgroundColor: manifest.backgroundColor }}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Функции PWA */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Settings className="h-5 w-5" />
						Функции PWA
					</CardTitle>
					<CardDescription className="text-sm">
						Включение и отключение возможностей приложения
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div
							className={`flex items-center justify-between rounded-lg border p-3 ${
								settings.enableNotifications
									? 'border-primary/20 bg-primary/5'
									: 'border-border bg-muted'
							}`}
						>
							<div className="flex items-center gap-3">
								<Bell
									className={`h-5 w-5 ${settings.enableNotifications ? 'text-primary' : 'text-muted-foreground'}`}
								/>
								<div className="space-y-0.5">
									<div
										className={`font-medium text-sm ${settings.enableNotifications ? 'text-primary' : ''}`}
									>
										Push-уведомления
									</div>
									<p className="text-muted-foreground text-xs">Разрешить отправку уведомлений</p>
								</div>
							</div>
							<Switch
								checked={settings.enableNotifications}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, enableNotifications: checked })
								}
							/>
						</div>

						<div
							className={`flex items-center justify-between rounded-lg border p-3 ${
								settings.enableOfflineMode
									? 'border-primary/20 bg-primary/5'
									: 'border-border bg-muted'
							}`}
						>
							<div className="flex items-center gap-3">
								<Wifi
									className={`h-5 w-5 ${settings.enableOfflineMode ? 'text-primary' : 'text-muted-foreground'}`}
								/>
								<div className="space-y-0.5">
									<div
										className={`font-medium text-sm ${settings.enableOfflineMode ? 'text-primary' : ''}`}
									>
										Offline режим
									</div>
									<p className="text-muted-foreground text-xs">Работа без интернета</p>
								</div>
							</div>
							<Switch
								checked={settings.enableOfflineMode}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, enableOfflineMode: checked })
								}
							/>
						</div>

						<div
							className={`flex items-center justify-between rounded-lg border p-3 ${
								settings.enableInstallPrompt
									? 'border-primary/20 bg-primary/5'
									: 'border-border bg-muted'
							}`}
						>
							<div className="flex items-center gap-3">
								<Download
									className={`h-5 w-5 ${settings.enableInstallPrompt ? 'text-primary' : 'text-muted-foreground'}`}
								/>
								<div className="space-y-0.5">
									<div
										className={`font-medium text-sm ${settings.enableInstallPrompt ? 'text-primary' : ''}`}
									>
										Install Prompt
									</div>
									<p className="text-muted-foreground text-xs">Предложение установки</p>
								</div>
							</div>
							<Switch
								checked={settings.enableInstallPrompt}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, enableInstallPrompt: checked })
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Install Prompt настройки */}
			{settings.enableInstallPrompt && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<Download className="h-5 w-5" />
							Настройки Install Prompt
						</CardTitle>
						<CardDescription className="text-sm">
							Когда и где показывать предложение установки
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Timing */}
						<div className="space-y-2">
							<Label>Когда показывать</Label>
							<Select
								onValueChange={(value: any) =>
									setSettings({ ...settings, installPromptTiming: value })
								}
								options={[
									{ value: 'immediate', label: 'Сразу при первом визите' },
									{ value: 'after_visits', label: 'После N визитов' },
									{ value: 'after_time', label: 'После N минут на сайте' },
									{ value: 'manual', label: 'Только вручную' },
								]}
								placeholder="Выберите время"
								value={settings.installPromptTiming}
							/>
						</div>

						{/* Visits Count */}
						{settings.installPromptTiming === 'after_visits' && (
							<div className="space-y-2">
								<Label>Количество визитов</Label>
								<Input
									min="1"
									onChange={(e) =>
										setSettings({
											...settings,
											installPromptVisitsCount: Number.parseInt(e.target.value, 10),
										})
									}
									type="number"
									value={settings.installPromptVisitsCount}
								/>
							</div>
						)}

						{/* Delay Minutes */}
						{settings.installPromptTiming === 'after_time' && (
							<div className="space-y-2">
								<Label>Задержка (минуты)</Label>
								<Input
									min="1"
									onChange={(e) =>
										setSettings({
											...settings,
											installPromptDelayMinutes: Number.parseInt(e.target.value, 10),
										})
									}
									type="number"
									value={settings.installPromptDelayMinutes}
								/>
							</div>
						)}

						{/* Location */}
						<div className="space-y-2">
							<Label>Где показывать</Label>
							<Select
								onValueChange={(value: any) =>
									setSettings({ ...settings, installPromptLocation: value })
								}
								options={[
									{ value: 'onboarding', label: 'Только на онбординге' },
									{ value: 'user_cabinet', label: 'Только в личном кабинете' },
									{ value: 'both', label: 'На онбординге и в кабинете' },
									{ value: 'anywhere', label: 'Везде' },
								]}
								placeholder="Выберите место"
								value={settings.installPromptLocation}
							/>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
