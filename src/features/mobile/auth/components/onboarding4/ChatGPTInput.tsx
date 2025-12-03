import { useEffect, useState } from 'react';
import { imgMicrophone, imgPaperPlaneRight } from '@/imports/svg-w5pu5';
import { AnimatedView } from '@/shared/lib/platform/animation';
import { speech } from '@/shared/lib/platform/speech';

type ChatGPTInputProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder: string;
	disabled?: boolean;
};

/**
 * ChatGPT-style input component with voice recognition
 * Features:
 * - Auto-resizing textarea (2-5 lines)
 * - Voice input with microphone button (opens VoicePoweredOrb)
 * - Send button (enabled when text is present)
 * - Smooth animations
 */
export function ChatGPTInput({
	value,
	onChange,
	onSubmit,
	placeholder,
	disabled = false,
}: ChatGPTInputProps) {
	const [textareaHeight, setTextareaHeight] = useState(52); // Initial height for 2 lines
	const [isListening, setIsListening] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false); // ✅ Защита от повторных вызовов
	const isSupported = speech.isSupported();

	// Initialize field height on mount
	useEffect(() => {
		const lineHeight = 18;
		const padding = 16;
		const initialHeight = lineHeight * 2 + padding;
		setTextareaHeight(initialHeight);
	}, []);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
			e.preventDefault();
			onSubmit();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		onChange(newValue);

		// Auto-resize textarea (2-5 lines)
		const textarea = e.target;
		textarea.style.height = 'auto';
		const lineHeight = 18;
		const padding = 16;
		const minHeight = lineHeight * 2 + padding; // 2 lines
		const maxHeight = lineHeight * 5 + padding; // 5 lines
		const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
		setTextareaHeight(newHeight);
		textarea.style.height = `${newHeight}px`;
	};

	// ✅ FIX: Простой speech to text как в ChatGPT (без VoicePoweredOrb)
	useEffect(() => {
		if (!isSupported) {
			return;
		}

		// Set up callbacks
		speech.onStart(() => {
			console.log('[ChatGPTInput] Speech started');
			setIsListening(true);
			setIsProcessing(false); // ✅ Сбрасываем флаг обработки
			setTranscript('');
		});

		speech.onResult((result) => {
			console.log('[ChatGPTInput] Result received:', result);
			if (result.transcript) {
				setTranscript(result.transcript);
				// ✅ Вставляем текст напрямую в textarea (как в ChatGPT)
				const newValue = value?.trim()
					? `${value.trim()} ${result.transcript.trim()}`
					: result.transcript.trim();
				onChange(newValue);

				// Update height after adding text from dictation
				setTimeout(() => {
					const textareas = document.querySelectorAll('textarea');
					const textarea = Array.from(textareas).find(
						(ta) => ta.value === newValue
					) as HTMLTextAreaElement;
					if (textarea) {
						textarea.style.height = 'auto';
						const lineHeight = 18;
						const padding = 16;
						const minHeight = lineHeight * 2 + padding;
						const maxHeight = lineHeight * 5 + padding;
						const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
						setTextareaHeight(newHeight);
						textarea.style.height = `${newHeight}px`;
					}
				}, 0);
			}
		});

		speech.onEnd(() => {
			console.log('[ChatGPTInput] Speech ended');
			setIsListening(false);
			setIsProcessing(false); // ✅ Сбрасываем флаг обработки
		});

		speech.onError((error) => {
			// ✅ FIX: Игнорируем ошибки "aborted" и "no-speech" - это нормальное поведение
			const errorMessage = error.message.toLowerCase();
			if (errorMessage.includes('aborted') || errorMessage.includes('no speech')) {
				console.log('[ChatGPTInput] Speech recognition aborted/no-speech (normal behavior)');
				setIsListening(false);
				setIsProcessing(false);
				return;
			}

			console.error('[ChatGPTInput] Speech error:', error);
			setIsListening(false);
			setIsProcessing(false);
		});

		return () => {
			// Cleanup
			if (speech.isListening()) {
				speech.abort();
			}
		};
	}, [value, onChange, isSupported]);

	const handleVoiceClick = () => {
		if (!isSupported) {
			console.warn('[ChatGPTInput] Speech recognition not supported');
			return;
		}

		// ✅ FIX: Защита от повторных вызовов
		if (isProcessing) {
			console.log('[ChatGPTInput] Already processing, ignoring click');
			return;
		}

		setIsProcessing(true);

		if (isListening) {
			// Останавливаем запись
			console.log('[ChatGPTInput] Stopping speech recognition');
			speech.stopListening();
			// setIsListening будет установлен в false через onEnd
			setTimeout(() => setIsProcessing(false), 100);
		} else {
			// Начинаем запись (continuous mode для длинной записи)
			console.log('[ChatGPTInput] Starting speech recognition');
			speech.startListening({
				continuous: true,
				interimResults: true,
				language: 'ru-RU',
			});
			// setIsListening будет установлен в true через onStart
			setTimeout(() => setIsProcessing(false), 100);
		}
	};

	return (
		<AnimatedView
			animate={{ opacity: 1, scale: 1 }}
			className="relative w-full rounded-xl border-2 border-border bg-card transition-all duration-300 focus-within:border-[#756ef3] focus-within:shadow-[0_4px_20px_rgba(117,110,243,0.2)]"
			// ✅ FIX: Убрать анимацию появления - чат должен быть сразу виден
			initial={{ opacity: 1, scale: 1 }}
			transition={{ type: 'timing', duration: 0 }}
		>
			<div className="flex items-start gap-2 p-3">
				{/* Microphone Button - ✅ Простой speech to text как в ChatGPT */}
				<button
					type="button"
					className={`mt-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
						isListening
							? 'bg-red-500 text-white animate-pulse'
							: 'text-[#756ef3] hover:bg-[#756ef3]/10'
					} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
					disabled={disabled || !isSupported}
					onClick={handleVoiceClick}
					title={isListening ? 'Остановить запись' : 'Начать запись голоса'}
				>
					<div className="h-4 w-4">
						<img
							alt="Microphone"
							className="h-full w-full"
							src={imgMicrophone}
							style={{
								filter: 'sepia(1) saturate(5) hue-rotate(240deg)',
							}}
						/>
					</div>
				</button>

				{/* Text Input */}
				<textarea
					className="flex-1 resize-none overflow-hidden border-0 bg-transparent text-[#002055] outline-none placeholder:font-normal placeholder:text-[#8d8d8d] placeholder:text-[11px] dark:text-[#1a1a1a]"
					disabled={disabled}
					onChange={handleInputChange}
					onKeyPress={handleKeyPress}
					placeholder={placeholder}
					rows={2}
					style={{
						height: `${textareaHeight}px`,
						fontSize: '13px',
						fontWeight: 400,
						lineHeight: '18px',
						color: '#002055',
						fontFamily: 'var(--font-family-primary)',
						minHeight: '52px', // 2 lines
						maxHeight: '106px', // 5 lines
					}}
					value={value}
				/>

				{/* Send Button */}
				<button
					type="button"
					className={`mt-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
						value.trim() && !disabled
							? 'bg-primary text-white hover:bg-primary/90'
							: 'cursor-not-allowed bg-[#e5e5e5] text-[#8d8d8d]'
					}`}
					disabled={!value.trim() || disabled}
					onClick={onSubmit}
				>
					<div className="h-4 w-4">
						<img
							alt="Send message"
							className="h-full w-full"
							src={imgPaperPlaneRight}
							style={{
								filter: value.trim() && !disabled ? 'brightness(0) invert(1)' : undefined,
							}}
						/>
					</div>
				</button>
			</div>
		</AnimatedView>
	);
}
