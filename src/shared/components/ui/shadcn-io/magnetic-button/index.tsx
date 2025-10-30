"use client";

import { Magnet } from "lucide-react";
import { motion, useAnimation } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../utils";

type Particle = {
	id: number;
	x: number;
	y: number;
};

export interface MagneticButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	particleCount?: number;
	attractRadius?: number;
	children?: React.ReactNode;
}

export const MagneticButton = ({
	className,
	particleCount = 12,
	attractRadius = 50,
	children,
	ref,
	...props
}: MagneticButtonProps & {
	ref?: React.RefObject<HTMLButtonElement | null>;
}) => {
	const [isAttracting, setIsAttracting] = useState(false);
	const [particles, setParticles] = useState<Particle[]>([]);
	const particlesControl = useAnimation();

	useEffect(() => {
		const newParticles = Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: Math.random() * 360 - 180,
			y: Math.random() * 360 - 180,
		}));
		setParticles(newParticles);
	}, [particleCount]);

	const handleInteractionStart = useCallback(async () => {
		setIsAttracting(true);
		await particlesControl.start({
			x: 0,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 50,
				damping: 10,
			},
		});
	}, [particlesControl]);

	const handleInteractionEnd = useCallback(async () => {
		setIsAttracting(false);
		await particlesControl.start((i) => ({
			x: particles[i]?.x || 0,
			y: particles[i]?.y || 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15,
			},
		}));
	}, [particlesControl, particles]);

	return (
		<button
			className={cn(
				"relative min-w-40 touch-none",
				"bg-violet-100 dark:bg-violet-900",
				"hover:bg-violet-200 dark:hover:bg-violet-800",
				"text-violet-600 dark:text-violet-300",
				"border border-violet-300 dark:border-violet-700",
				"rounded-md px-4 py-2 transition-all duration-300",
				className,
			)}
			onMouseEnter={handleInteractionStart}
			onMouseLeave={handleInteractionEnd}
			onTouchEnd={handleInteractionEnd}
			onTouchStart={handleInteractionStart}
			ref={ref}
			{...props}
		>
			{particles.map((_, index) => (
				<motion.div
					animate={particlesControl}
					className={cn(
						"pointer-events-none absolute h-1.5 w-1.5 rounded-full",
						"bg-violet-400 dark:bg-violet-300",
						"transition-opacity duration-300",
						isAttracting ? "opacity-100" : "opacity-40",
					)}
					custom={index}
					initial={{ x: particles[index]?.x || 0, y: particles[index]?.y || 0 }}
					key={index}
				/>
			))}
			<span className="relative flex w-full items-center justify-center gap-2">
				{children || (
					<>
						<Magnet
							className={cn(
								"h-4 w-4 transition-transform duration-300",
								isAttracting && "scale-110",
							)}
						/>
						{isAttracting ? "Attracting" : "Hover me"}
					</>
				)}
			</span>
		</button>
	);
};

MagneticButton.displayName = "MagneticButton";
