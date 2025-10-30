/**
 * Native Voice Recording Adapter (React Native)
 *
 * Uses expo-av for audio recording on iOS and Android
 *
 * @module platform/voice/native
 */

import type {
	VoiceAdapter,
	VoiceRecordingOptions,
	VoiceRecordingResult,
} from "./index";

// ============================================================================
// NATIVE IMPLEMENTATION
// ============================================================================

export class NativeVoiceAdapter implements VoiceAdapter {
	private recording: any = null;
	// Note: recordingStatus is kept for future use in React Native implementation
	// @ts-expect-error - recordingStatus is for future React Native implementation
	private recordingStatus: any = null;
	private startTime = 0;
	private pauseTime = 0;
	private totalPausedTime = 0;
	private isRecordingState = false;
	private isPausedState = false;
	private audioLevel = 0;
	private initialized = false;

	// Dynamic imports to avoid bundling in web
	private Audio: any = null;

	private async init(): Promise<void> {
		if (this.initialized) return;

		if (
			typeof navigator !== "undefined" &&
			navigator.product === "ReactNative"
		) {
			try {
				const moduleName = "expo-av";
				const ExpoAV = await import(/* @vite-ignore */ moduleName);
				this.Audio = ExpoAV.Audio;
				this.initialized = true;
			} catch (error) {
				console.error("Failed to load expo-av:", error);
				throw new Error("expo-av is not available");
			}
		}
	}

	isSupported(): boolean {
		return (
			typeof navigator !== "undefined" && navigator.product === "ReactNative"
		);
	}

	async requestPermissions(): Promise<boolean> {
		await this.init();

		if (!this.Audio) {
			return false;
		}

		try {
			const { status } = await this.Audio.requestPermissionsAsync();
			return status === "granted";
		} catch (error) {
			console.error("Permission request failed:", error);
			return false;
		}
	}

	async startRecording(options: VoiceRecordingOptions = {}): Promise<void> {
		await this.init();

		if (!this.Audio) {
			throw new Error("expo-av is not available");
		}

		if (this.isRecordingState) {
			throw new Error("Already recording");
		}

		try {
			// Request permissions
			const { status } = await this.Audio.requestPermissionsAsync();
			if (status !== "granted") {
				throw new Error("Microphone access denied");
			}

			// Set audio mode for recording
			await this.Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			// Map quality to recording options
			const quality = options.quality || "medium";
			const recordingOptions = this.getRecordingOptions(quality);

			// Create and start recording
			const { recording } =
				await this.Audio.Recording.createAsync(recordingOptions);

			this.recording = recording;
			this.isRecordingState = true;
			this.isPausedState = false;
			this.startTime = Date.now();
			this.totalPausedTime = 0;

			// Start monitoring audio level
			this.startAudioLevelMonitoring();
		} catch (error: any) {
			this.cleanup();

			if (error.message?.includes("denied")) {
				throw new Error("Microphone access denied");
			}
			if (error.message?.includes("not found")) {
				throw new Error("Microphone not found");
			}
			throw new Error(`Failed to start recording: ${error.message}`);
		}
	}

	async stopRecording(): Promise<VoiceRecordingResult | null> {
		if (!(this.recording && this.isRecordingState)) {
			return null;
		}

		try {
			// Stop recording
			await this.recording.stopAndUnloadAsync();

			// Get recording URI
			const uri = this.recording.getURI();

			// Get recording status for duration
			const status = await this.recording.getStatusAsync();
			const duration = Math.floor((status.durationMillis || 0) / 1000);

			// Determine MIME type based on platform
			const mimeType = this.getMimeType();

			this.cleanup();

			return {
				data: uri,
				duration,
				mimeType,
			};
		} catch (error: any) {
			this.cleanup();
			throw new Error(`Failed to stop recording: ${error.message}`);
		}
	}

	async pauseRecording(): Promise<void> {
		if (!(this.recording && this.isRecordingState) || this.isPausedState) {
			return;
		}

		try {
			await this.recording.pauseAsync();
			this.isPausedState = true;
			this.pauseTime = Date.now();
		} catch (error: any) {
			throw new Error(`Failed to pause recording: ${error.message}`);
		}
	}

	async resumeRecording(): Promise<void> {
		if (!(this.recording && this.isRecordingState && this.isPausedState)) {
			return;
		}

		try {
			await this.recording.startAsync();
			this.isPausedState = false;
			this.totalPausedTime += Date.now() - this.pauseTime;
		} catch (error: any) {
			throw new Error(`Failed to resume recording: ${error.message}`);
		}
	}

	cancelRecording(): void {
		if (this.recording && this.isRecordingState) {
			this.recording.stopAndUnloadAsync().catch(() => {
				// Ignore errors during cancel
			});
		}
		this.cleanup();
	}

	getAudioLevel(): number {
		return this.audioLevel;
	}

	getDuration(): number {
		if (!this.isRecordingState) {
			return 0;
		}

		const now = this.isPausedState ? this.pauseTime : Date.now();
		return Math.floor((now - this.startTime - this.totalPausedTime) / 1000);
	}

	isRecording(): boolean {
		return this.isRecordingState;
	}

	isPaused(): boolean {
		return this.isPausedState;
	}

	// ============================================================================
	// PRIVATE METHODS
	// ============================================================================

	private getRecordingOptions(quality: "low" | "medium" | "high") {
		const baseOptions = {
			android: {
				extension: ".m4a",
				outputFormat: this.Audio?.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
				audioEncoder: this.Audio?.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
			},
			ios: {
				extension: ".m4a",
				outputFormat: this.Audio?.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
				audioQuality: this.Audio?.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
			},
		};

		// Quality settings
		const qualitySettings = {
			low: {
				android: {
					...baseOptions.android,
					sampleRate: 16_000,
					numberOfChannels: 1,
					bitRate: 32_000,
				},
				ios: {
					...baseOptions.ios,
					sampleRate: 16_000,
					numberOfChannels: 1,
					bitRate: 32_000,
					audioQuality: this.Audio?.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
				},
			},
			medium: {
				android: {
					...baseOptions.android,
					sampleRate: 44_100,
					numberOfChannels: 1,
					bitRate: 64_000,
				},
				ios: {
					...baseOptions.ios,
					sampleRate: 44_100,
					numberOfChannels: 1,
					bitRate: 64_000,
					audioQuality: this.Audio?.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
				},
			},
			high: {
				android: {
					...baseOptions.android,
					sampleRate: 44_100,
					numberOfChannels: 2,
					bitRate: 128_000,
				},
				ios: {
					...baseOptions.ios,
					sampleRate: 44_100,
					numberOfChannels: 2,
					bitRate: 128_000,
					audioQuality: this.Audio?.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
				},
			},
		};

		return qualitySettings[quality];
	}

	private getMimeType(): string {
		// expo-av uses M4A format on both iOS and Android
		return "audio/m4a";
	}

	private startAudioLevelMonitoring() {
		// expo-av provides metering data through status updates
		const interval = setInterval(async () => {
			if (!(this.recording && this.isRecordingState)) {
				clearInterval(interval);
				return;
			}

			try {
				const status = await this.recording.getStatusAsync();
				if (status.metering !== undefined) {
					// Normalize metering value (typically -160 to 0 dB) to 0-1 range
					const normalized = Math.max(
						0,
						Math.min(1, (status.metering + 160) / 160),
					);
					this.audioLevel = normalized;
				}
			} catch {
				// Ignore errors during monitoring
			}
		}, 100); // Update every 100ms
	}

	private cleanup() {
		this.isRecordingState = false;
		this.isPausedState = false;
		this.audioLevel = 0;
		this.recording = null;
		this.recordingStatus = null;
	}
}
