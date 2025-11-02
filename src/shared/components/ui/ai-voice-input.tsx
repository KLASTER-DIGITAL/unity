'use client';

import { useEffect, useState } from 'react';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

interface AIVoiceInputProps {
	isOpen: boolean;
	onStart?: () => void;
	onStop?: (duration: number) => void;
	visualizerBars?: number;
}

/**
 * AI Voice Input Modal Component
 * Модальное окно для записи голоса с визуализатором
 * Открывается по центру экрана как SuccessModal
 */
export function AIVoiceInput({
	isOpen,
	onStart,
	onStop,
	visualizerBars = 48,
}: AIVoiceInputProps) {
	const [time, setTime] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Управление таймером и callbacks
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isOpen) {
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
	}, [isOpen, onStart, onStop, time]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-border bg-card p-8 shadow-2xl transition-colors duration-300"
						exit={{ opacity: 0, scale: 0.9 }}
						initial={{ opacity: 0, scale: 0.9 }}
						style={{ width: '320px', minHeight: '280px' }}
					>
						<div className="flex flex-col items-center gap-4">
							{/* Spinning Square */}
							<div className="flex h-16 w-16 items-center justify-center rounded-xl">
								<div
									className="h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
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
							<p className="text-sm font-medium text-black/70 dark:text-white/70">
								Listening...
							</p>

							{/* Hint */}
							<p className="text-center text-xs text-muted-foreground">
								Нажмите на микрофон снова
								<br />
								чтобы остановить запись
							</p>
						</div>
					</motion.div>
				</>
			)}
		</AnimatedPresence>
	);
}
