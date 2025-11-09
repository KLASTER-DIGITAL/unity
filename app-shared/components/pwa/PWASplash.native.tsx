import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useTranslation } from '../../lib/i18n';
import BlackAnimation from '../assets/lottie/Black-2.json';
import WhiteAnimation from '../assets/lottie/White-2.json';
import { DesignTokens } from '../design-system/tokens';

/**
 * Splash screen для React Native
 * Показывается при запуске приложения
 * Улучшенная версия с Lottie анимацией и i18n поддержкой
 */
export function PWASplash() {
	const [showSplash, setShowSplash] = useState(true);
	const colorScheme = useColorScheme();
	const animationRef = useRef<LottieView>(null);
	const { t } = useTranslation();

	// Выбираем анимацию в зависимости от темы
	const animationData = colorScheme === 'dark' ? WhiteAnimation : BlackAnimation;

	// Автоматически скрываем через 2 секунды
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowSplash(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	// Автоматически запускаем анимацию
	useEffect(() => {
		animationRef.current?.play();
	}, []);

	if (!showSplash) {
		return null;
	}

	const colors = {
		background: colorScheme === 'dark' ? DesignTokens.colors.background : DesignTokens.colors.white,
		text: colorScheme === 'dark' ? DesignTokens.colors.white : DesignTokens.colors.text,
		textSecondary:
			colorScheme === 'dark' ? DesignTokens.colors.textSecondary : DesignTokens.colors.gray600,
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Lottie Animation Logo */}
			<View style={styles.animationContainer}>
				<LottieView
					autoPlay
					loop
					ref={animationRef}
					source={animationData}
					style={styles.animation}
				/>
			</View>

			{/* Title - UNITY */}
			<Text style={[styles.title, { color: colors.text }]}>UNITY</Text>

			{/* Subtitle - i18n translated */}
			<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
				{t('splash.subtitle', 'Ваш дневник достижений')}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: DesignTokens.spacing.lg,
	},
	animationContainer: {
		width: 128,
		height: 128,
		marginBottom: DesignTokens.spacing.xl,
	},
	animation: {
		width: '100%',
		height: '100%',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: DesignTokens.spacing.sm,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		textAlign: 'center',
		marginTop: DesignTokens.spacing.sm,
	},
});

export default PWASplash;
