import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { DesignTokens } from "../../../design-system/tokens";

interface ChatInputSectionProps {
	onMessageSent?: (message: string) => void;
	onEntrySaved?: (entry: any) => void;
	userName?: string;
	userId?: string;
}

export function ChatInputSection({
	onMessageSent,
	onEntrySaved,
	userName = "Анна",
	userId = "anonymous",
}: ChatInputSectionProps) {
	const [inputText, setInputText] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [showAiHint, setShowAiHint] = useState(true);
	const fadeAnim = useRef(new Animated.Value(1)).current;

	// Обработка отправки сообщения
	const handleSendMessage = async () => {
		if (!inputText.trim() || isProcessing) return;

		// Haptic feedback
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			setIsProcessing(true);

			// Скрыть AI hint после первого сообщения
			if (showAiHint) {
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: DesignTokens.animationDuration.normal,
					useNativeDriver: true,
				}).start(() => setShowAiHint(false));
			}

			// TODO: Implement actual API call
			console.log("Sending message:", inputText);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			onMessageSent?.(inputText);
			onEntrySaved?.({
				text: inputText,
				userId,
				timestamp: new Date().toISOString(),
			});

			setInputText("");
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			{/* AI Hint Section */}
			{showAiHint && (
				<Animated.View style={[styles.aiHintContainer, { opacity: fadeAnim }]}>
					<View style={styles.aiHintBadge}>
						<Ionicons
							color={DesignTokens.colors.primary}
							name="sparkles"
							size={14}
						/>
						<Text style={styles.aiHintBadgeText}>AI</Text>
					</View>
					<Text style={styles.aiHintText}>
						Расскажи о своих достижениях, и я помогу их оформить
					</Text>
				</Animated.View>
			)}

			{/* Input Area */}
			<View style={styles.inputContainer}>
				<View style={styles.inputWrapper}>
					{/* Text Input */}
					<TextInput
						editable={!isProcessing}
						maxLength={500}
						multiline
						onChangeText={setInputText}
						placeholder={`Привет ${userName}! Расскажи о своих достижениях...`}
						placeholderTextColor={DesignTokens.colors.textTertiary}
						style={styles.textInput}
						value={inputText}
					/>

					{/* Send Button */}
					<Pressable
						disabled={!inputText.trim() || isProcessing}
						onPress={handleSendMessage}
						style={({ pressed }) => [
							styles.sendButton,
							(!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
							pressed && styles.sendButtonPressed,
						]}
					>
						{isProcessing ? (
							<Ionicons
								color={DesignTokens.colors.background}
								name="hourglass-outline"
								size={20}
							/>
						) : (
							<Ionicons
								color={DesignTokens.colors.background}
								name="send"
								size={20}
							/>
						)}
					</Pressable>
				</View>

				{/* Character Counter */}
				<View style={styles.footer}>
					<Text style={styles.charCounter}>{inputText.length}/500</Text>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: DesignTokens.responsiveSpacing.sectionPaddingX,
		paddingVertical: DesignTokens.spacing.lg,
	},
	aiHintContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: DesignTokens.spacing.sm,
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		backgroundColor: DesignTokens.colors.gray50,
		borderRadius: DesignTokens.borderRadius.lg,
		marginBottom: DesignTokens.spacing.md,
	},
	aiHintBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: DesignTokens.spacing.xs,
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.xs,
		backgroundColor: DesignTokens.colors.background,
		borderRadius: DesignTokens.borderRadius.md,
	},
	aiHintBadgeText: {
		fontSize: DesignTokens.fontSizes.caption,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.primary,
	},
	aiHintText: {
		flex: 1,
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
		lineHeight: DesignTokens.lineHeights.bodySmall,
	},
	inputContainer: {
		gap: DesignTokens.spacing.sm,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: DesignTokens.spacing.md,
		padding: DesignTokens.spacing.lg,
		backgroundColor: DesignTokens.colors.gray50,
		borderRadius: DesignTokens.borderRadius["2xl"],
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	textInput: {
		flex: 1,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
		lineHeight: DesignTokens.lineHeights.body,
		maxHeight: 120,
		paddingVertical: 0,
	},
	sendButton: {
		width: DesignTokens.touchTargets.minimum,
		height: DesignTokens.touchTargets.minimum,
		borderRadius: DesignTokens.borderRadius.full,
		backgroundColor: DesignTokens.colors.primary,
		alignItems: "center",
		justifyContent: "center",
		...DesignTokens.shadows.sm,
	},
	sendButtonDisabled: {
		backgroundColor: DesignTokens.colors.gray300,
	},
	sendButtonPressed: {
		opacity: 0.8,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingHorizontal: DesignTokens.spacing.lg,
	},
	charCounter: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textTertiary,
	},
});
