"use client";

import {
	AnimatePresence,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import type React from "react";
import { useRef, useState } from "react";

export type AnimatedTooltipItem = {
	id: number;
	name: string;
	designation: string;
	image: string;
};

export type AnimatedTooltipProps = {
	items?: AnimatedTooltipItem[];
	content?: string;
	children: React.ReactNode;
};

export const AnimatedTooltip = ({
	items,
	content,
	children,
}: AnimatedTooltipProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const springConfig = { stiffness: 100, damping: 15 };
	const x = useMotionValue(0);
	const animationFrameRef = useRef<number | null>(null);

	const rotate = useSpring(
		useTransform(x, [-100, 100], [-45, 45]),
		springConfig,
	);
	const translateX = useSpring(
		useTransform(x, [-100, 100], [-50, 50]),
		springConfig,
	);

	const handleMouseMove = (event: any) => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		animationFrameRef.current = requestAnimationFrame(() => {
			const halfWidth = event.target.offsetWidth / 2;
			x.set(event.nativeEvent.offsetX - halfWidth);
		});
	};

	// Если есть items - показываем сложный tooltip с аватарами
	if (items && items.length > 0) {
		return (
			<>
				{items.map((item, _idx) => (
					<div
						className="group -mr-4 relative"
						key={item.name}
						onMouseEnter={() => setHoveredIndex(item.id)}
						onMouseLeave={() => setHoveredIndex(null)}
					>
						<AnimatePresence>
							{hoveredIndex === item.id && (
								<motion.div
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
										transition: {
											type: "spring",
											stiffness: 260,
											damping: 10,
										},
									}}
									className="-top-16 -translate-x-1/2 absolute left-1/2 z-50 flex flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
									exit={{ opacity: 0, y: 20, scale: 0.6 }}
									initial={{ opacity: 0, y: 20, scale: 0.6 }}
									style={{
										translateX,
										rotate,
										whiteSpace: "nowrap",
									}}
								>
									<div className="-bottom-px absolute inset-x-10 z-30 h-px w-[20%] bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
									<div className="-bottom-px absolute left-10 z-30 h-px w-[40%] bg-linear-to-r from-transparent via-sky-500 to-transparent" />
									<div className="relative z-30 font-bold text-base text-white">
										{item.name}
									</div>
									<div className="text-white text-xs">{item.designation}</div>
								</motion.div>
							)}
						</AnimatePresence>
						<img
							alt={item.name}
							className="!m-0 !p-0 relative h-14 w-14 rounded-full border-2 border-white object-cover object-top transition duration-500 group-hover:z-30 group-hover:scale-105"
							height={100}
							onMouseMove={handleMouseMove}
							src={item.image}
							width={100}
						/>
					</div>
				))}
			</>
		);
	}

	// Если есть content - показываем простой текстовый tooltip
	if (content) {
		return (
			<div className="group relative">
				{children}
				<AnimatePresence>
					<motion.div
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
							transition: {
								type: "spring",
								stiffness: 260,
								damping: 10,
							},
						}}
						className="-top-12 -translate-x-1/2 absolute left-1/2 z-50 rounded-md bg-black px-3 py-1 text-white text-xs shadow-lg"
						exit={{ opacity: 0, y: 10, scale: 0.8 }}
						initial={{ opacity: 0, y: 10, scale: 0.8 }}
					>
						{content}
						<div className="-bottom-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rotate-45 bg-black" />
					</motion.div>
				</AnimatePresence>
			</div>
		);
	}

	// Если ничего нет - просто возвращаем children
	return <>{children}</>;
};
