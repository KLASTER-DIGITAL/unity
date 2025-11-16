/**
 * Sound Platform Adapter Types
 *
 * Provides cross-platform sound playback interface
 * - Web: HTML5 Audio API
 * - React Native: expo-av
 */

export interface SoundAdapter {
	/**
	 * Play a sound file
	 * @param soundPath - Path to sound file (e.g., '/sounds/achievement.mp3')
	 * @param options - Playback options
	 */
	play(soundPath: string, options?: SoundOptions): Promise<void>;

	/**
	 * Stop currently playing sound
	 */
	stop(): Promise<void>;

	/**
	 * Set global volume (0.0 - 1.0)
	 */
	setVolume(volume: number): Promise<void>;
}

export interface SoundOptions {
	/**
	 * Volume for this specific sound (0.0 - 1.0)
	 * @default 1.0
	 */
	volume?: number;

	/**
	 * Loop the sound
	 * @default false
	 */
	loop?: boolean;

	/**
	 * Playback rate (0.5 - 2.0)
	 * @default 1.0
	 */
	rate?: number;
}
