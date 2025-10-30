/**
 * Custom Tab Bar for React Native - максимально близко к PWA версии
 *
 * Features:
 * - Floating effect с тенью и скругленными углами
 * - Pill-style активная вкладка с плавными анимациями
 * - Label показывается только для активной вкладки
 * - Reanimated анимации для плавных переходов
 * - iOS Design System compliance
 * - Haptic feedback
 * - Keyboard aware (скрывается при появлении клавиатуры)
 *
 * @author UNITY Team
 * @date 2025-10-30
 */

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { DesignTokens } from '../../design-system/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const { colors } = useTheme();
	const keyboardVisible = useSharedValue(0);

	useEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
			keyboardVisible.value = withTiming(1, {
				duration: 250,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			});
		});

		const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
			keyboardVisible.value = withTiming(0, {
				duration: 250,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			});
		});

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, [keyboardVisible]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY: keyboardVisible.value * 100,
			},
		],
		opacity: 1 - keyboardVisible.value,
	}));

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<View
				style={[
					styles.tabBar,
					{
						backgroundColor: colors.card,
						borderColor: colors.border,
						shadowColor: colors.text,
					},
				]}
			>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label = options.tabBarLabel ?? options.title ?? route.name;
					const isFocused = state.index === index;

					// Icon mapping
					const iconName = getIconName(route.name, isFocused);

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!(isFocused || event.defaultPrevented)) {
							// Haptic feedback
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							navigation.navigate(route.name);
						}
					};

					return (
						<TabButton
							colors={colors}
							iconName={iconName}
							isFocused={isFocused}
							key={route.key}
							label={String(label)}
							onPress={onPress}
						/>
					);
				})}
			</View>
		</Animated.View>
	);
}

interface TabButtonProps {
	label: string;
	iconName: keyof typeof Ionicons.glyphMap;
	isFocused: boolean;
	onPress: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: Theme colors type
	colors: any;
}

function TabButton({ label, iconName, isFocused, onPress, colors }: TabButtonProps) {
	const scale = useSharedValue(1);
	const labelWidth = useSharedValue(isFocused ? 1 : 0);
	const labelOpacity = useSharedValue(isFocused ? 1 : 0);

	useEffect(() => {
		labelWidth.value = withSpring(isFocused ? 1 : 0, {
			damping: 20,
			stiffness: 200,
		});
		labelOpacity.value = withTiming(isFocused ? 1 : 0, {
			duration: 200,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		});
	}, [isFocused, labelOpacity, labelWidth]);

	const handlePressIn = () => {
		scale.value = withSpring(0.95, {
			damping: 15,
			stiffness: 400,
		});
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, {
			damping: 15,
			stiffness: 400,
		});
	};

	const animatedButtonStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const animatedLabelStyle = useAnimatedStyle(() => {
		return {
			width: labelWidth.value * 60, // Approximate width for label
			opacity: labelOpacity.value,
		};
	});

	return (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[
				styles.tabButton,
				isFocused && {
					backgroundColor: `${colors.primary}15`,
				},
				animatedButtonStyle,
			]}
		>
			{/* Icon */}
			<View style={styles.iconContainer}>
				<Ionicons
					color={isFocused ? colors.primary : colors.textSecondary}
					name={iconName}
					size={20}
				/>
			</View>

			{/* Label - only show for active tab */}
			{isFocused && (
				<Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
					<Text numberOfLines={1} style={[styles.label, { color: colors.primary }]}>
						{label}
					</Text>
				</Animated.View>
			)}
		</AnimatedPressable>
	);
}

function getIconName(routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap {
	const iconMap: Record<
		string,
		{
			active: keyof typeof Ionicons.glyphMap;
			inactive: keyof typeof Ionicons.glyphMap;
		}
	> = {
		index: { active: 'home', inactive: 'home-outline' },
		diary: { active: 'book', inactive: 'book-outline' },
		achievements: { active: 'trophy', inactive: 'trophy-outline' },
		settings: { active: 'settings', inactive: 'settings-outline' },
	};

	const icons = iconMap[routeName] || {
		active: 'ellipse',
		inactive: 'ellipse-outline',
	};
	return isFocused ? icons.active : icons.inactive;
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingBottom: Platform.OS === 'ios' ? DesignTokens.spacing.xl : DesignTokens.spacing.md,
		zIndex: 100,
	},
	tabBar: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		borderRadius: DesignTokens.borderRadius.xl,
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.md,
		borderWidth: 1,
		...DesignTokens.shadows.lg,
		// iOS-style blur effect (не работает в RN, но оставляем для будущего)
		// backdropFilter: 'blur(20px)',
	},
	tabButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: DesignTokens.touchTargets.minimum,
		minHeight: DesignTokens.touchTargets.minimum,
		borderRadius: DesignTokens.borderRadius.full,
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.sm,
		gap: DesignTokens.spacing.sm,
	},
	iconContainer: {
		flexShrink: 0,
	},
	labelContainer: {
		overflow: 'hidden',
	},
	label: {
		fontSize: 11,
		fontWeight: '500',
		textAlign: 'center',
	},
});
