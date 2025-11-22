import { Clock } from 'lucide-react';
import { motion } from 'motion/react';

type NotificationOptionProps = {
	type: 'morning' | 'evening' | 'both';
	label: string;
	isSelected: boolean;
	morningTime: string;
	eveningTime: string;
	onSelect: () => void;
	onTimeClick?: (type: 'morning' | 'evening') => void;
};

/**
 * Notification Option Component
 * Single notification time option (morning, evening, or both)
 */
export function NotificationOption({
	type,
	label,
	isSelected,
	morningTime,
	eveningTime,
	onSelect,
	onTimeClick,
}: NotificationOptionProps) {
	const renderTimeDisplay = () => {
		if (type === 'both') {
			return (
				<div className="flex items-center space-x-1">
					<Clock className="h-3 w-3 text-[#756ef3]" />
					<span className="!text-[#756ef3] font-medium! text-[13px]!">
						({morningTime} & {eveningTime})
					</span>
				</div>
			);
		}

		const time = type === 'morning' ? morningTime : eveningTime;
		return (
			<div
				className="flex cursor-pointer items-center space-x-1 rounded-md px-2 py-1 transition-colors hover:bg-muted"
				onClick={(e) => {
					e.stopPropagation();
					onTimeClick?.(type);
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						onTimeClick?.(type);
					}
				}}
				role="button"
				tabIndex={0}
			>
				<Clock className="h-3 w-3 text-[#756ef3]" />
				<span className="!text-[#756ef3] font-medium! text-[13px]!">({time})</span>
			</div>
		);
	};

	return (
		<motion.button
			className={`flex w-full items-center justify-between rounded-lg bg-card p-3 transition-all duration-200 ${
				isSelected ? 'bg-[#756ef3]/5 ring-2 ring-[#756ef3]' : 'hover:bg-muted'
			}`}
			onClick={onSelect}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-center space-x-3">
				<div
					className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
						isSelected ? 'border-[#756ef3] bg-[#756ef3]' : 'border-border'
					}`}
				>
					{isSelected && <div className="h-2 w-2 rounded-full bg-card" />}
				</div>
				<span className="!text-[#002055] dark:!text-[#1a1a1a] font-medium! text-[13px]!">
					{label}
				</span>
			</div>
			{renderTimeDisplay()}
		</motion.button>
	);
}
