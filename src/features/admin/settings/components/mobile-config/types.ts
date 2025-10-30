/**
 * Shared types for Mobile Config
 */

export type MobileSettings = {
	id: string;
	app_name: string;
	logo_light_url?: string;
	logo_dark_url?: string;
	primary_color: string;
	accent_color: string;
	default_language: string;
	dark_theme_enabled: boolean;
	splash_enabled: boolean;
	splash_image_url?: string;
	splash_bg_color: string;
	splash_duration_ms: number;
	splash_animation: 'fade' | 'zoom' | 'slide' | 'none';
	splash_next_screen: 'onboarding' | 'login' | 'home';
	onboarding_enabled: boolean;
	onboarding_screens: any[];
	onboarding_skip_enabled: boolean;
	auth_methods: string[];
	auth_bg_color: string;
	auth_title: string;
	auth_subtitle: string;
	languages_config: {
		default: string;
		available: string[];
		autoDetect: boolean;
		offlineCache: boolean;
	};
	version: number;
	created_at: string;
	updated_at: string;
};

export type MobileSettingsProps = {
	settings: MobileSettings;
	onChange: (settings: MobileSettings) => void;
};
