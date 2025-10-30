/**
 * Unit tests for Authentication System
 * Tests: login, logout, session management, password reset
 * Coverage target: 80%+
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkSession, signInWithEmail, signOut, signUpWithEmail } from '@/utils/auth';
import { createClient } from '@/utils/supabase/client';

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
	createClient: vi.fn(),
}));

// Mock API functions
vi.mock('@/shared/lib/api', () => ({
	createUserProfile: vi.fn(),
	getUserProfile: vi.fn(),
	createEntry: vi.fn(),
	analyzeTextWithAI: vi.fn(),
}));

describe('Authentication System', () => {
	let mockSupabase: any;

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks();

		// Create mock Supabase client
		mockSupabase = {
			auth: {
				signUp: vi.fn(),
				signInWithPassword: vi.fn(),
				signOut: vi.fn(),
				getSession: vi.fn(),
				signInWithOAuth: vi.fn(),
			},
		};

		// Mock createClient to return our mock
		(createClient as any).mockReturnValue(mockSupabase);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('signInWithEmail', () => {
		it('should successfully sign in with valid credentials', async () => {
			const mockUser = {
				id: 'user-123',
				email: 'test@example.com',
			};

			const mockProfile = {
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				role: 'user',
				onboardingCompleted: true,
			};

			// Mock successful sign in
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			// Mock getUserProfile
			const { getUserProfile } = await import('@/shared/lib/api');
			(getUserProfile as any).mockResolvedValue(mockProfile);

			const result = await signInWithEmail('test@example.com', 'password123');

			expect(result.success).toBe(true);
			expect(result.user).toEqual(mockUser);
			expect(result.profile).toEqual(mockProfile);
			expect(result.needsOnboarding).toBe(false);
			expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123',
			});
		});

		it('should return error for invalid credentials', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: null },
				error: { message: 'Invalid login credentials' },
			});

			const result = await signInWithEmail('test@example.com', 'wrongpassword');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Invalid login credentials');
			expect(result.user).toBeUndefined();
		});

		it('should detect users needing onboarding', async () => {
			const mockUser = {
				id: 'user-456',
				email: 'newuser@example.com',
			};

			const mockProfile = {
				id: 'user-456',
				email: 'newuser@example.com',
				name: 'New User',
				role: 'user',
				onboardingCompleted: false,
			};

			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const { getUserProfile } = await import('@/shared/lib/api');
			(getUserProfile as any).mockResolvedValue(mockProfile);

			const result = await signInWithEmail('newuser@example.com', 'password123');

			expect(result.success).toBe(true);
			expect(result.needsOnboarding).toBe(true);
		});
	});

	describe('signUpWithEmail', () => {
		it('should successfully create new user account', async () => {
			const mockUser = {
				id: 'user-789',
				email: 'newuser@example.com',
			};

			const mockProfile = {
				id: 'user-789',
				email: 'newuser@example.com',
				name: 'New User',
				role: 'user',
				onboardingCompleted: false,
			};

			mockSupabase.auth.signUp.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const { createUserProfile } = await import('@/shared/lib/api');
			(createUserProfile as any).mockResolvedValue(mockProfile);

			const result = await signUpWithEmail('newuser@example.com', 'password123', {
				name: 'New User',
				diaryName: 'My Diary',
				diaryEmoji: '📔',
				language: 'en',
			});

			expect(result.success).toBe(true);
			expect(result.user).toEqual(mockUser);
			expect(result.profile).toEqual(mockProfile);
			expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
				email: 'newuser@example.com',
				password: 'password123',
				options: {
					data: {
						name: 'New User',
					},
				},
			});
		});

		it('should return error for duplicate email', async () => {
			mockSupabase.auth.signUp.mockResolvedValue({
				data: { user: null },
				error: { message: 'User already registered' },
			});

			const result = await signUpWithEmail('existing@example.com', 'password123', {
				name: 'Test User',
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe('User already registered');
		});
	});

	describe('signOut', () => {
		it('should successfully sign out user', async () => {
			mockSupabase.auth.signOut.mockResolvedValue({ error: null });

			await signOut();

			expect(mockSupabase.auth.signOut).toHaveBeenCalled();
		});
	});

	describe('checkSession', () => {
		it('should return user data for valid session', async () => {
			const mockUser = {
				id: 'user-123',
				email: 'test@example.com',
				user_metadata: {
					name: 'Test User',
				},
			};

			const mockProfile = {
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				role: 'user',
				onboardingCompleted: true,
			};

			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: { user: mockUser } },
				error: null,
			});

			const { getUserProfile } = await import('@/shared/lib/api');
			(getUserProfile as any).mockResolvedValue(mockProfile);

			const result = await checkSession();

			expect(result.success).toBe(true);
			expect(result.user).toEqual(mockUser);
			expect(result.profile).toEqual(mockProfile);
		});

		it('should return failure for no session', async () => {
			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: null },
				error: null,
			});

			const result = await checkSession();

			expect(result.success).toBe(false);
			expect(result.user).toBeUndefined();
		});

		it('should create profile if missing', async () => {
			const mockUser = {
				id: 'user-999',
				email: 'noProfile@example.com',
				user_metadata: {
					name: 'No Profile User',
				},
			};

			const mockNewProfile = {
				id: 'user-999',
				email: 'noProfile@example.com',
				name: 'No Profile User',
				role: 'user',
				onboardingCompleted: false,
			};

			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: { user: mockUser } },
				error: null,
			});

			const { getUserProfile, createUserProfile } = await import('@/shared/lib/api');
			(getUserProfile as any).mockResolvedValue(null);
			(createUserProfile as any).mockResolvedValue(mockNewProfile);

			const result = await checkSession();

			expect(result.success).toBe(true);
			expect(result.profile).toEqual(mockNewProfile);
			expect(createUserProfile).toHaveBeenCalled();
		});
	});
});
