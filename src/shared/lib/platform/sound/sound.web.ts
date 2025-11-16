/**
 * Web Sound Adapter
 *
 * Uses HTML5 Audio API for sound playback
 */

import type { SoundAdapter, SoundOptions } from './types';

class WebSoundAdapter implements SoundAdapter {
	private currentAudio: HTMLAudioElement | null = null;
	private globalVolume = 1.0;

	async play(soundPath: string, options: SoundOptions = {}): Promise<void> {
		try {
			// Stop previous sound if playing
			if (this.currentAudio) {
				this.currentAudio.pause();
				this.currentAudio.currentTime = 0;
			}

			// Create new audio element
			const audio = new Audio(soundPath);
			audio.volume = (options.volume ?? 1.0) * this.globalVolume;
			audio.loop = options.loop ?? false;
			audio.playbackRate = options.rate ?? 1.0;

			this.currentAudio = audio;

			// Play sound
			await audio.play();

			// Cleanup after playback
			audio.addEventListener('ended', () => {
				if (this.currentAudio === audio) {
					this.currentAudio = null;
				}
			});
		} catch (error) {
			console.error('[WebSoundAdapter] Error playing sound:', error);
			throw error;
		}
	}

	async stop(): Promise<void> {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}
	}

	async setVolume(volume: number): Promise<void> {
		this.globalVolume = Math.max(0, Math.min(1, volume));
		if (this.currentAudio) {
			this.currentAudio.volume = this.globalVolume;
		}
	}
}

export const soundAdapter: SoundAdapter = new WebSoundAdapter();
