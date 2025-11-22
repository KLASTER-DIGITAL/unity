import { Image, Languages, Lock, RefreshCw, Save, Smartphone, Users } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from '@/shared/components/ui/universal/Toast';
import { supabase } from '@/utils/supabase/client';
import { AuthSettings } from './AuthSettings';
import { GeneralSettings } from './GeneralSettings';
import { LanguageSettings } from './LanguageSettings';
import { OnboardingSettings } from './OnboardingSettings';
import { SplashScreenSettings } from './SplashScreenSettings';
import type { MobileSettings } from './types';

export const MobileConfigTab: React.FC = () => {
	const [activeTab, setActiveTab] = useState('general');
	const [settings, setSettings] = useState<MobileSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Загрузка настроек
	const loadSettings = useCallback(async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase.from('mobile_settings').select('*').single();

			if (error) {
				throw error;
			}
			setSettings(data);
		} catch (error) {
			console.error('Error loading mobile settings:', error);
			toast.error('Ошибка загрузки', {
				description: 'Не удалось загрузить настройки мобильного приложения',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	// Сохранение настроек
	const saveSettings = async () => {
		if (!settings) {
			return;
		}

		try {
			setSaving(true);

			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				throw new Error('Unauthorized');
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mobile-config-api`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify(settings),
				}
			);

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to save settings');
			}

			toast.success('Настройки сохранены', {
				description: `Версия: ${result.config.version}`,
			});

			setSettings(result.config);
		} catch (error) {
			console.error('Error saving mobile settings:', error);
			toast.error('Ошибка сохранения', {
				description: error instanceof Error ? error.message : 'Не удалось сохранить настройки',
			});
		} finally {
			setSaving(false);
		}
	};

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	const tabs = [
		{ value: 'general', label: 'Общие', icon: Smartphone },
		{ value: 'splash', label: 'Splash Screen', icon: Image },
		{ value: 'onboarding', label: 'Онбординг', icon: Users },
		{ value: 'auth', label: 'Авторизация', icon: Lock },
		{ value: 'languages', label: 'Языки', icon: Languages },
	];

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!settings) {
		return (
			<div className="flex h-64 flex-col items-center justify-center gap-4">
				<p className="text-muted-foreground">Настройки не найдены</p>
				<Button onClick={loadSettings}>
					<RefreshCw className="mr-2 h-4 w-4" />
					Попробовать снова
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl text-foreground">Mobile Config</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Настройки React Native приложения • Версия: {settings.version}
					</p>
				</div>
				<div className="flex gap-2">
					<Button disabled={loading || saving} onClick={loadSettings} variant="outline">
						<RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
						Обновить
					</Button>
					<Button disabled={saving} onClick={saveSettings}>
						<Save className="mr-2 h-4 w-4" />
						{saving ? 'Сохранение...' : 'Сохранить'}
					</Button>
				</div>
			</div>

			{/* Вкладки */}
			<Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="inline-flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg bg-muted p-1">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<TabsTrigger
								className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 font-medium text-sm"
								key={tab.value}
								value={tab.value}
							>
								<Icon className="h-4 w-4" />
								<span>{tab.label}</span>
							</TabsTrigger>
						);
					})}
				</TabsList>

				<TabsContent className="mt-6" value="general">
					<GeneralSettings onChange={(s) => setSettings(s)} settings={settings} />
				</TabsContent>

				<TabsContent className="mt-6" value="splash">
					<SplashScreenSettings onChange={(s) => setSettings(s)} settings={settings} />
				</TabsContent>

				<TabsContent className="mt-6" value="onboarding">
					<OnboardingSettings onChange={(s) => setSettings(s)} settings={settings} />
				</TabsContent>

				<TabsContent className="mt-6" value="auth">
					<AuthSettings onChange={(s) => setSettings(s)} settings={settings} />
				</TabsContent>

				<TabsContent className="mt-6" value="languages">
					<LanguageSettings onChange={(s) => setSettings(s)} settings={settings} />
				</TabsContent>
			</Tabs>
		</div>
	);
};
