/**
 * Types for Settings Screen
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SettingsScreenProps = {
	userData?: any; // TODO: Create UserProfile type
	onLogout?: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onProfileUpdate?: (updatedProfile: any) => void; // TODO: Create UserProfile type
};

export type NotificationSettings = {
	dailyReminder: boolean;
	weeklyReport: boolean;
	achievements: boolean;
	motivational: boolean;
};

export type Language = {
	code: string;
	name: string;
	native_name: string;
	flag: string;
	is_active: boolean;
};
