/**
 * User Types - Shared between PWA and React Native
 *
 * TRULY shared code - NO platform-specific imports
 */

export interface User {
	id: string;
	email: string;
	role: "user" | "super_admin";
	created_at: string;
	updated_at?: string;
}

export interface Profile {
	id: string;
	user_id: string;
	name: string;
	avatar_url?: string;
	language: string;
	theme: "light" | "dark" | "system";
	created_at: string;
	updated_at?: string;
}

export interface UserData {
	user: User;
	profile: Profile;
	id: string; // Alias for user.id
	email: string; // Alias for user.email
	role: "user" | "super_admin"; // Alias for user.role
}
