import { motion } from "motion/react";

type SliedbarProps = {
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
};

/**
 * Sliedbar Component
 * Progress indicator showing current step in onboarding
 */
export function Sliedbar({
	currentStep,
	totalSteps,
	onStepClick,
}: SliedbarProps) {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="absolute flex items-center gap-[8px]"
			data-name="Sliedbar"
			initial={{ opacity: 0, y: 20 }}
			style={{
				bottom: "min(40px, 8vh)",
				left: "min(25px, 8vw)",
			}}
			transition={{ delay: 0.8, duration: 0.5 }}
		>
			{Array.from({ length: totalSteps }, (_, index) => (
				<motion.button
					animate={{ scaleX: index < currentStep ? 1 : 0.3 }}
					className={`h-[6px] cursor-pointer rounded-[4px] border-0 p-0 transition-all duration-300 hover:scale-110 ${
						index === 0 ? "w-[25px]" : "w-[8px]"
					}`}
					initial={{ scaleX: 0 }}
					key={index}
					onClick={() => onStepClick(index + 1)}
					style={{
						background:
							"linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)",
						opacity: index < currentStep ? 1 : 0.4,
					}}
					transition={{
						delay: 0.8 + index * 0.1,
						duration: 0.8,
						ease: "easeOut",
					}}
					whileHover={{ scale: 1.2 }}
					whileTap={{ scale: 0.9 }}
				/>
			))}
		</motion.div>
	);
}
