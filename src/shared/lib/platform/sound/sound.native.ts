/**
 * React Native Sound Adapter
 *
 * Uses expo-av for sound playback
 *
 * NOTE: This file is for React Native build only
 * Will be used when migrating to React Native Expo (Q3 2025)
 */

import type { SoundAdapter, SoundOptions } from './types';

// TODO: Implement with expo-av when migrating to React Native
// import { Audio } from 'expo-av';

class NativeSoundAdapter implements SoundAdapter {
	private currentSound: any = null;
	private globalVolume = 1.0;

	async play(soundPath: string, options: SoundOptions = {}): Promise<void> {
		console.log('[NativeSoundAdapter] TODO: Implement with expo-av');
		console.log('[NativeSoundAdapter] soundPath:', soundPath);
		console.log('[NativeSoundAdapter] options:', options);

		// TODO: Implement with expo-av
		// const { sound } = await Audio.Sound.createAsync(
		//   require(soundPath),
		//   {
		//     volume: (options.volume ?? 1.0) * this.globalVolume,
		//     isLooping: options.loop ?? false,
		//     rate: options.rate ?? 1.0,
		//   }
		// );
		// this.currentSound = sound;
		// await sound.playAsync();
	}

	async stop(): Promise<void> {
		console.log('[NativeSoundAdapter] TODO: Implement with expo-av');
		// TODO: Implement with expo-av
		// if (this.currentSound) {
		//   await this.currentSound.stopAsync();
		//   await this.currentSound.unloadAsync();
		//   this.currentSound = null;
		// }
	}

	async setVolume(volume: number): Promise<void> {
		this.globalVolume = Math.max(0, Math.min(1, volume));
		console.log('[NativeSoundAdapter] TODO: Implement with expo-av');
		// TODO: Implement with expo-av
		// if (this.currentSound) {
		//   await this.currentSound.setVolumeAsync(this.globalVolume);
		// }
	}
}

export const soundAdapter: SoundAdapter = new NativeSoundAdapter();
