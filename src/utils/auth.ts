import {
	analyzeTextWithAI,
	createEntry,
	createUserProfile,
	getUserProfile,
	type UserProfile,
} from '@/shared/lib/api';
import { timezoneAdapter } from '@/shared/lib/platform/timezone';
import { createClient } from './supabase/client';

export interface AuthResult {
	success: boolean;
	user?: any;
	profile?: UserProfile;
	error?: string;
	needsOnboarding?: boolean;
}

// Регистрация с email/password
export async function signUpWithEmail(
	email: string,
	password: string,
	userData: {
		name: string;
		diaryName?: string;
		diaryEmoji?: string;
		language?: string;
		notificationSettings?: any;
		firstEntry?: string;
	}
): Promise<AuthResult> {
	try {
		const supabase = createClient();

		// Регистрация в Supabase Auth
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name: userData.name,
				},
			},
		});

		if (error) {
			console.error('Sign up error:', error);
			return { success: false, error: error.message };
		}

		if (!data.user) {
			return { success: false, error: 'Failed to create user' };
		}

		console.log('User created:', data.user.id);

		// ✅ АВТООПРЕДЕЛЕНИЕ TIMEZONE (БЕЗ запроса у пользователя)
		let userTimezone = 'UTC';
		try {
			const timezoneInfo = await timezoneAdapter.getCurrentTimezone();
			userTimezone = timezoneInfo.timezone;
			console.log('[AUTH] Auto-detected timezone:', userTimezone);
		} catch (error) {
			console.error('[AUTH] Timezone detection failed, using UTC:', error);
		}

		// Создаем профиль пользователя
		const profile = await createUserProfile({
			id: data.user.id,
			email: data.user.email!,
			name: userData.name,
			diaryName: userData.diaryName || 'Мой дневник',
			diaryEmoji: userData.diaryEmoji || '🏆',
			language: userData.language || 'ru',
			timezone: userTimezone, // ✅ Автоматически определенный timezone
			notificationSettings: userData.notificationSettings || {
				selectedTime: 'none',
				morningTime: '08:00',
				eveningTime: '21:00',
				permissionGranted: false,
			},
			onboardingCompleted: true, // ✅ Пользователь прошел онбординг
		});

		console.log('Profile created:', profile);

		// ✅ Создаем первую запись с AI-анализом, если она была введена
		if (userData.firstEntry?.trim()) {
			try {
				console.log('[AUTH] Creating first entry with AI analysis');

				// 1. Анализируем текст с помощью AI
				let analysis: {
					sentiment: string;
					category: string;
					tags: string[];
					reply: string;
					summary: string;
					insight?: string;
					isAchievement?: boolean;
					mood?: string;
					confidence?: number;
				};
				try {
					console.log('[AUTH] Analyzing first entry with AI...');
					analysis = await analyzeTextWithAI(
						userData.firstEntry.trim(),
						userData.name || 'Пользователь',
						data.user.id,
						userData.language || 'ru'
					);
					console.log('[AUTH] AI analysis completed:', analysis);
				} catch (aiError) {
					console.error('[AUTH] AI analysis failed, using fallback:', aiError);
					// Fallback если AI не работает
					analysis = {
						sentiment: 'positive',
						category: 'Другое',
						tags: [],
						reply: 'Отличное начало! Продолжай вести дневник! 🎉',
						summary: 'Первая запись в дневнике',
						insight: 'Ведение дневника помогает лучше понимать себя и свои достижения.',
						isAchievement: true,
						mood: 'хорошее',
						confidence: 0.8,
					};
				}

				// 2. Создаем запись с результатами AI-анализа
				await createEntry({
					userId: data.user.id,
					text: userData.firstEntry.trim(),
					sentiment: (analysis.sentiment || 'positive') as 'positive' | 'neutral' | 'negative',
					category: analysis.category || 'Другое',
					tags: analysis.tags || [],
					aiReply: analysis.reply || '',
					aiSummary: analysis.summary || undefined,
					aiInsight: analysis.insight || undefined,
					isAchievement: true,
					mood: analysis.mood || 'хорошее',
				});

				console.log('✅ First entry created successfully with AI analysis');
			} catch (error) {
				console.error('Error creating first entry:', error);
				// Не прерываем регистрацию, если не удалось создать запись
			}
		}

		return {
			success: true,
			user: data.user,
			profile,
		};
	} catch (error: any) {
		console.error('Sign up error:', error);
		return { success: false, error: error.message };
	}
}

// Вход с email/password
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
	try {
		const supabase = createClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error('Sign in error:', error);
			return { success: false, error: error.message };
		}

		if (!data.user) {
			return { success: false, error: 'Failed to sign in' };
		}

		console.log('User signed in:', data.user.id);

		// Загружаем профиль
		const profile = await getUserProfile(data.user.id);

		// Проверяем, завершен ли онбординг
		const needsOnboarding = profile ? !profile.onboardingCompleted : true;

		if (needsOnboarding) {
			console.log('[AUTH] User needs to complete onboarding');
		}

		return {
			success: true,
			user: data.user,
			profile: profile || undefined,
			needsOnboarding,
		};
	} catch (error: any) {
		console.error('Sign in error:', error);
		return { success: false, error: error.message };
	}
}

// Вход через Google
export async function signInWithGoogle(): Promise<AuthResult> {
	try {
		const supabase = createClient();

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin,
			},
		});

		if (error) {
			console.error('Google sign in error:', error);
			return { success: false, error: error.message };
		}

		// OAuth redirect - вернется на страницу после авторизации
		return { success: true };
	} catch (error: any) {
		console.error('Google sign in error:', error);
		return { success: false, error: error.message };
	}
}

// Вход через Facebook
export async function signInWithFacebook(): Promise<AuthResult> {
	try {
		const supabase = createClient();

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'facebook',
			options: {
				redirectTo: window.location.origin,
			},
		});

		if (error) {
			console.error('Facebook sign in error:', error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error: any) {
		console.error('Facebook sign in error:', error);
		return { success: false, error: error.message };
	}
}

// Вход через Apple
export async function signInWithApple(): Promise<AuthResult> {
	try {
		const supabase = createClient();

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'apple',
			options: {
				redirectTo: window.location.origin,
			},
		});

		if (error) {
			console.error('Apple sign in error:', error);
			return { success: false, error: error.message };
		}

		return {
			success: true,
		};
	} catch (error: any) {
		console.error('Apple sign in error:', error);
		return { success: false, error: error.message };
	}
}

// Вход через Telegram
export async function signInWithTelegram(): Promise<AuthResult> {
	try {
		// Для Telegram авторизации мы используем Telegram Login Widget
		// который обрабатывается напрямую в компоненте AuthScreen
		// Здесь мы только возвращаем успешный результат для инициации процесса
		return { success: true };
	} catch (error: any) {
		console.error('Telegram sign in error:', error);
		return { success: false, error: error.message };
	}
}

// Выход
export async function signOut(): Promise<void> {
	const supabase = createClient();
	await supabase.auth.signOut();
}

// Проверка сессии и загрузка профиля
export async function checkSession(): Promise<AuthResult> {
	try {
		const supabase = createClient();

		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session?.user) {
			return { success: false };
		}

		console.log('Session found for user:', session.user.id);

		// Загружаем профиль
		let profile = await getUserProfile(session.user.id);

		// Если профиля нет, создаем базовый
		if (!profile) {
			console.log('Profile not found, creating new profile for:', session.user.id);

			// ✅ АВТООПРЕДЕЛЕНИЕ TIMEZONE (БЕЗ запроса у пользователя)
			let userTimezone = 'UTC';
			try {
				const timezoneInfo = await timezoneAdapter.getCurrentTimezone();
				userTimezone = timezoneInfo.timezone;
				console.log('[AUTH] Auto-detected timezone:', userTimezone);
			} catch (error) {
				console.error('[AUTH] Timezone detection failed, using UTC:', error);
			}

			try {
				const newProfile = await createUserProfile({
					id: session.user.id,
					email: session.user.email!,
					name:
						session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Пользователь',
					diaryName: 'Мой дневник',
					diaryEmoji: '🏆',
					language: 'ru',
					timezone: userTimezone, // ✅ Автоматически определенный timezone
					notificationSettings: {
						selectedTime: 'none',
						morningTime: '08:00',
						eveningTime: '21:00',
						permissionGranted: false,
					},
					onboardingCompleted: false, // Новый пользователь должен пройти онбординг
				});

				console.log('Profile created successfully:', newProfile);
				profile = newProfile;
			} catch (createError: any) {
				console.error('Error creating profile:', createError);
				// Возвращаем минимальный профиль в случае ошибки
				profile = {
					id: session.user.id,
					email: session.user.email!,
					name: session.user.user_metadata?.name || 'Пользователь',
					diaryName: 'Мой дневник',
					diaryEmoji: '🏆',
					language: 'ru',
					notificationSettings: {
						selectedTime: 'none',
						morningTime: '08:00',
						eveningTime: '21:00',
						permissionGranted: false,
					},
					onboardingCompleted: false,
				};
			}
		}

		return {
			success: true,
			user: session.user,
			profile,
		};
	} catch (error: any) {
		console.error('Session check error:', error);
		return { success: false, error: error.message };
	}
}
