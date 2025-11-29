import { useCallback, useEffect, useState } from 'react';
import { imgMicrophone, imgPaperPlaneRight } from '@/imports/svg-w5pu5';
import { VoicePoweredOrb } from '@/shared/components/ui/voice-powered-orb';
import { AnimatedView } from '@/shared/lib/platform/animation';

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
	const [showVoiceOrb, setShowVoiceOrb] = useState(false);

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

	const handleVoiceClick = () => {
		setShowVoiceOrb(true);
	};

	const handleTranscriptReady = useCallback(
		(text: string) => {
			if (!text?.trim()) return;

			const newValue = value?.trim() ? `${value.trim()} ${text.trim()}` : text.trim();
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
		},
		[value, onChange]
	);

	return (
		<>
			<AnimatedView
				animate={{ opacity: 1, scale: 1 }}
				className="relative w-full rounded-xl border-2 border-border bg-card transition-all duration-300 focus-within:border-[#756ef3] focus-within:shadow-[0_4px_20px_rgba(117,110,243,0.2)]"
				initial={{ opacity: 0, scale: 0.95 }}
				transition={{ type: 'timing', duration: 300 }}
			>
				<div className="flex items-start gap-2 p-3">
					{/* Microphone Button */}
					<button
						type="button"
						className={`mt-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 text-[#756ef3] hover:bg-[#756ef3]/10 ${
							disabled ? 'cursor-not-allowed opacity-50' : ''
						}`}
						disabled={disabled}
						onClick={handleVoiceClick}
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

			{/* Voice Powered Orb */}
			<VoicePoweredOrb
				isOpen={showVoiceOrb}
				onClose={() => setShowVoiceOrb(false)}
				onTranscriptReady={handleTranscriptReady}
			/>
		</>
	);
}
