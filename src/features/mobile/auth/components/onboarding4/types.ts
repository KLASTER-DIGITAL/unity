/**
 * Types for Onboarding Screen 4
 */

export type OnboardingScreen4Props = {
	selectedLanguage: string;
	onNext: (
		firstEntry: string,
		notificationSettings: NotificationSettingsType,
	) => void;
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
};

export type NotificationSettingsType = {
	selectedTime: "none" | "morning" | "evening" | "both";
	morningTime: string;
	eveningTime: string;
	permissionGranted: boolean;
};
