import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n';
import { emojiOptions } from './constants';
import type { PersonalizationFormProps } from './types';

/**
 * Personalization Form Component
 * Allows user to name their diary and select an emoji
 */
export function PersonalizationForm({ onNext: _onNext, onUpdate }: PersonalizationFormProps) {
	const { t } = useTranslation();
	const [diaryName, setDiaryName] = useState('');
	const [selectedEmoji, setSelectedEmoji] = useState('🏆');
	const [isInputFocused, setIsInputFocused] = useState(false);

	const handlePresetClick = (preset: string) => {
		setDiaryName(preset);
		onUpdate?.(preset, selectedEmoji);
	};

	const handleNameChange = (value: string) => {
		setDiaryName(value);
		onUpdate?.(value, selectedEmoji);
	};

	const handleEmojiChange = (emoji: string) => {
		setSelectedEmoji(emoji);
		onUpdate?.(diaryName, emoji);
	};

	// Next handler (currently unused but kept for future use)
	// const handleNext = () => {
	//   if (diaryName.trim()) {
	//     onNext(diaryName.trim(), selectedEmoji);
	//   }
	// };

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="absolute grid h-auto w-[335px] max-w-[calc(100%-32px)] translate-x-[-50%] grid-cols-[repeat(1,_minmax(0px,_1fr))] gap-6 px-4 leading-[0]"
			data-name="PersonalizationForm"
			initial={{ opacity: 0, y: 30 }}
			style={{
				left: '50%',
				top: 'min(180px, calc(50vh - 150px))',
			}}
			transition={{ delay: 0.4, duration: 0.7 }}
		>
			{/* Title */}
			<motion.div
				animate={{ opacity: 1 }}
				className="relative shrink-0 font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] text-[#756ef3] text-[14px]"
				initial={{ opacity: 0 }}
				key={t('onboarding3.subtitle')}
				style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<p className="!leading-[18px] font-![Days_One] font-bold! text-[12px]!">
					{t('onboarding3.subtitle')}
				</p>
			</motion.div>

			{/* Main Title */}
			<motion.div
				animate={{ opacity: 1 }}
				className="relative w-full shrink-0 self-start font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] text-[#002055] text-[28px] tracking-[-1px] dark:text-[#1a1a1a]"
				initial={{ opacity: 0 }}
				key={t('onboarding3.title')}
				style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
				transition={{ duration: 0.3 }}
			>
				<p className="!leading-[33px] font-![Days_One] font-semibold! text-[24px]!">
					{t('onboarding3.title')}
				</p>
			</motion.div>

			{/* Emoji Selection */}
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className="flex justify-center gap-3"
				initial={{ opacity: 0, scale: 0.9 }}
				transition={{ delay: 0.6, duration: 0.5 }}
			>
				{emojiOptions.map((emoji, index) => (
					<motion.button
						animate={{ opacity: 1, y: 0 }}
						className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl transition-all duration-300 ${
							selectedEmoji === emoji
								? 'scale-110 border-[#756ef3] bg-[#756ef3]/10'
								: 'border-border hover:border-[#756ef3]/50'
						}`}
						initial={{ opacity: 0, y: 20 }}
						key={emoji}
						onClick={() => handleEmojiChange(emoji)}
						transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
						whileHover={{ scale: selectedEmoji === emoji ? 1.1 : 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{emoji}
					</motion.button>
				))}
			</motion.div>

			{/* Input Field */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="relative"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.8, duration: 0.5 }}
			>
				<motion.input
					animate={{
						scale: isInputFocused ? 1.02 : 1,
						boxShadow: isInputFocused
							? '0 4px 20px rgba(117, 110, 243, 0.2)'
							: '0 2px 8px rgba(0, 0, 0, 0.1)',
					}}
					className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-center font-semibold! text-[16px]! text-foreground transition-all duration-300 focus:border-[#756ef3] focus:outline-none"
					maxLength={30}
					onBlur={() => setIsInputFocused(false)}
					onChange={(e) => handleNameChange(e.target.value)}
					onFocus={() => setIsInputFocused(true)}
					placeholder={t('onboarding3.placeholder')}
					transition={{ duration: 0.2 }}
					type="text"
					value={diaryName}
				/>

				{/* Character count indicator */}
				<motion.div
					animate={{ opacity: diaryName.length > 20 ? 1 : 0 }}
					className="-bottom-6 absolute right-2 text-[#8d8d8d] text-xs"
					initial={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{diaryName.length}/30
				</motion.div>
			</motion.div>

			{/* Presets */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-2"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.9, duration: 0.5 }}
			>
				<motion.p
					animate={{ opacity: 1 }}
					className="mb-1 text-center text-[#8d8d8d] text-[12px]!"
					initial={{ opacity: 0 }}
					transition={{ delay: 1, duration: 0.3 }}
				>
					{t('onboarding3.presetsLabel', 'Или выберите готовый вариант:')}
				</motion.p>

				{[t('onboarding3.presets.0'), t('onboarding3.presets.1'), t('onboarding3.presets.2')].map(
					(preset: string, index: number) => (
						<motion.button
							animate={{ opacity: 1, x: 0 }}
							className={`rounded-lg border-2 px-4 py-3 text-center font-semibold! text-[14px]! transition-all duration-300 ${
								diaryName === preset
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border hover:border-primary hover:bg-primary/5'
							}`}
							initial={{ opacity: 0, x: -20 }}
							key={preset}
							onClick={() => handlePresetClick(preset)}
							transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
							whileHover={{
								scale: 1.02,
								boxShadow: '0 4px 12px rgba(117, 110, 243, 0.15)',
							}}
							whileTap={{ scale: 0.98 }}
						>
							<motion.span
								animate={{ opacity: 1 }}
								initial={{ opacity: 0 }}
								transition={{ delay: 1.1 + index * 0.1, duration: 0.2 }}
							>
								{preset}
							</motion.span>
						</motion.button>
					)
				)}
			</motion.div>

			{/* Form validation indicator */}
			<motion.div
				animate={{
					opacity: diaryName.trim() ? 1 : 0,
					scale: diaryName.trim() ? 1 : 0.8,
				}}
				className="flex items-center justify-center gap-2"
				initial={{ opacity: 0, scale: 0.8 }}
				transition={{ duration: 0.3, type: 'spring' }}
			>
				<motion.div
					animate={{
						scale: diaryName.trim() ? [1, 1.2, 1] : 0,
						opacity: diaryName.trim() ? 1 : 0,
					}}
					className="h-3 w-3 rounded-full bg-green-500"
					transition={{ duration: 0.4, ease: 'easeOut' }}
				/>
				<motion.span
					animate={{
						opacity: diaryName.trim() ? 1 : 0,
						x: diaryName.trim() ? 0 : -10,
					}}
					className="font-semibold! text-[12px]! text-green-600"
					initial={{ opacity: 0, x: -10 }}
					transition={{ duration: 0.3 }}
				>
					{t('onboarding3.readyMessage')}
				</motion.span>
			</motion.div>
		</motion.div>
	);
}
