import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { NotificationOption } from "./NotificationOption";

type NotificationSettingsProps = {
	selectedTime: "none" | "morning" | "evening" | "both";
	morningTime: string;
	eveningTime: string;
	reminderTitle: string;
	morningLabel: string;
	eveningLabel: string;
	bothLabel: string;
	onSelect: (type: "none" | "morning" | "evening" | "both") => void;
	onTimeClick: (type: "morning" | "evening") => void;
};

/**
 * Notification Settings Component
 * Section for configuring notification reminders
 */
export function NotificationSettings({
	selectedTime,
	morningTime,
	eveningTime,
	reminderTitle,
	morningLabel,
	eveningLabel,
	bothLabel,
	onSelect,
	onTimeClick,
}: NotificationSettingsProps) {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="space-y-3 rounded-xl bg-[#756ef3]/10 p-4"
			initial={{ opacity: 0, y: 20 }}
			transition={{ delay: 0.6, duration: 0.5 }}
		>
			<div className="flex items-center space-x-2">
				<Bell className="h-4 w-4 text-[#756ef3]" />
				<h3 className="!text-[#756ef3] font-semibold! text-[14px]!">
					{reminderTitle}
				</h3>
			</div>

			<div className="space-y-2">
				<NotificationOption
					eveningTime={eveningTime}
					isSelected={selectedTime === "morning"}
					label={morningLabel}
					morningTime={morningTime}
					onSelect={() => onSelect("morning")}
					onTimeClick={onTimeClick}
					type="morning"
				/>

				<NotificationOption
					eveningTime={eveningTime}
					isSelected={selectedTime === "evening"}
					label={eveningLabel}
					morningTime={morningTime}
					onSelect={() => onSelect("evening")}
					onTimeClick={onTimeClick}
					type="evening"
				/>

				<NotificationOption
					eveningTime={eveningTime}
					isSelected={selectedTime === "both"}
					label={bothLabel}
					morningTime={morningTime}
					onSelect={() => onSelect("both")}
					type="both"
				/>
			</div>
		</motion.div>
	);
}
