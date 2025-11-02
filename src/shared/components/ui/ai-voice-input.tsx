'use client';

import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './utils';

interface AIVoiceInputProps {
	onStart?: () => void;
	onStop?: (duration: number) => void;
	visualizerBars?: number;
	className?: string;
	isRecording?: boolean;
}

export function AIVoiceInput({
	onStart,
	onStop,
	visualizerBars = 48,
	className,
	isRecording = false,
}: AIVoiceInputProps) {
	const [time, setTime] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

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
	}, [isRecording]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div className={cn('w-full py-4', className)}>
			<div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
				<div
					className={cn(
						'group flex h-16 w-16 items-center justify-center rounded-xl transition-colors',
						isRecording ? 'bg-none' : 'bg-none hover:bg-black/10 dark:hover:bg-white/10'
					)}
				>
					{isRecording ? (
						<div
							className="h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
							style={{ animationDuration: '3s' }}
						/>
					) : (
						<Mic className="h-6 w-6 text-black/70 dark:text-white/70" />
					)}
				</div>

				<span
					className={cn(
						'font-mono text-sm transition-opacity duration-300',
						isRecording ? 'text-black/70 dark:text-white/70' : 'text-black/30 dark:text-white/30'
					)}
				>
					{formatTime(time)}
				</span>

				<div className="flex h-4 w-64 items-center justify-center gap-0.5">
					{[...Array(visualizerBars)].map((_, i) => (
						<div
							className={cn(
								'w-0.5 rounded-full transition-all duration-300',
								isRecording
									? 'animate-pulse bg-black/50 dark:bg-white/50'
									: 'h-1 bg-black/10 dark:bg-white/10'
							)}
							key={i}
							style={
								isRecording && isClient
									? {
											height: `${20 + Math.random() * 80}%`,
											animationDelay: `${i * 0.05}s`,
										}
									: undefined
							}
						/>
					))}
				</div>

				<p className="h-4 text-xs text-black/70 dark:text-white/70">
					{isRecording ? 'Listening...' : 'Click to speak'}
				</p>
			</div>
		</div>
	);
}
