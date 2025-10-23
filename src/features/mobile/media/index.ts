/**
 * Media feature - Media handling components and hooks
 *
 * Components:
 * - MediaLightbox: Full-screen media viewer with navigation
 * - MediaPreview: Media preview grid with remove functionality
 * - VoiceRecordingModal: Voice recording modal with audio level visualization
 * - PermissionGuide: Permission request guide for microphone/camera
 *
 * Hooks:
 * - useVoiceRecorder: Voice recording functionality
 * - useMediaUploader: Media upload functionality with compression
 */

// Components
export { MediaLightbox } from './components/MediaLightbox';
export { MediaPreview } from './components/MediaPreview';
export { VoiceRecordingModal } from './components/VoiceRecordingModal';
export { PermissionGuide } from './components/PermissionGuide';

// Hooks
export { useVoiceRecorder } from './hooks/useVoiceRecorder';
// NOTE: useMediaUploader moved to @/shared/hooks/useMediaUploader
// Import directly from @/shared/hooks/useMediaUploader instead
