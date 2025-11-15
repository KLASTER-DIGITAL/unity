/**
 * TOTP (Time-based One-Time Password) utilities for 2FA
 * Uses Web Crypto API for secure random generation
 */

/**
 * Generate a random base32 secret for TOTP
 * @returns Base32 encoded secret (16 characters)
 */
export function generateTOTPSecret(): string {
	const buffer = new Uint8Array(10); // 10 bytes = 16 base32 characters
	crypto.getRandomValues(buffer);
	return base32Encode(buffer);
}

/**
 * Generate TOTP URI for QR code
 * @param secret - Base32 encoded secret
 * @param email - User email
 * @param issuer - App name (default: "UNITY")
 * @returns otpauth:// URI
 */
export function generateTOTPUri(secret: string, email: string, issuer = 'UNITY'): string {
	const encodedIssuer = encodeURIComponent(issuer);
	const encodedEmail = encodeURIComponent(email);
	return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
}

/**
 * Verify TOTP code
 * @param secret - Base32 encoded secret
 * @param code - 6-digit code from authenticator app
 * @param window - Time window in steps (default: 1 = ±30 seconds)
 * @returns true if code is valid
 */
export async function verifyTOTPCode(secret: string, code: string, window = 1): Promise<boolean> {
	const now = Math.floor(Date.now() / 1000);
	const timeStep = 30; // TOTP standard: 30 seconds

	// Check current time and ±window steps
	for (let i = -window; i <= window; i++) {
		const time = Math.floor(now / timeStep) + i;
		const expectedCode = await generateTOTPCode(secret, time);
		if (expectedCode === code) {
			return true;
		}
	}

	return false;
}

/**
 * Generate TOTP code for a specific time
 * @param secret - Base32 encoded secret
 * @param time - Time counter (default: current time / 30)
 * @returns 6-digit TOTP code
 */
async function generateTOTPCode(secret: string, time?: number): Promise<string> {
	const counter = time ?? Math.floor(Date.now() / 1000 / 30);
	const key = base32Decode(secret);

	// Convert counter to 8-byte buffer (big-endian)
	const counterBuffer = new ArrayBuffer(8);
	const counterView = new DataView(counterBuffer);
	counterView.setUint32(4, counter, false); // big-endian

	// Import key for HMAC-SHA1
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		key,
		{ name: 'HMAC', hash: 'SHA-1' },
		false,
		['sign']
	);

	// Generate HMAC-SHA1
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
	const signatureArray = new Uint8Array(signature);

	// Dynamic truncation (RFC 4226)
	const offset = signatureArray[signatureArray.length - 1] & 0x0f;
	const binary =
		((signatureArray[offset] & 0x7f) << 24) |
		((signatureArray[offset + 1] & 0xff) << 16) |
		((signatureArray[offset + 2] & 0xff) << 8) |
		(signatureArray[offset + 3] & 0xff);

	// Generate 6-digit code
	const code = (binary % 1000000).toString().padStart(6, '0');
	return code;
}

/**
 * Generate backup codes for 2FA recovery
 * @param count - Number of backup codes to generate (default: 10)
 * @returns Array of backup codes (8 characters each)
 */
export function generateBackupCodes(count = 10): string[] {
	const codes: string[] = [];
	for (let i = 0; i < count; i++) {
		const buffer = new Uint8Array(4); // 4 bytes = 8 hex characters
		crypto.getRandomValues(buffer);
		const code = Array.from(buffer)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
			.toUpperCase();
		codes.push(code);
	}
	return codes;
}

/**
 * Hash backup code for storage
 * @param code - Backup code to hash
 * @returns SHA-256 hash (hex string)
 */
export async function hashBackupCode(code: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(code);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = new Uint8Array(hashBuffer);
	return Array.from(hashArray)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Verify backup code against hashed codes
 * @param code - Backup code to verify
 * @param hashedCodes - Array of hashed backup codes
 * @returns true if code matches any hashed code
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
	const hashedCode = await hashBackupCode(code);
	return hashedCodes.includes(hashedCode);
}

// Base32 encoding/decoding (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Uint8Array): string {
	let bits = 0;
	let value = 0;
	let output = '';

	for (let i = 0; i < buffer.length; i++) {
		value = (value << 8) | buffer[i];
		bits += 8;

		while (bits >= 5) {
			output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}

	if (bits > 0) {
		output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
	}

	return output;
}

function base32Decode(input: string): Uint8Array {
	const cleanInput = input.toUpperCase().replace(/=+$/, '');
	const buffer = new Uint8Array(Math.floor((cleanInput.length * 5) / 8));
	let bits = 0;
	let value = 0;
	let index = 0;

	for (let i = 0; i < cleanInput.length; i++) {
		const char = cleanInput[i];
		const charValue = BASE32_ALPHABET.indexOf(char);
		if (charValue === -1) {
			throw new Error(`Invalid base32 character: ${char}`);
		}

		value = (value << 5) | charValue;
		bits += 5;

		if (bits >= 8) {
			buffer[index++] = (value >>> (bits - 8)) & 255;
			bits -= 8;
		}
	}

	return buffer;
}
