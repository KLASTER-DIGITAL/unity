'use client';

import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';
import { cn } from './utils';

interface AIVoiceInputProps {
	isOpen: boolean;
	onClose: () => void;
	onStartRecording: () => void;
	onStopRecording: () => void;
	visualizerBars?: number;
}

/**
 * AI Voice Input Modal Component
 * Модальное окно для записи голоса с визуализатором
 *
 * ЛОГИКА:
 * 1. Клик на микрофон в InputArea → открывается модальное окно (isOpen=true)
 * 2. В модальном окне кнопка с микрофоном
 * 3. Клик на кнопку → начинается запись (submitted=true)
 * 4. Клик снова → останавливается запись (submitted=false) → onStopRecording → текст в чат
 */
export function AIVoiceInput({
	isOpen,
	onClose,
	onStartRecording,
	onStopRecording,
	visualizerBars = 48,
}: AIVoiceInputProps) {
	const [submitted, setSubmitted] = useState(false);
	const [time, setTime] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Управление таймером
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (submitted) {
			intervalId = setInterval(() => {
				setTime((t) => t + 1);
			}, 1000);
		} else {
			setTime(0);
		}

		return () => clearInterval(intervalId);
	}, [submitted]);

	// Сброс состояния при закрытии модального окна
	useEffect(() => {
		if (!isOpen) {
			setSubmitted(false);
			setTime(0);
		}
	}, [isOpen]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleClick = () => {
		if (submitted) {
			// Останавливаем запись
			setSubmitted(false);
			onStopRecording();
			// Модальное окно закроется автоматически после транскрибации
		} else {
			// Начинаем запись
			setSubmitted(true);
			onStartRecording();
		}
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
						onClick={() => {
							if (!submitted) {
								onClose();
							}
						}}
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
							{/* Microphone Button */}
							<button
								className={cn(
									'group flex h-16 w-16 items-center justify-center rounded-xl transition-colors',
									submitted ? 'bg-none' : 'bg-none hover:bg-black/10 dark:hover:bg-white/10'
								)}
								onClick={handleClick}
								type="button"
							>
								{submitted ? (
									<div
										className="h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
										style={{ animationDuration: '3s' }}
									/>
								) : (
									<Mic className="h-6 w-6 text-black/70 dark:text-white/70" />
								)}
							</button>

							{/* Timer */}
							<span
								className={cn(
									'font-mono text-sm transition-opacity duration-300',
									submitted ? 'text-black/70 dark:text-white/70' : 'text-black/30 dark:text-white/30'
								)}
							>
								{formatTime(time)}
							</span>

							{/* Visualizer Bars */}
							<div className="flex h-4 w-64 items-center justify-center gap-0.5">
								{[...Array(visualizerBars)].map((_, i) => (
									<div
										className={cn(
											'w-0.5 rounded-full transition-all duration-300',
											submitted
												? 'animate-pulse bg-black/50 dark:bg-white/50'
												: 'h-1 bg-black/10 dark:bg-white/10'
										)}
										key={i}
										style={
											submitted && isClient
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
							<p className="h-4 text-xs text-black/70 dark:text-white/70">
								{submitted ? 'Listening...' : 'Click to speak'}
							</p>

							{/* Hint */}
							{!submitted && (
								<p className="text-center text-xs text-muted-foreground">
									Нажмите на микрофон
									<br />
									чтобы начать запись
								</p>
							)}
							{submitted && (
								<p className="text-center text-xs text-muted-foreground">
									Нажмите снова
									<br />
									чтобы остановить
								</p>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatedPresence>
	);
}
