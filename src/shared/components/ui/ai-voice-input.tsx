'use client';

import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './utils';

interface AIVoiceInputProps {
	onStart?: () => void;
	onStop?: (duration: number) => void;
	visualizerBars?: number;
	className?: string;
	isRecording: boolean;
}

/**
 * AI Voice Input Component
 * Красивый компонент для записи голоса с визуализатором
 * Управляется ИЗВНЕ через isRecording prop
 */
export function AIVoiceInput({
	onStart,
	onStop,
	visualizerBars = 48,
	className,
	isRecording,
}: AIVoiceInputProps) {
	const [time, setTime] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Управление таймером и callbacks
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isRecording) {
			onStart?.();
			intervalId = setInterval(() => {
				setTime((t) => t + 1);
			}, 1000);
		} else {
			if (time > 0) {
				onStop?.(time);
			}
			setTime(0);
		}

		return () => clearInterval(intervalId);
	}, [isRecording, onStart, onStop, time]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className={cn('w-full py-4', className)}>
			<div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
				{/* Spinning Square (когда идет запись) */}
				<div className="flex h-16 w-16 items-center justify-center rounded-xl">
					<div
						className="pointer-events-auto h-6 w-6 cursor-pointer animate-spin rounded-sm bg-black dark:bg-white"
						style={{ animationDuration: '3s' }}
					/>
				</div>

				{/* Timer */}
				<span className="font-mono text-sm text-black/70 transition-opacity duration-300 dark:text-white/70">
					{formatTime(time)}
				</span>

				{/* Visualizer Bars */}
				<div className="flex h-4 w-64 items-center justify-center gap-0.5">
					{[...Array(visualizerBars)].map((_, i) => (
						<div
							className="w-0.5 animate-pulse rounded-full bg-black/50 transition-all duration-300 dark:bg-white/50"
							key={i}
							style={
								isClient
									? {
											height: `${20 + Math.random() * 80}%`,
											animationDelay: `${i * 0.05}s`,
										}
									: undefined
							}
						/>
					))}
				</div>

				{/* Status Text */}
				<p className="h-4 text-xs text-black/70 dark:text-white/70">Listening...</p>
			</div>
		</div>
	);
}
