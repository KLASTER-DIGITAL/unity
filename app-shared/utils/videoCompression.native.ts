/**
 * Video Compression - React Native version
 *
 * FFmpeg не поддерживается в React Native (требует WebAssembly)
 * Для React Native используйте нативные библиотеки:
 * - expo-av для базовой обработки видео
 * - react-native-video-processing для сжатия
 * - react-native-compressor для сжатия медиа
 */

export function compressVideo(_file: File): Promise<File> {
	return Promise.reject(
		new Error(
			'Video compression is not supported in React Native. Use native libraries like react-native-compressor instead.'
		)
	);
}

export function compressVideoForUpload(_file: File): Promise<File> {
	return Promise.reject(
		new Error(
			'Video compression is not supported in React Native. Use native libraries like react-native-compressor instead.'
		)
	);
}

export function getVideoMetadata(
	_file: File
): Promise<{ width: number; height: number; duration: number }> {
	return Promise.reject(
		new Error('Video metadata extraction is not supported in React Native. Use expo-av instead.')
	);
}
