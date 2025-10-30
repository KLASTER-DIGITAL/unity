/**
 * Language Detection Utilities
 *
 * Uses i18n Platform Adapter for device language detection
 */

import { i18nAdapter } from "../platform/i18n";
import { storage } from "../platform/storage";

const LANGUAGE_STORAGE_KEY = "user_preferred_language";
const AUTO_DETECT_ENABLED_KEY = "i18n_auto_detect_enabled";

/**
 * Get user's preferred language with auto-detection
 *
 * Priority:
 * 1. User's manually selected language (from storage)
 * 2. Device language (if auto-detect enabled)
 * 3. Default language ('ru')
 */
export async function getPreferredLanguage(): Promise<string> {
	try {
		// 1. Check if user has manually selected a language
		const savedLanguage = await storage.getItem(LANGUAGE_STORAGE_KEY);
		if (savedLanguage) {
			console.log(`[i18n] Using saved language: ${savedLanguage}`);
			return savedLanguage;
		}

		// 2. Check if auto-detect is enabled
		const autoDetectEnabled = await isAutoDetectEnabled();
		if (autoDetectEnabled) {
			const deviceLanguage = i18nAdapter.getDeviceLanguage();
			console.log(`[i18n] Auto-detected device language: ${deviceLanguage}`);
			return deviceLanguage;
		}

		// 3. Fallback to default
		console.log("[i18n] Using default language: ru");
		return "ru";
	} catch (error) {
		console.error("[i18n] Error getting preferred language:", error);
		return "ru";
	}
}

/**
 * Save user's preferred language
 */
export async function savePreferredLanguage(language: string): Promise<void> {
	try {
		await storage.setItem(LANGUAGE_STORAGE_KEY, language);
		console.log(`[i18n] Saved preferred language: ${language}`);
	} catch (error) {
		console.error("[i18n] Error saving preferred language:", error);
	}
}

/**
 * Clear saved language preference (will use auto-detect or default)
 */
export async function clearPreferredLanguage(): Promise<void> {
	try {
		await storage.removeItem(LANGUAGE_STORAGE_KEY);
		console.log("[i18n] Cleared preferred language");
	} catch (error) {
		console.error("[i18n] Error clearing preferred language:", error);
	}
}

/**
 * Check if auto-detect is enabled
 */
export async function isAutoDetectEnabled(): Promise<boolean> {
	try {
		const enabled = await storage.getItem(AUTO_DETECT_ENABLED_KEY);
		return enabled === "true" || enabled === null; // Default: true
	} catch (error) {
		console.error("[i18n] Error checking auto-detect status:", error);
		return true; // Default: enabled
	}
}

/**
 * Enable/disable auto-detect
 */
export async function setAutoDetectEnabled(enabled: boolean): Promise<void> {
	try {
		await storage.setItem(AUTO_DETECT_ENABLED_KEY, enabled.toString());
		console.log(`[i18n] Auto-detect ${enabled ? "enabled" : "disabled"}`);
	} catch (error) {
		console.error("[i18n] Error setting auto-detect:", error);
	}
}

/**
 * Get device language (without checking storage)
 */
export function getDeviceLanguage(): string {
	return i18nAdapter.getDeviceLanguage();
}

/**
 * Get list of preferred languages from device
 */
export function getPreferredLanguages(): string[] {
	return i18nAdapter.getPreferredLanguages();
}

/**
 * Get locale information
 */
export function getLocaleInfo() {
	return i18nAdapter.getLocaleInfo();
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
	return i18nAdapter.isLanguageSupported(language);
}
