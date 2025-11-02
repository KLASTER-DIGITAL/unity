/**
 * Speech Recognition Platform Adapter
 *
 * Provides cross-platform speech recognition functionality:
 * - Web: Web Speech API (SpeechRecognition)
 * - Native: expo-speech (placeholder)
 *
 * @module platform/speech
 */

// ============================================================================
// TYPES
// ============================================================================

export type SpeechRecognitionOptions = {
	/** Language code (e.g., 'ru-RU', 'en-US') */
	language?: string;
	/** Enable continuous recognition (default: false) */
	continuous?: boolean;
	/** Enable interim results (default: false) */
	interimResults?: boolean;
	/** Maximum number of alternatives (default: 1) */
	maxAlternatives?: number;
};

export type SpeechRecognitionResult = {
	/** Recognized transcript */
	transcript: string;
	/** Confidence score (0-1) */
	confidence: number;
	/** Is this a final result? */
	isFinal: boolean;
};

export type SpeechAdapter = {
	/** Check if speech recognition is supported */
	isSupported(): boolean;

	/** Request microphone permissions */
	requestPermissions(): Promise<boolean>;

	/** Start listening */
	startListening(options?: SpeechRecognitionOptions): void;

	/** Stop listening */
	stopListening(): void;

	/** Abort listening */
	abort(): void;

	/** Check if currently listening */
	isListening(): boolean;

	/** Set result callback */
	onResult(callback: (result: SpeechRecognitionResult) => void): void;

	/** Set error callback */
	onError(callback: (error: Error) => void): void;

	/** Set start callback */
	onStart(callback: () => void): void;

	/** Set end callback */
	onEnd(callback: () => void): void;
};

// ============================================================================
// WEB IMPLEMENTATION
// ============================================================================

class WebSpeechAdapter implements SpeechAdapter {
	private recognition: any = null;
	private listening = false;
	private resultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
	private errorCallback: ((error: Error) => void) | null = null;
	private startCallback: (() => void) | null = null;
	private endCallback: (() => void) | null = null;

	constructor() {
		if (this.isSupported()) {
			this.initializeRecognition();
		}
	}

	isSupported(): boolean {
		return !!(
			typeof window !== 'undefined' &&
			('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
		);
	}

	async requestPermissions(): Promise<boolean> {
		if (!this.isSupported()) {
			return false;
		}

		try {
			// Web Speech API doesn't have explicit permission request
			// Permissions are requested when starting recognition
			return true;
		} catch (error) {
			console.error('Permission denied:', error);
			return false;
		}
	}

	startListening(options: SpeechRecognitionOptions = {}): void {
		console.log('[WebSpeechAdapter] startListening called', {
			hasRecognition: !!this.recognition,
			isListening: this.listening,
			options,
		});

		if (!this.recognition) {
			console.error('[WebSpeechAdapter] No recognition instance');
			if (this.errorCallback) {
				this.errorCallback(new Error('Speech recognition not initialized'));
			}
			return;
		}

		if (this.listening) {
			console.warn('[WebSpeechAdapter] Already listening');
			return;
		}

		const {
			language = 'ru-RU',
			continuous = false,
			interimResults = false,
			maxAlternatives = 1,
		} = options;

		this.recognition.lang = language;
		this.recognition.continuous = continuous;
		this.recognition.interimResults = interimResults;
		this.recognition.maxAlternatives = maxAlternatives;

		console.log('[WebSpeechAdapter] Starting recognition with config:', {
			language,
			continuous,
			interimResults,
			maxAlternatives,
		});

		try {
			this.recognition.start();
			console.log('[WebSpeechAdapter] recognition.start() called successfully');
		} catch (error: any) {
			console.error('[WebSpeechAdapter] Failed to start recognition:', error);
			if (this.errorCallback) {
				this.errorCallback(new Error(`Failed to start recognition: ${error.message}`));
			}
		}
	}

	stopListening(): void {
		if (!(this.recognition && this.listening)) {
			return;
		}

		try {
			this.recognition.stop();
		} catch (error) {
			console.error('Error stopping recognition:', error);
		}
	}

	abort(): void {
		if (!this.recognition) {
			return;
		}

		try {
			this.recognition.abort();
			this.listening = false;
		} catch (error) {
			console.error('Error aborting recognition:', error);
		}
	}

	isListening(): boolean {
		return this.listening;
	}

	onResult(callback: (result: SpeechRecognitionResult) => void): void {
		this.resultCallback = callback;
	}

	onError(callback: (error: Error) => void): void {
		this.errorCallback = callback;
	}

	onStart(callback: () => void): void {
		this.startCallback = callback;
	}

	onEnd(callback: () => void): void {
		this.endCallback = callback;
	}

	private initializeRecognition(): void {
		const SpeechRecognition =
			(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
		this.recognition = new SpeechRecognition();

		this.recognition.onstart = () => {
			console.log('[WebSpeechAdapter] onstart event fired');
			this.listening = true;
			if (this.startCallback) {
				this.startCallback();
			}
		};

		this.recognition.onresult = (event: any) => {
			console.log('[WebSpeechAdapter] onresult event fired', event);
			if (!this.resultCallback) {
				return;
			}

			const results = event.results;
			const lastResult = results[results.length - 1];
			const alternative = lastResult[0];

			console.log('[WebSpeechAdapter] Result:', {
				transcript: alternative.transcript,
				confidence: alternative.confidence,
				isFinal: lastResult.isFinal,
			});

			this.resultCallback({
				transcript: alternative.transcript,
				confidence: alternative.confidence,
				isFinal: lastResult.isFinal,
			});
		};

		this.recognition.onend = () => {
			console.log('[WebSpeechAdapter] onend event fired');
			this.listening = false;
			if (this.endCallback) {
				this.endCallback();
			}
		};

		this.recognition.onerror = (event: any) => {
			console.error('[WebSpeechAdapter] onerror event fired:', event.error);
			this.listening = false;

			if (this.errorCallback) {
				let errorMessage = 'Speech recognition error';

				switch (event.error) {
					case 'no-speech':
						errorMessage = 'No speech detected';
						break;
					case 'audio-capture':
						errorMessage = 'No microphone found';
						break;
					case 'not-allowed':
						errorMessage = 'Microphone access denied';
						break;
					case 'network':
						errorMessage = 'Network error';
						break;
					case 'aborted':
						errorMessage = 'Recognition aborted';
						break;
					default:
						errorMessage = `Speech recognition error: ${event.error}`;
				}

				console.error('[WebSpeechAdapter] Error message:', errorMessage);
				this.errorCallback(new Error(errorMessage));
			}
		};
	}
}

// ============================================================================
// EXPORT
// ============================================================================

// ✅ PWA + React Native Architecture: ONLY export web implementation in PWA build
// React Native implementation is in /app/shared/lib/platform/speech.native.ts
export const speech: SpeechAdapter = new WebSpeechAdapter();
