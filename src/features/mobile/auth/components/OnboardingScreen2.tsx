import { motion } from 'motion/react';
// Import hero image directly for Vite to process
import heroImageSrc from '@/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp';
import { imgArrowRight, imgCircle, imgRectangle5904 } from '@/imports/svg-6xkhk';
import { PriorityOptimizedImage } from '@/shared/components/OptimizedImage';
import { useTranslation } from '@/shared/lib/i18n';

type OnboardingScreen2Props = {
	selectedLanguage: string;
	onNext: () => void;
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
};

function Circle() {
	return (
		<motion.div
			animate={{
				opacity: 1,
				rotate: 0,
				scale: 1,
				y: [0, -5, 0],
			}}
			className="pointer-events-none relative shrink-0"
			data-name="Circle"
			initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
			style={{
				height: 'clamp(300px, 48vh, 434px)',
				width: 'min(369px, 90vw)',
				marginTop: 'min(10px, 1vh)',
			}}
			transition={{
				delay: 0.2,
				duration: 1,
				y: {
					duration: 3,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
				},
			}}
		>
			<img alt="Background circle" className="block size-full max-w-none" src={imgCircle} />
		</motion.div>
	);
}

function Text({ t }: { t: (key: string, fallback?: string) => string }) {
	const subtitle = t('onboarding2.subtitle', 'Твои маленькие шаги — большие победы');
	const title = t('onboarding2.title', 'Фиксируй достижения и смотри, как растёт твой прогресс');

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="absolute grid translate-x-[-50%] grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] gap-3 px-4 leading-[0]"
			data-name="Text"
			initial={{ opacity: 0, y: 30 }}
			style={{
				left: '50%',
				top: 'clamp(300px, calc(100vh - 270px), 453px)',
				width: 'min(335px, calc(100vw - 32px))',
				height: 'clamp(100px, 13vh, 133px)',
			}}
			transition={{ delay: 0.4, duration: 0.7 }}
		>
			<motion.div
				animate={{ opacity: 1 }}
				className="relative shrink-0 font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] text-[#756ef3] text-[14px] [grid-area:1_/_1]"
				initial={{ opacity: 0 }}
				key={subtitle}
				style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<p className="font-[Days_One] font-bold font-normal text-[12px] leading-[18px]">
					{subtitle}
				</p>
			</motion.div>
			<motion.div
				animate={{ opacity: 1 }}
				className="relative w-full shrink-0 self-start font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] text-[#002055] text-[28px] tracking-[-1px] [grid-area:2_/_1] dark:text-[#1a1a1a]"
				initial={{ opacity: 0 }}
				key={title}
				style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
				transition={{ duration: 0.3 }}
			>
				<p className="!leading-[33px] font-![Days_One] font-semibold! text-[24px]!">{title}</p>
			</motion.div>
		</motion.div>
	);
}

function Sliedbar({
	currentStep,
	totalSteps,
	onStepClick,
}: {
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
}) {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="absolute flex items-center gap-[8px]"
			data-name="Sliedbar"
			initial={{ opacity: 0, y: 20 }}
			style={{
				// ✅ FIX: Выровнять прогресс на уровне со стрелкой (bottom: min(40px, 8vh))
				bottom: 'min(40px, 8vh)',
				left: 'min(25px, 8vw)',
			}}
			transition={{ delay: 0.8, duration: 0.5 }}
		>
			{Array.from({ length: totalSteps }, (_, index) => (
				<motion.button
					animate={{ scaleX: index < currentStep ? 1 : 0.3 }}
					className={`h-[6px] cursor-pointer rounded-[4px] border-0 p-0 transition-all duration-300 hover:scale-110 ${
						index === 0 ? 'w-[25px]' : 'w-[8px]'
					}`}
					initial={{ scaleX: 0 }}
					// biome-ignore lint/suspicious/noArrayIndexKey: static array, index is stable
					key={index}
					onClick={() => onStepClick(index + 1)}
					style={{
						background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
						opacity: index < currentStep ? 1 : 0.4,
					}}
					transition={{
						delay: 0.8 + index * 0.1,
						duration: 0.8,
						ease: 'easeOut',
					}}
					whileHover={{ scale: 1.2 }}
					whileTap={{ scale: 0.9 }}
				/>
			))}
		</motion.div>
	);
}

function ArrowRight() {
	return (
		<div className="relative size-full" data-name="Arrow - Right">
			<div className="absolute inset-[-5%_-6.22%]">
				<img alt="Arrow right" className="block size-full max-w-none" src={imgArrowRight} />
			</div>
		</div>
	);
}

function ArrowRight1({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			className="absolute z-10 size-6 cursor-pointer border-0 bg-transparent"
			data-name="Arrow - Right"
			onClick={onClick}
			style={{
				// ✅ FIX: Выровнять стрелку на уровне с прогрессом (Sliedbar bottom: min(40px, 8vh))
				bottom: 'min(40px, 8vh)',
				right: 'min(46px, 12vw)',
			}}
		>
			<div className="pointer-events-none absolute inset-[23.75%_17.71%_26.04%_19.79%] flex items-center justify-center">
				<div className="h-[15px] w-[12.049px] flex-none rotate-[270deg]">
					<ArrowRight />
				</div>
			</div>
		</button>
	);
}

function NextButton({ onNext }: { onNext: () => void }) {
	return (
		<motion.div
			animate={{ opacity: 1, scale: 1 }}
			className="absolute contents"
			data-name="Next Button"
			initial={{ opacity: 0, scale: 0.8 }}
			style={{
				bottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
				right: 'max(-1px, calc(0px - 1vw))',
			}}
			transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
		>
			<button
				type="button"
				className="absolute cursor-pointer border-0 bg-transparent"
				onClick={onNext}
				style={{
					bottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
					right: 'max(-1px, calc(0px - 1vw))',
					height: 'min(191px, 25vh)',
					width: 'min(129px, 30vw)',
				}}
			>
				<div className="pointer-events-none absolute top-0 right-0 bottom-0 left-[7.57%]">
					<img
						alt="Decorative rectangle"
						className="block size-full max-w-none"
						src={imgRectangle5904}
					/>
				</div>
			</button>
			<ArrowRight1 onClick={onNext} />
		</motion.div>
	);
}

function Frame2087324618({
	selectedLanguage: _selectedLanguage,
	onNext,
	currentStep,
	totalSteps,
	onStepClick,
}: OnboardingScreen2Props) {
	const { t } = useTranslation();

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="scrollbar-hide relative mx-auto flex h-screen w-full max-w-[444px] shrink-0 flex-wrap content-center items-center justify-center gap-0 overflow-hidden"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Circle />
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className="absolute translate-x-[-50%] overflow-hidden rounded-lg"
				data-name="image 1569"
				initial={{ opacity: 0, scale: 0.9 }}
				style={{
					left: '50%',
					top: 'clamp(0px, -5vh, 15px)',
					height: 'min(379px, 50vh)',
					width: 'min(314px, 85vw)',
				}}
				transition={{ delay: 0.3, duration: 0.8 }}
			>
				<PriorityOptimizedImage
					alt="Onboarding illustration"
					className="h-full w-full object-cover"
					priority={true}
					src={heroImageSrc}
				/>
			</motion.div>
			<Text t={t} />
			<Sliedbar currentStep={currentStep} onStepClick={onStepClick} totalSteps={totalSteps} />
			<NextButton onNext={onNext} />
		</motion.div>
	);
}

export function OnboardingScreen2({
	selectedLanguage,
	onNext,
	currentStep,
	totalSteps,
	onStepClick,
}: OnboardingScreen2Props) {
	return (
		<div
			className="scrollbar-hide relative flex size-full h-screen content-stretch items-center justify-center gap-2.5 overflow-hidden bg-card"
			data-name="Onboard 2"
		>
			<Frame2087324618
				currentStep={currentStep}
				onNext={onNext}
				onStepClick={onStepClick}
				selectedLanguage={selectedLanguage}
				totalSteps={totalSteps}
			/>
		</div>
	);
}
export default OnboardingScreen2;
