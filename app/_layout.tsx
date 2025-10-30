/**
 * Root Layout for React Native Expo
 *
 * This is the entry point for Expo Router file-based routing.
 * It sets up the navigation structure and global providers.
 */

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../app-shared/contexts/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		// Add custom fonts here if needed
		// 'CustomFont-Regular': require('../assets/fonts/CustomFont-Regular.ttf'),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider>
				<StatusBar style="auto" />
				<Stack
					screenOptions={{
						headerShown: false,
						// iOS-style transitions
						animation: 'slide_from_right',
						animationDuration: 300,
						// Custom transition config
						customAnimationOnGesture: true,
						fullScreenGestureEnabled: true,
						gestureEnabled: true,
						gestureDirection: 'horizontal',
					}}
				>
					<Stack.Screen
						name="index"
						options={{
							animation: 'fade',
						}}
					/>
					<Stack.Screen
						name="(tabs)"
						options={{
							animation: 'slide_from_right',
						}}
					/>
				</Stack>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
