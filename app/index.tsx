/**
 * Index Screen for React Native Expo
 *
 * Проверяет авторизацию и редиректит:
 * - Если авторизован → /(tabs)
 * - Если нет → /auth
 */

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app-shared/contexts/ThemeContext";
import { supabase } from "../app-shared/lib/supabase/client";

export default function IndexScreen() {
	const router = useRouter();
	const { colors } = useTheme();
	const [_isChecking, setIsChecking] = useState(true);

	const checkAuth = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				console.log("[Index] User authenticated, redirecting to tabs");
				router.replace("/(tabs)");
			} else {
				console.log("[Index] No session, redirecting to auth");
				router.replace("/auth");
			}
		} catch (error) {
			console.error("[Index] Error checking auth:", error);
			// On error, redirect to auth
			router.replace("/auth");
		} finally {
			setIsChecking(false);
		}
	};

	useEffect(() => {
		checkAuth();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.logo, { color: colors.primary }]}>🏆</Text>
			<Text style={[styles.title, { color: colors.text }]}>UNITY</Text>
			<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
				Дневник достижений
			</Text>
			<ActivityIndicator
				color={colors.primary}
				size="large"
				style={styles.loader}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		fontSize: 64,
		marginBottom: 16,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 32,
	},
	loader: {
		marginTop: 16,
	},
});
