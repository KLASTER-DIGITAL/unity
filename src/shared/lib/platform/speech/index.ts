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
// BROWSER DETECTION
// ============================================================================

export type BrowserInfo = {
	name: string;
	version: string;
	os: string;
	isMobile: boolean;
	isIOS: boolean;
	isAndroid: boolean;
	isSafari: boolean;
	isChrome: boolean;
	isPWA: boolean;
};

/**
 * Detect browser and device information
 */
function detectBrowser(): BrowserInfo {
	const ua = navigator.userAgent;
	const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
	const isIOS = /iPhone|iPad|iPod/i.test(ua);
	const isAndroid = /Android/i.test(ua);

	let name = 'Unknown';
	let version = 'Unknown';
	let os = 'Unknown';

	// Detect OS
	if (/Windows/i.test(ua)) {
		os = 'Windows';
	} else if (/Mac OS X/i.test(ua)) {
		os = 'macOS';
	} else if (/Linux/i.test(ua)) {
		os = 'Linux';
	} else if (/Android/i.test(ua)) {
		os = 'Android';
	} else if (/iPhone|iPad|iPod/i.test(ua)) {
		os = 'iOS';
	}

	// Detect browser
	const isIOSChrome = /CriOS/.test(ua);
	const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua);
	const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua) && !/CriOS/i.test(ua);

	if (/Edg\//i.test(ua)) {
		name = 'Edge';
		version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
	} else if (isIOSChrome) {
		name = 'Chrome (iOS)';
		version = ua.match(/CriOS\/(\d+)/)?.[1] || 'Unknown';
	} else if (isChrome) {
		name = 'Chrome';
		version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
	} else if (/Firefox/i.test(ua)) {
		name = 'Firefox';
		version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
	} else if (isSafari) {
		name = 'Safari';
		version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
	} else if (/OPR\//i.test(ua)) {
		name = 'Opera';
		version = ua.match(/OPR\/(\d+)/)?.[1] || 'Unknown';
	} else if (/SamsungBrowser/i.test(ua)) {
		name = 'Samsung Internet';
		version = ua.match(/SamsungBrowser\/(\d+)/)?.[1] || 'Unknown';
	}

	// Check if running as PWA (safely, without assuming matchMedia exists)
	let isPWA = false;
	if (typeof window !== 'undefined') {
		const hasMatchMedia = typeof window.matchMedia === 'function';
		if (hasMatchMedia && window.matchMedia('(display-mode: standalone)').matches) {
			isPWA = true;
		} else if ((window.navigator as any).standalone === true) {
			isPWA = true;
		}
	}

	return {
		name,
		version,
		os,
		isMobile,
		isIOS,
		isAndroid,
		isSafari,
		isChrome,
		isPWA,
	};
}

// ============================================================================
// WEB IMPLEMENTATION
// ============================================================================

class WebSpeechAdapter implements SpeechAdapter {
	private browserInfo: BrowserInfo;
	private recognition: any = null;
	private listening = false;
	private shuttingDown = false; // ✅ Гард: игнорировать события после abort/stop
	private resultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
	private errorCallback: ((error: Error) => void) | null = null;
	private startCallback: (() => void) | null = null;
	private endCallback: (() => void) | null = null;

	constructor() {
		this.browserInfo = detectBrowser();

		console.log('[WebSpeechAdapter] Browser info:', this.browserInfo);

		if (this.isSupported()) {
			this.initializeRecognition(true);
		} else {
			console.warn('[WebSpeechAdapter] Speech recognition not supported:', {
				browser: this.browserInfo.name,
				os: this.browserInfo.os,
				isMobile: this.browserInfo.isMobile,
				isPWA: this.browserInfo.isPWA,
			});
		}
	}

	isSupported(): boolean {
		// Check if Web Speech API exists
		const hasAPI = !!(
			typeof window !== 'undefined' &&
			('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
		);

		if (!hasAPI) {
			return false;
		}

		// ✅ ИЗМЕНЕНИЕ: НЕ блокируем iOS PWA, позволяем попробовать
		// Если не работает - пользователь увидит ошибку и сможет использовать текстовый ввод
		// Это соответствует поведению OnboardingScreen4 где голосовой ввод работает

		// iOS Safari in PWA mode: Web Speech API может не работать, но позволяем попробовать
		if (this.browserInfo.isIOS && this.browserInfo.isPWA) {
			console.warn(
				'[WebSpeechAdapter] iOS Safari PWA: Web Speech API may not work. Allowing user to try.'
			);
		}

		// iOS Safari in browser mode has limited support
		if (this.browserInfo.isIOS && this.browserInfo.isSafari) {
			console.warn(
				'[WebSpeechAdapter] iOS Safari has limited Web Speech API support. May not work reliably.'
			);
		}

		return true; // ✅ Всегда возвращаем true если API существует
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

		// ✅ КРИТИЧНО для мобильных: пересоздаём инстанс SpeechRecognition перед каждым стартом
		// Это предотвращает зацикливание на iOS Safari
		this.initializeRecognition(true);

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
			this.shuttingDown = false; // ✅ Сбрасываем гард перед стартом
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
			this.shuttingDown = true; // ✅ Устанавливаем гард перед stop
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
			this.shuttingDown = true; // ✅ Устанавливаем гард перед abort
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

	private initializeRecognition(force = false): void {
		const SpeechRecognition =
			(window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

		// ✅ Пересоздаём инстанс если force=true (на каждый startListening для мобильных)
		if (!force && this.recognition) return;
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

			// ✅ Игнорируем события если идёт shutdown (предотвращает повторные вызовы на мобильных)
			if (this.shuttingDown) {
				console.log('[WebSpeechAdapter] Ignoring result - shutting down');
				return;
			}

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

			// ✅ НЕ вызываем endCallback если это результат ручной остановки
			// Это предотвращает перезапуск на мобильных
			if (this.shuttingDown) {
				console.log('[WebSpeechAdapter] Ignoring onend - shutting down');
				return;
			}

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
