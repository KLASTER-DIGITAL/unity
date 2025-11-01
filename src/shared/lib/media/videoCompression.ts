/**
 * Video Compression - Platform Adapter
 *
 * Provides cross-platform video compression:
 * - Web: FFmpeg WebAssembly
 * - Native: React Native libraries (expo-av, react-native-compressor)
 *
 * @module utils/videoCompression
 */

// Re-export from web version for web builds
// For React Native, Vite will automatically use videoCompression.native.ts
export {
	compressVideo,
	generateVideoThumbnail,
	getVideoMetadata,
	isVideoTooLarge,
	isVideoTooLong,
	validateVideo,
} from './videoCompression.web';
