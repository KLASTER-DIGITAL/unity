'use client';

import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';
import { useSpeechRecognition } from '@/shared/hooks/useSpeechRecognition';

interface VoicePoweredOrbProps {
	isOpen: boolean;
	onClose: () => void;
	onTranscriptReady: (text: string) => void;
}

/**
 * Voice Powered Orb Component
 * Полноэкранный компонент с анимированным орбом для голосового ввода
 *
 * ЛОГИКА:
 * 1. Клик на микрофон в InputArea → открывается полноэкранный компонент
 * 2. Клик на орб → начинается запись (Web Speech API)
 * 3. Автоматическая остановка когда пользователь перестает говорить
 * 4. Текст вставляется в input через onTranscriptReady
 * 5. Модальное окно закрывается автоматически
 */
export function VoicePoweredOrb({ isOpen, onClose, onTranscriptReady }: VoicePoweredOrbProps) {
	const { isListening, transcript, startListening, stopListening, isSupported } =
		useSpeechRecognition();
	const [lastTranscript, setLastTranscript] = useState('');

	// Обработка нового транскрипта
	useEffect(() => {
		if (transcript?.trim() && transcript !== lastTranscript) {
			console.log('[VoicePoweredOrb] New transcript:', transcript);
			setLastTranscript(transcript);
			onTranscriptReady(transcript);
			toast.success('Готово! ✨');
			// Закрываем модальное окно после получения текста
			setTimeout(() => {
				onClose();
			}, 500);
		}
	}, [transcript, lastTranscript, onTranscriptReady, onClose]);

	// Сброс состояния при закрытии
	useEffect(() => {
		if (!isOpen) {
			setLastTranscript('');
			if (isListening) {
				stopListening();
			}
		}
	}, [isOpen, isListening, stopListening]);

	const handleOrbClick = () => {
		if (!isSupported) {
			toast.error('Голосовой ввод недоступен', {
				description: 'Ваш браузер не поддерживает распознавание речи',
			});
			return;
		}

		if (isListening) {
			stopListening();
		} else {
			startListening();
			toast.success('Говорите...', { duration: 1000 });
		}
	};

	const handleBackdropClick = () => {
		if (!isListening) {
			onClose();
		}
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop с blur */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={handleBackdropClick}
					/>

					{/* Центральный контейнер */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed left-1/2 top-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2"
						exit={{ opacity: 0, scale: 0.8 }}
						initial={{ opacity: 0, scale: 0.8 }}
					>
						{/* Орб контейнер */}
						<div className="relative flex h-64 w-64 items-center justify-center">
							{/* Внешнее свечение (пульсация) */}
							<div
								className={`absolute inset-0 rounded-full bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent ${
									isListening ? 'animate-pulse' : ''
								}`}
								style={{
									filter: 'blur(40px)',
									transform: 'scale(1.5)',
								}}
							/>

							{/* Средний слой (вращение) */}
							<div
								className="absolute inset-0 rounded-full opacity-50"
								style={{
									background:
										'conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7, #ec4899, #a855f7)',
									animation: isListening ? 'spin 3s linear infinite' : 'none',
									filter: 'blur(20px)',
								}}
							/>

							{/* Внутренний орб (кликабельный) */}
							<button
								className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
								onClick={handleOrbClick}
								style={{
									boxShadow: isListening
										? '0 0 60px rgba(168, 85, 247, 0.6), 0 0 120px rgba(236, 72, 153, 0.4)'
										: '0 0 40px rgba(168, 85, 247, 0.4)',
								}}
								type="button"
							>
								{isListening ? (
									<div className="flex flex-col items-center gap-2">
										<div className="h-12 w-12 animate-pulse rounded-full bg-white/30" />
										<span className="text-sm font-medium text-white">Listening...</span>
									</div>
								) : (
									<Mic className="h-16 w-16 text-white" />
								)}
							</button>

							{/* Визуализатор звука (опционально) */}
							{isListening && (
								<div className="absolute bottom-0 flex h-8 w-full items-center justify-center gap-1">
									{[...Array(12)].map((_, i) => (
										<div
											className="w-1 rounded-full bg-white/50"
											key={`visualizer-${i}`}
											style={{
												height: `${20 + Math.random() * 80}%`,
												animation: `pulse 0.5s ease-in-out infinite`,
												animationDelay: `${i * 0.05}s`,
											}}
										/>
									))}
								</div>
							)}
						</div>

						{/* Hint текст */}
						<div className="absolute -bottom-20 left-1/2 w-full -translate-x-1/2 text-center">
							<p className="text-sm font-medium text-white">
								{isListening ? 'Говорите...' : 'Нажмите на орб чтобы начать'}
							</p>
							{!isListening && (
								<p className="mt-1 text-xs text-white/70">Или нажмите на фон чтобы закрыть</p>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatedPresence>
	);
}
