/**
 * Voice Recording Platform Adapter
 * 
 * Provides cross-platform voice recording functionality:
 * - Web: MediaRecorder + AudioContext
 * - Native: expo-av Audio.Recording
 * 
 * @module platform/voice
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceRecordingOptions {
  /** Enable echo cancellation (default: true) */
  echoCancellation?: boolean;
  /** Enable noise suppression (default: true) */
  noiseSuppression?: boolean;
  /** Enable automatic gain control (default: true) */
  autoGainControl?: boolean;
  /** Audio quality: 'low' | 'medium' | 'high' (default: 'medium') */
  quality?: 'low' | 'medium' | 'high';
}

export interface VoiceRecordingResult {
  /** Audio data as Blob (web) or URI (native) */
  data: Blob | string;
  /** Duration in seconds */
  duration: number;
  /** MIME type */
  mimeType: string;
}

export interface VoiceAdapter {
  /** Check if voice recording is supported */
  isSupported(): boolean;
  
  /** Request microphone permissions */
  requestPermissions(): Promise<boolean>;
  
  /** Start recording */
  startRecording(options?: VoiceRecordingOptions): Promise<void>;
  
  /** Stop recording and return result */
  stopRecording(): Promise<VoiceRecordingResult | null>;
  
  /** Pause recording */
  pauseRecording(): Promise<void>;
  
  /** Resume recording */
  resumeRecording(): Promise<void>;
  
  /** Cancel recording */
  cancelRecording(): void;
  
  /** Get current audio level (0-1) */
  getAudioLevel(): number;
  
  /** Get recording duration in seconds */
  getDuration(): number;
  
  /** Check if currently recording */
  isRecording(): boolean;
  
  /** Check if currently paused */
  isPaused(): boolean;
}

// ============================================================================
// WEB IMPLEMENTATION
// ============================================================================

class WebVoiceAdapter implements VoiceAdapter {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private totalPausedTime: number = 0;
  private audioLevel: number = 0;
  private recording: boolean = false;
  private paused: boolean = false;

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Permission denied:', error);
      return false;
    }
  }

  async startRecording(options: VoiceRecordingOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Voice recording is not supported');
    }

    if (this.recording) {
      throw new Error('Already recording');
    }

    const {
      echoCancellation = true,
      noiseSuppression = true,
      autoGainControl = true,
    } = options;

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        },
      });

      // Create AudioContext for audio level analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      // Start audio level analysis
      this.analyzeAudio();

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.recording = true;
      this.paused = false;
      this.startTime = Date.now();
      this.totalPausedTime = 0;
    } catch (error: any) {
      this.cleanup();
      
      // Handle specific errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone access denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('Microphone not found');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Microphone is being used by another application');
      } else {
        throw new Error(`Failed to start recording: ${error.message}`);
      }
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.recording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });

        const duration = this.getDuration();
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';

        this.cleanup();

        resolve({
          data: audioBlob,
          duration,
          mimeType,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  async pauseRecording(): Promise<void> {
    if (!this.mediaRecorder || !this.recording || this.paused) {
      return;
    }

    this.mediaRecorder.pause();
    this.paused = true;
    this.pauseTime = Date.now();
  }

  async resumeRecording(): Promise<void> {
    if (!this.mediaRecorder || !this.recording || !this.paused) {
      return;
    }

    this.mediaRecorder.resume();
    this.paused = false;
    this.totalPausedTime += Date.now() - this.pauseTime;
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.recording) {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  getAudioLevel(): number {
    return this.audioLevel;
  }

  getDuration(): number {
    if (!this.recording) {
      return 0;
    }

    const now = this.paused ? this.pauseTime : Date.now();
    return Math.floor((now - this.startTime - this.totalPausedTime) / 1000);
  }

  isRecording(): boolean {
    return this.recording;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private analyzeAudio = () => {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    this.audioLevel = Math.min(average / 128, 1);

    this.animationFrame = requestAnimationFrame(this.analyzeAudio);
  };

  private cleanup() {
    this.recording = false;
    this.paused = false;
    this.audioLevel = 0;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.analyser = null;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

// ✅ PWA + React Native Architecture: ONLY export web implementation in PWA build
// React Native implementation is in /app/shared/lib/platform/voice.native.ts
export const voice: VoiceAdapter = new WebVoiceAdapter();

