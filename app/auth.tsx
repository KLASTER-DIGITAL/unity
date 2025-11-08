/**
 * Auth Screen - React Native Implementation
 *
 * Login/Register screen with email/password authentication
 * Visual parity with PWA AuthScreenNew
 *
 * @module app/auth
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DesignTokens } from '../app-shared/design-system/tokens';
import { createClient } from '../app-shared/lib/supabase/client';

export default function AuthScreen() {
	const [isLogin, setIsLogin] = useState(true);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const supabase = createClient();

	const handleEmailAuth = async () => {
		// Validation
		if (!email || !password) {
			Alert.alert('Ошибка', 'Пожалуйста, заполните email и пароль');
			return;
		}

		if (!isLogin && !name) {
			Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
			return;
		}

		setIsLoading(true);

		try {
			if (isLogin) {
				// Sign In
				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (error) {
					Alert.alert('Ошибка входа', error.message);
					setIsLoading(false);
					return;
				}

				if (data.user) {
					// Navigate to main app
					router.replace('/(tabs)');
				}
			} else {
				// Sign Up
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							name,
						},
					},
				});

				if (error) {
					Alert.alert('Ошибка регистрации', error.message);
					setIsLoading(false);
					return;
				}

				if (data.user) {
					// Create user profile
					const { error: profileError } = await supabase.from('profiles').insert({
						id: data.user.id,
						name,
						email,
						onboardingCompleted: false,
					});

					if (profileError) {
						console.error('Profile creation error:', profileError);
					}

					// Navigate to onboarding
					router.replace('/onboarding/welcome');
				}
			}
		} catch (error: any) {
			Alert.alert('Ошибка', error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>{isLogin ? 'Вход' : 'Регистрация'}</Text>
					<Text style={styles.subtitle}>
						{isLogin ? 'Добро пожаловать обратно!' : 'Создайте свой аккаунт'}
					</Text>
				</View>

				{/* Form */}
				<View style={styles.form}>
					{!isLogin && (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Имя</Text>
							<TextInput
								autoCapitalize="words"
								editable={!isLoading}
								onChangeText={setName}
								placeholder="Ваше имя"
								placeholderTextColor={DesignTokens.colors.textTertiary}
								style={styles.input}
								value={name}
							/>
						</View>
					)}

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							autoCapitalize="none"
							autoComplete="email"
							editable={!isLoading}
							keyboardType="email-address"
							onChangeText={setEmail}
							placeholder="your@email.com"
							placeholderTextColor={DesignTokens.colors.textTertiary}
							style={styles.input}
							value={email}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Пароль</Text>
						<TextInput
							autoCapitalize="none"
							autoComplete="password"
							editable={!isLoading}
							onChangeText={setPassword}
							placeholder="••••••••"
							placeholderTextColor={DesignTokens.colors.textTertiary}
							secureTextEntry
							style={styles.input}
							value={password}
						/>
					</View>

					{/* Submit Button */}
					<Pressable
						disabled={isLoading}
						onPress={handleEmailAuth}
						style={({ pressed }) => [
							styles.submitButton,
							isLoading && styles.submitButtonDisabled,
							pressed && !isLoading && styles.submitButtonPressed,
						]}
					>
						<Text style={[styles.submitButtonText, isLoading && styles.submitButtonTextDisabled]}>
							{isLoading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
						</Text>
					</Pressable>

					{/* Social Auth Placeholder */}
					<View style={styles.socialSection}>
						<View style={styles.divider}>
							<View style={styles.dividerLine} />
							<Text style={styles.dividerText}>или</Text>
							<View style={styles.dividerLine} />
						</View>

						<View style={styles.socialButtons}>
							<Pressable disabled style={styles.socialButton}>
								<Text style={styles.socialButtonText}>🍎 Apple (скоро)</Text>
							</Pressable>
							<Pressable disabled style={styles.socialButton}>
								<Text style={styles.socialButtonText}>🔍 Google (скоро)</Text>
							</Pressable>
						</View>
					</View>

					{/* Toggle Login/Register */}
					<View style={styles.toggleSection}>
						<Text style={styles.toggleText}>{isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}</Text>
						<Pressable disabled={isLoading} onPress={() => setIsLogin(!isLogin)}>
							<Text style={styles.toggleLink}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.card,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: DesignTokens.spacing.xl,
		paddingVertical: DesignTokens.spacing.xxl,
	},
	header: {
		marginTop: DesignTokens.spacing.xxl * 2,
		marginBottom: DesignTokens.spacing.xxl,
		gap: DesignTokens.spacing.sm,
	},
	title: {
		fontSize: DesignTokens.fontSizes.h1,
		fontWeight: '700',
		color: DesignTokens.colors.text,
	},
	subtitle: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.textSecondary,
	},
	form: {
		gap: DesignTokens.spacing.lg,
	},
	inputGroup: {
		gap: DesignTokens.spacing.sm,
	},
	label: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.text,
	},
	input: {
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.lg,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.md,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
		minHeight: 44,
	},
	submitButton: {
		backgroundColor: DesignTokens.colors.primary,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		alignItems: 'center',
		minHeight: 44,
		marginTop: DesignTokens.spacing.md,
	},
	submitButtonDisabled: {
		backgroundColor: DesignTokens.colors.border,
	},
	submitButtonPressed: {
		opacity: 0.8,
	},
	submitButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	submitButtonTextDisabled: {
		color: DesignTokens.colors.textTertiary,
	},
	socialSection: {
		marginTop: DesignTokens.spacing.xl,
		gap: DesignTokens.spacing.lg,
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: DesignTokens.colors.border,
	},
	dividerText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
	},
	socialButtons: {
		gap: DesignTokens.spacing.sm,
	},
	socialButton: {
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		alignItems: 'center',
		minHeight: 44,
		opacity: 0.5,
	},
	socialButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.textSecondary,
	},
	toggleSection: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: DesignTokens.spacing.xs,
		marginTop: DesignTokens.spacing.xl,
	},
	toggleText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
	},
	toggleLink: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '600',
		color: DesignTokens.colors.primary,
	},
});
