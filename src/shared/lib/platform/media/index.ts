/**
 * Media Platform Adapter
 *
 * Provides cross-platform media functionality:
 * - Web: FileReader, URL, Image, Video APIs
 * - Native: expo-file-system, expo-image-manipulator, expo-av
 *
 * @module platform/media
 */

import { WebMediaAdapter } from "./media.web";

// Re-export types from main media file
export type { MediaAdapter } from "../media";

/**
 * Universal media instance
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation (HTMLMediaElement)
 * - React Native build (/app/): Uses /app/shared/lib/platform/media.native.ts (expo-av)
 */
export const media = new WebMediaAdapter();

// Export web adapter
export { WebMediaAdapter };

// ✅ PWA + React Native Architecture: Native types are in /app/shared/lib/platform/media.native.ts
