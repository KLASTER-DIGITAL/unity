"use client";

import { type HTMLMotionProps, motion, type Transition } from "motion/react";

import { cn } from "../../utils";

type CounterProps = HTMLMotionProps<"div"> & {
	number: number;
	setNumber: (number: number) => void;
	className?: string;
	transition?: Transition;
};

function Counter({
	number,
	setNumber,
	className,
	transition = { type: "spring", bounce: 0, stiffness: 300, damping: 30 },
	...props
}: CounterProps) {
	return (
		<motion.div
			className={cn(
				"flex items-center gap-x-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800",
				className,
			)}
			data-slot="counter"
			layout
			transition={transition}
			{...props}
		>
			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<button
					className="flex h-8 w-8 items-center justify-center rounded-md bg-card pb-[3px] font-light text-2xl text-neutral-950 hover:bg-white/70 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-950/70"
					onClick={() => setNumber(number - 1)}
				>
					-
				</button>
			</motion.div>

			<div className="min-w-[2rem] text-center font-semibold text-lg">
				{number.toLocaleString()}
			</div>

			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<button
					className="flex h-8 w-8 items-center justify-center rounded-md bg-card pb-[3px] font-light text-2xl text-neutral-950 hover:bg-white/70 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-950/70"
					onClick={() => setNumber(number + 1)}
				>
					+
				</button>
			</motion.div>
		</motion.div>
	);
}

export { Counter, type CounterProps };
