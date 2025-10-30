import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
// Lottie animations
import BlackAnimation from '../assets/lottie/Black-2.json';
import WhiteAnimation from '../assets/lottie/White-2.json';
import { DesignTokens } from '../design-system/tokens';

interface LottiePreloaderProps {
	/**
	 * Текст сообщения под анимацией
	 * @default "Загрузка..."
	 */
	message?: string;

	/**
	 * Минимальное время показа прелоадера в миллисекундах
	 * @default 5000 (5 секунд)
	 */
	minDuration?: number;

	/**
	 * Показывать ли текст сообщения
	 * @default true
	 */
	showMessage?: boolean;

	/**
	 * Размер анимации
	 * @default "md"
	 * sm: 96x96px
	 * md: 128x128px
	 * lg: 192x192px
	 * xl: 256x256px
	 */
	size?: 'sm' | 'md' | 'lg' | 'xl';

	/**
	 * Callback когда минимальное время истекло
	 */
	onMinDurationComplete?: () => void;
}

/**
 * Универсальный Lottie прелоадер для React Native
 *
 * Автоматически переключается между черной и белой анимацией
 * в зависимости от текущей темы (light/dark)
 *
 * @example
 * ```tsx
 * // Для первой загрузки
 * <LottiePreloader message="Загрузка..." minDuration={5000} />
 *
 * // Для переходов между страницами
 * <LottiePreloader showMessage={false} size="md" />
 * ```
 */
export function LottiePreloader({
	message = 'Загрузка...',
	minDuration = 5000,
	showMessage = true,
	size = 'md',
	onMinDurationComplete,
}: LottiePreloaderProps) {
	const colorScheme = useColorScheme();
	const animationRef = useRef<LottieView>(null);
	const [_minDurationElapsed, setMinDurationElapsed] = useState(false);

	// Выбираем анимацию в зависимости от темы
	// Темная тема → White-2.json (белая анимация видна на темном фоне)
	// Светлая тема → Black-2.json (черная анимация видна на светлом фоне)
	const animationData = colorScheme === 'dark' ? WhiteAnimation : BlackAnimation;

	// Размеры анимации
	const sizes = {
		sm: 96,
		md: 128,
		lg: 192,
		xl: 256,
	};

	const animationSize = sizes[size];

	// Отслеживаем минимальное время показа
	useEffect(() => {
		const timer = setTimeout(() => {
			setMinDurationElapsed(true);
			onMinDurationComplete?.();
		}, minDuration);

		return () => clearTimeout(timer);
	}, [minDuration, onMinDurationComplete]);

	// Автоматически запускаем анимацию
	useEffect(() => {
		animationRef.current?.play();
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{/* Lottie Animation */}
				<View style={[styles.animationContainer, { width: animationSize, height: animationSize }]}>
					<LottieView
						autoPlay
						loop
						ref={animationRef}
						source={animationData}
						style={styles.animation}
					/>
				</View>

				{/* Message */}
				{showMessage && <Text style={styles.message}>{message}</Text>}
			</View>
		</View>
	);
}

/**
 * Компактный вариант прелоадера для использования внутри компонентов
 */
export function LottiePreloaderCompact({
	message = 'Загрузка...',
	size = 'sm',
	showMessage = false,
	minDuration,
	onMinDurationComplete,
}: Omit<LottiePreloaderProps, 'minDuration' | 'onMinDurationComplete'> & {
	minDuration?: number;
	onMinDurationComplete?: () => void;
}) {
	const colorScheme = useColorScheme();
	const animationRef = useRef<LottieView>(null);
	const [_minDurationElapsed, setMinDurationElapsed] = useState(false);

	// Выбираем анимацию в зависимости от темы
	// Темная тема → White-2.json (белая анимация видна на темном фоне)
	// Светлая тема → Black-2.json (черная анимация видна на светлом фоне)
	const animationData = colorScheme === 'dark' ? WhiteAnimation : BlackAnimation;

	// Размеры анимации (компактные)
	const sizes = {
		sm: 48,
		md: 64,
		lg: 96,
		xl: 128,
	};

	const animationSize = sizes[size];

	// Если указан minDuration, запускаем таймер
	useEffect(() => {
		if (minDuration && minDuration > 0) {
			const timer = setTimeout(() => {
				setMinDurationElapsed(true);
				onMinDurationComplete?.();
			}, minDuration);

			return () => clearTimeout(timer);
		}
	}, [minDuration, onMinDurationComplete]);

	// Автоматически запускаем анимацию
	useEffect(() => {
		animationRef.current?.play();
	}, []);

	return (
		<View style={styles.compactContainer}>
			<View style={[styles.compactAnimation, { width: animationSize, height: animationSize }]}>
				<LottieView
					autoPlay
					loop
					ref={animationRef}
					source={animationData}
					style={styles.animation}
				/>
			</View>
			{showMessage && <Text style={styles.compactMessage}>{message}</Text>}
		</View>
	);
}

/**
 * Inline вариант прелоадера для использования в кнопках и других элементах
 */
export function LottiePreloaderInline({ size = 'sm' }: Pick<LottiePreloaderProps, 'size'>) {
	const colorScheme = useColorScheme();
	const animationRef = useRef<LottieView>(null);

	// Для inline элементов используем ту же логику (не инвертируем)
	// Темная тема → White-2.json (белая анимация видна на темном фоне)
	// Светлая тема → Black-2.json (черная анимация видна на светлом фоне)
	const animationData = colorScheme === 'dark' ? WhiteAnimation : BlackAnimation;

	// Размеры анимации (inline)
	const sizes = {
		sm: 16,
		md: 24,
		lg: 32,
		xl: 48,
	};

	const animationSize = sizes[size];

	// Автоматически запускаем анимацию
	useEffect(() => {
		animationRef.current?.play();
	}, []);

	return (
		<View style={[styles.inlineContainer, { width: animationSize, height: animationSize }]}>
			<LottieView
				autoPlay
				loop
				ref={animationRef}
				source={animationData}
				style={styles.animation}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: DesignTokens.colors.background,
	},
	content: {
		alignItems: 'center',
	},
	animationContainer: {
		marginBottom: DesignTokens.spacing.lg,
	},
	animation: {
		width: '100%',
		height: '100%',
	},
	message: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
		textAlign: 'center',
	},
	compactContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
	},
	compactAnimation: {
		// Size is set dynamically
	},
	compactMessage: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
		textAlign: 'center',
	},
	inlineContainer: {
		// Size is set dynamically
	},
});

export default LottiePreloader;
