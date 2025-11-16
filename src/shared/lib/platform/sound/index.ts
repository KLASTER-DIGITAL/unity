/**
 * Sound Platform Adapter
 *
 * Automatically exports the correct adapter based on platform:
 * - Web: sound.web.ts (HTML5 Audio API)
 * - React Native: sound.native.ts (expo-av)
 */

export { soundAdapter } from './sound.web';
export * from './types';
