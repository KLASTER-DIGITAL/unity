/**
 * Tabs Layout for React Native Expo
 *
 * Main navigation structure with custom bottom tabs.
 * Максимально близко к PWA версии MobileBottomNav.
 */

import { Tabs } from "expo-router";
import { CustomTabBar } from "../../app-shared/components/navigation/CustomTabBar";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
			tabBar={(props) => <CustomTabBar {...props} />}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Главная",
				}}
			/>
			<Tabs.Screen
				name="diary"
				options={{
					title: "Дневник",
				}}
			/>
			<Tabs.Screen
				name="achievements"
				options={{
					title: "Достижения",
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Настройки",
				}}
			/>
		</Tabs>
	);
}
