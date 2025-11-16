import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AchievementCategoryProps {
	title: string;
	icon: string;
	children: ReactNode;
	delay?: number;
}

export function AchievementCategory({
	title,
	icon,
	children,
	delay = 0,
}: AchievementCategoryProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className="mb-6"
		>
			<div className="mb-3 flex items-center gap-2 px-4">
				<span className="text-2xl">{icon}</span>
				<h3 className="font-semibold text-foreground text-lg transition-colors duration-300">
					{title}
				</h3>
			</div>
			<div className="grid grid-cols-2 gap-3 px-4">{children}</div>
		</motion.div>
	);
}
