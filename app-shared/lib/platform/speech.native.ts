/**
 * Native Speech Recognition Adapter (React Native)
 *
 * Uses @react-native-voice/voice for speech recognition on iOS and Android
 *
 * @module platform/speech/native
 */

import type { SpeechAdapter, SpeechRecognitionOptions, SpeechRecognitionResult } from './index';

// ============================================================================
// NATIVE IMPLEMENTATION
// ============================================================================

export class NativeSpeechAdapter implements SpeechAdapter {
  private listening = false;
  private resultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private startCallback: (() => void) | null = null;
  private endCallback: (() => void) | null = null;
  private initialized = false;

  // Dynamic imports to avoid bundling in web
  private Voice: any = null;

  private async init(): Promise<void> {
    if (this.initialized) return;

    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      try {
        const moduleName = '@react-native-voice/voice';
        const VoiceModule = await import(/* @vite-ignore */ moduleName);
        this.Voice = VoiceModule.default;

        // Set up event listeners
        this.setupEventListeners();

        this.initialized = true;
      } catch (error) {
        console.error('Failed to load @react-native-voice/voice:', error);
        throw new Error('@react-native-voice/voice is not available');
      }
    }
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  }

  async requestPermissions(): Promise<boolean> {
    await this.init();

    if (!this.Voice) {
      return false;
    }

    try {
      // @react-native-voice/voice handles permissions automatically
      // We can check if it's available by trying to get available voices
      const available = await this.Voice.isAvailable();
      return available === 1 || available === true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  startListening(options: SpeechRecognitionOptions = {}): void {
    if (!this.Voice) {
      throw new Error('@react-native-voice/voice is not available');
    }

    if (this.listening) {
      throw new Error('Already listening');
    }

    const {
      language = 'ru-RU',
      continuous = false,
      interimResults = false,
      maxAlternatives = 1,
    } = options;

    try {
      // Start recognition
      this.Voice.start(language, {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: continuous ? 10_000 : 2000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: continuous ? 5000 : 1000,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
        EXTRA_MAX_RESULTS: maxAlternatives,
        EXTRA_PARTIAL_RESULTS: interimResults,
      });

      this.listening = true;
    } catch (error: any) {
      this.listening = false;

      if (this.errorCallback) {
        this.errorCallback(new Error(`Failed to start listening: ${error.message}`));
      }
    }
  }

  stopListening(): void {
    if (!(this.Voice && this.listening)) {
      return;
    }

    try {
      this.Voice.stop();
      this.listening = false;
    } catch (error: any) {
      if (this.errorCallback) {
        this.errorCallback(new Error(`Failed to stop listening: ${error.message}`));
      }
    }
  }

  abort(): void {
    if (!(this.Voice && this.listening)) {
      return;
    }

    try {
      this.Voice.cancel();
      this.listening = false;
    } catch (error: any) {
      if (this.errorCallback) {
        this.errorCallback(new Error(`Failed to abort listening: ${error.message}`));
      }
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

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupEventListeners() {
    if (!this.Voice) return;

    // Speech start event
    this.Voice.onSpeechStart = () => {
      if (this.startCallback) {
        this.startCallback();
      }
    };

    // Speech end event
    this.Voice.onSpeechEnd = () => {
      this.listening = false;
      if (this.endCallback) {
        this.endCallback();
      }
    };

    // Partial results (interim)
    this.Voice.onSpeechPartialResults = (event: any) => {
      if (this.resultCallback && event.value && event.value.length > 0) {
        const transcript = event.value[0];
        this.resultCallback({
          transcript,
          confidence: 0.5, // Partial results don't have confidence
          isFinal: false,
        });
      }
    };

    // Final results
    this.Voice.onSpeechResults = (event: any) => {
      if (this.resultCallback && event.value && event.value.length > 0) {
        const transcript = event.value[0];

        // Get confidence if available
        let confidence = 1.0;
        if (event.confidence && event.confidence.length > 0) {
          confidence = Number.parseFloat(event.confidence[0]) || 1.0;
        }

        this.resultCallback({
          transcript,
          confidence,
          isFinal: true,
        });
      }
    };

    // Error event
    this.Voice.onSpeechError = (event: any) => {
      this.listening = false;

      if (this.errorCallback) {
        let errorMessage = 'Speech recognition error';

        if (event.error) {
          const errorCode = event.error.code || event.error.message || event.error;

          switch (errorCode) {
            case '1':
            case 'network':
              errorMessage = 'Network error';
              break;
            case '2':
            case 'network_timeout':
              errorMessage = 'Network timeout';
              break;
            case '3':
            case 'audio':
              errorMessage = 'Audio recording error';
              break;
            case '4':
            case 'server':
              errorMessage = 'Server error';
              break;
            case '5':
            case 'client':
              errorMessage = 'Client error';
              break;
            case '6':
            case 'speech_timeout':
              errorMessage = 'No speech detected';
              break;
            case '7':
            case 'no_match':
              errorMessage = 'No recognition result matched';
              break;
            case '8':
            case 'recognizer_busy':
              errorMessage = 'Recognition service busy';
              break;
            case '9':
            case 'insufficient_permissions':
              errorMessage = 'Microphone permission denied';
              break;
            default:
              errorMessage = `Speech recognition error: ${errorCode}`;
          }
        }

        this.errorCallback(new Error(errorMessage));
      }
    };

    // Recognition availability changed
    this.Voice.onSpeechRecognized = () => {
      // Speech was recognized (can be used for UI feedback)
    };

    // Volume changed (can be used for audio level visualization)
    this.Voice.onSpeechVolumeChanged = (_event: any) => {
      // Volume level changed (event.value contains the volume)
    };
  }

  // Cleanup method for destroying the adapter
  async destroy(): Promise<void> {
    if (this.Voice) {
      try {
        await this.Voice.destroy();
        this.Voice.removeAllListeners();
      } catch (error) {
        console.error('Failed to destroy Voice:', error);
      }
    }

    this.listening = false;
    this.resultCallback = null;
    this.errorCallback = null;
    this.startCallback = null;
    this.endCallback = null;
    this.initialized = false;
  }
}
