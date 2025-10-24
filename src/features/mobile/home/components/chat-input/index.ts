/**
 * Chat Input Section - Modular exports
 */

export { CATEGORIES } from "./constants";
export { RecordingIndicator } from "./RecordingIndicator";
export { SuccessModal } from "./SuccessModal";
export { AIHintSection } from "./AIHintSection";
export { InputArea } from "./InputArea";
export { checkMicrophonePermission, triggerHapticFeedback } from "./PermissionUtils";

// Export handlers
export { handleSendMessage } from "./messageHandlers";
export { handleVoiceInput } from "./voiceHandlers";
export { handleMediaUpload, handleFilesDropped } from "./mediaHandlers";

export type { ChatMessage, ChatInputSectionProps, Category } from "./types";

