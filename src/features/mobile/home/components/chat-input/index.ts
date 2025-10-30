/**
 * Chat Input Section - Modular exports
 */

export { AIHintSection } from "./AIHintSection";
export { CATEGORIES } from "./constants";
export { InputArea } from "./InputArea";
export { handleFilesDropped, handleMediaUpload } from "./mediaHandlers";
// Export handlers
export { handleSendMessage } from "./messageHandlers";
export {
	checkMicrophonePermission,
	triggerHapticFeedback,
} from "./PermissionUtils";
export { RecordingIndicator } from "./RecordingIndicator";
export { SuccessModal } from "./SuccessModal";
export type { Category, ChatInputSectionProps, ChatMessage } from "./types";
export { handleVoiceInput } from "./voiceHandlers";
