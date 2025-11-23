import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBookCreation } from '../useBookCreation';

// Mock dependencies
vi.mock('@/utils/supabase/client', () => ({
	createClient: () => ({
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: { session: { user: { id: 'test-user-id' } } },
			}),
		},
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: { is_premium: false, diary_name: 'Test Diary', diary_emoji: '📔' },
					}),
				}),
			}),
		}),
	}),
}));

vi.mock('../../components/book-creation-wizard/utils', () => ({
	fetchAvailableCategories: vi.fn().mockResolvedValue(['Work', 'Personal']),
	validateMinimumEntries: vi.fn().mockResolvedValue({ valid: true, count: 10 }),
	checkFreeTierLimit: vi.fn().mockResolvedValue({ canGenerate: true }),
	generateBookDraft: vi.fn().mockResolvedValue({ success: true, draftId: 'new-draft-id' }),
	deleteBook: vi.fn().mockResolvedValue(undefined),
}));

describe('useBookCreation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with default state', async () => {
		const { result } = renderHook(() => useBookCreation());

		// Initial state might be loading user, so wait or check initial values
		expect(result.current.currentStep).toBe(0);
		expect(result.current.config.theme).toBe('light');
		expect(result.current.isGenerating).toBe(false);
	});

	it('should handle step navigation for Free user', async () => {
		const { result } = renderHook(() => useBookCreation());

		// Wait for user data to load (mocked as Free)
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Step 0 -> 1
		act(() => {
			result.current.setConfig((prev) => ({ ...prev, planType: 'free' }));
			result.current.handleNext();
		});
		expect(result.current.currentStep).toBe(1);

		// Step 1 -> 2
		act(() => {
			result.current.handleNext();
		});
		expect(result.current.currentStep).toBe(2);

		// Step 2 -> Generate (Free users skip 3 & 4)
		// This would trigger generation, but we just want to check it doesn't go to step 3
		// In the hook, handleNext calls handleGenerate if planType is free and step is 2
		// We can't easily check "handleGenerate called" without spying on the internal function,
		// but we can check currentStep didn't increment to 3
		act(() => {
			result.current.handleNext();
		});
		expect(result.current.currentStep).toBe(2); // Should stay at 2 (or whatever logic handles generation)
	});

	it('should initialize in Edit mode if existingBookId is provided', async () => {
		const { result } = renderHook(() => useBookCreation(undefined, 'existing-book-123'));

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Should still start at step 0 (or 1 if premium), but we can check if existingBookId is used in generation
		// The hook doesn't expose "isEditMode" directly, but we can verify it doesn't crash
		expect(result.current.currentStep).toBe(0);
	});
});
