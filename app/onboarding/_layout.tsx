/**
 * Onboarding Layout - React Native
 *
 * Stack navigation for onboarding flow
 *
 * @module app/onboarding/_layout
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_right',
				gestureEnabled: false, // Prevent back gesture during onboarding
			}}
		>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="step2" />
			<Stack.Screen name="step3" />
			<Stack.Screen name="step4" />
		</Stack>
	);
}
