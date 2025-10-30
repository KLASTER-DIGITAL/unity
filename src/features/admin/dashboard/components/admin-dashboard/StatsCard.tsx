import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Stats Card Component
 * Reusable card for displaying statistics
 */

type StatsCardProps = {
	icon: LucideIcon;
	title: string;
	value: number | string;
	subtitle: string;
	className?: string;
};

export function StatsCard({ icon: Icon, title, value, subtitle, className }: StatsCardProps) {
	return (
		<Card className={`border-border ${className || ''}`}>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 font-normal! text-[13px]! text-muted-foreground">
					<Icon className="h-4 w-4" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-[34px]! text-foreground">{value}</div>
				<p className="mt-1 font-normal! text-[13px]! text-muted-foreground">{subtitle}</p>
			</CardContent>
		</Card>
	);
}
