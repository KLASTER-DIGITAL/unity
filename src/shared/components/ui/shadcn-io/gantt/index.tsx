import type React from "react";
import { cn } from "../../utils";

type GanttProps = {
	className?: string;
};

export const Gantt: React.FC<GanttProps> = ({ className }) => (
	<div className={cn("rounded-lg bg-muted p-4", className)}>
		<div className="mb-2 text-muted-foreground text-sm">Расписание задач</div>
		<div className="space-y-2">
			{Array.from({ length: 5 }, (_, i) => (
				<div className="flex items-center gap-4" key={i}>
					<div className="w-20 text-muted-foreground text-xs">
						Задача {i + 1}
					</div>
					<div className="h-2 flex-1 rounded-full bg-muted">
						<div
							className="h-2 rounded-full bg-blue-500"
							style={{ width: `${20 + i * 15}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	</div>
);
