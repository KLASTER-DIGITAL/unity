import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { speech } from '../lib/platform/speech';
import { useSpeechRecognition } from './useSpeechRecognition';

// Mock the speech adapter
vi.mock('../lib/platform/speech', () => ({
	speech: {
		isSupported: vi.fn(() => true),
		startListening: vi.fn(),
		stopListening: vi.fn(),
		abort: vi.fn(),
		onStart: vi.fn(),
		onResult: vi.fn(),
		onEnd: vi.fn(),
		onError: vi.fn(),
		isListening: vi.fn(() => false),
	},
}));

describe('useSpeechRecognition', () => {
	let onStartCallback: () => void;
	let onEndCallback: () => void;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let _onResultCallback: (result: any) => void;

	beforeEach(() => {
		vi.clearAllMocks();

		// Capture callbacks
		(speech.onStart as any).mockImplementation((cb: any) => {
			onStartCallback = cb;
		});
		(speech.onEnd as any).mockImplementation((cb: any) => {
			onEndCallback = cb;
		});
		(speech.onResult as any).mockImplementation((cb: any) => {
			_onResultCallback = cb;
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should start listening when startListening is called', () => {
		const { result } = renderHook(() => useSpeechRecognition());

		act(() => {
			result.current.startListening();
		});

		expect(speech.startListening).toHaveBeenCalledWith(
			expect.objectContaining({
				continuous: false,
				interimResults: true,
				language: 'ru-RU',
			})
		);
	});

	it('should NOT auto-restart when onEnd is called (tap-to-record pattern)', async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useSpeechRecognition());

		// 1. Start listening
		act(() => {
			result.current.startListening();
		});

		// Simulate start callback
		act(() => {
			if (onStartCallback) onStartCallback();
		});

		expect(result.current.isListening).toBe(true);

		// 2. Simulate unexpected stop (onEnd called without stopListening)
		act(() => {
			if (onEndCallback) onEndCallback();
		});

		expect(result.current.isListening).toBe(false);

		// 3. Fast-forward time
		await act(async () => {
			vi.advanceTimersByTime(150);
		});

		// 4. Verify startListening was NOT called again
		expect(speech.startListening).toHaveBeenCalledTimes(1);
	});

	it('should NOT auto-restart when manually stopped', async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useSpeechRecognition());

		// 1. Start listening
		act(() => {
			result.current.startListening();
		});

		// 2. Manually stop
		act(() => {
			result.current.stopListening();
		});

		// 3. Simulate onEnd (which happens after stop)
		act(() => {
			if (onEndCallback) onEndCallback();
		});

		// 4. Fast-forward time
		await act(async () => {
			vi.advanceTimersByTime(150);
		});

		// 5. Verify startListening was NOT called again (only once initially)
		expect(speech.startListening).toHaveBeenCalledTimes(1);
	});
});
