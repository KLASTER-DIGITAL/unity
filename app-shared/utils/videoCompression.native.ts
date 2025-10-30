/**
 * Video Compression - React Native version
 *
 * FFmpeg не поддерживается в React Native (требует WebAssembly)
 * Для React Native используйте нативные библиотеки:
 * - expo-av для базовой обработки видео
 * - react-native-video-processing для сжатия
 * - react-native-compressor для сжатия медиа
 */

export async function compressVideo(_file: File): Promise<File> {
	throw new Error(
		'Video compression is not supported in React Native. Use native libraries like react-native-compressor instead.'
	);
}

export async function compressVideoForUpload(_file: File): Promise<File> {
	throw new Error(
		'Video compression is not supported in React Native. Use native libraries like react-native-compressor instead.'
	);
}

export async function getVideoMetadata(
	_file: File
): Promise<{ width: number; height: number; duration: number }> {
	throw new Error(
		'Video metadata extraction is not supported in React Native. Use expo-av instead.'
	);
}
