import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { imgArrowRight, imgRectangle5904 } from '@/imports/svg-6xkhk';
import type { ArrowRight1Props, NextButtonProps } from './types';

/**
 * Arrow Right Icon Component
 */
function ArrowRight() {
	return (
		<div className="relative size-full" data-name="Arrow - Right">
			<div className="absolute inset-[-5%_-6.22%]">
				<img alt="Arrow right" className="block size-full max-w-none" src={imgArrowRight} />
			</div>
		</div>
	);
}

/**
 * Arrow Right Button Component
 */
function ArrowRight1({ onClick, disabled }: ArrowRight1Props) {
	return (
		<button
			type="button"
			className={`absolute z-10 size-6 cursor-pointer border-0 bg-transparent ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
			data-name="Arrow - Right"
			disabled={disabled}
			onClick={onClick}
			style={{
				bottom: 'min(69px, 15vh)',
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

/**
 * Next Button Component
 * Shows shake animation and toast when clicked while disabled
 */
export function NextButton({ onNext, disabled, validationMessage }: NextButtonProps) {
	const [shake, setShake] = useState(false);

	const handleClick = () => {
		if (disabled) {
			// ✅ FIX: Встряхивание кнопки + toast-уведомление при попытке нажать на disabled кнопку
			setShake(true);
			setTimeout(() => setShake(false), 500);

			// Показываем toast-уведомление с переводом
			if (validationMessage) {
				toast.error(validationMessage, {
					duration: 3000,
					position: 'top-center',
				});
			}
			return;
		}
		onNext();
	};

	return (
		<motion.div
			animate={{
				opacity: disabled ? 0.5 : 1,
				scale: 1,
				x: shake ? [0, -10, 10, -10, 10, 0] : 0,
			}}
			className="absolute contents"
			data-name="Next Button"
			initial={{ opacity: 0, scale: 0.8, x: 50 }}
			style={{
				bottom: 'max(-2px, calc(0px - 2vh))',
				right: 'max(-1px, calc(0px - 1vw))',
			}}
			transition={{
				delay: shake ? 0 : 0.6,
				duration: shake ? 0.5 : 0.6,
				type: shake ? 'tween' : 'spring',
			}}
			whileHover={{
				scale: disabled ? 1 : 1.05,
				rotate: disabled ? 0 : 0,
			}}
			whileTap={{ scale: disabled ? 1 : 0.95 }}
		>
			<button
				type="button"
				className={`absolute h-[191px] w-[129px] max-w-[30vw] border-0 bg-transparent ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
				onClick={handleClick}
				style={{
					bottom: 'max(-2px, calc(0px - 2vh))',
					right: 'max(-1px, calc(0px - 1vw))',
				}}
			>
				<div className="pointer-events-none absolute top-0 right-0 bottom-0 left-[7.57%]">
					<img alt="Decorative rectangle" className="block size-full max-w-none" src={imgRectangle5904} />
				</div>
			</button>
			<ArrowRight1 disabled={disabled} onClick={handleClick} />
		</motion.div>
	);
}
