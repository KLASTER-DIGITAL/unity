/**
 * Segment Builder Component
 *
 * UI for selecting target audience for push campaigns
 * Features:
 * - Predefined segments (all, premium, active, inactive)
 * - Custom segments (to be implemented)
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

interface SegmentBuilderProps {
	targetSegment: 'all' | 'premium' | 'active' | 'inactive' | 'custom';
	customSegmentId?: string;
	onChange: (
		segment: 'all' | 'premium' | 'active' | 'inactive' | 'custom',
		customId?: string
	) => void;
}

export function SegmentBuilder({ targetSegment, onChange }: SegmentBuilderProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Целевая аудитория</CardTitle>
				<CardDescription>Выберите кому отправить уведомление</CardDescription>
			</CardHeader>
			<CardContent>
				<RadioGroup
					value={targetSegment}
					onValueChange={(value) => onChange(value as typeof targetSegment)}
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="all" id="all" />
						<Label htmlFor="all" className="cursor-pointer">
							<div>
								<p className="font-medium">Все пользователи</p>
								<p className="text-sm text-muted-foreground">
									Отправить всем зарегистрированным пользователям
								</p>
							</div>
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value="premium" id="premium" />
						<Label htmlFor="premium" className="cursor-pointer">
							<div>
								<p className="font-medium">Premium пользователи</p>
								<p className="text-sm text-muted-foreground">
									Только пользователи с активной подпиской
								</p>
							</div>
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value="active" id="active" />
						<Label htmlFor="active" className="cursor-pointer">
							<div>
								<p className="font-medium">Активные пользователи</p>
								<p className="text-sm text-muted-foreground">
									Пользователи, активные за последние 7 дней
								</p>
							</div>
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value="inactive" id="inactive" />
						<Label htmlFor="inactive" className="cursor-pointer">
							<div>
								<p className="font-medium">Неактивные пользователи</p>
								<p className="text-sm text-muted-foreground">
									Пользователи, неактивные более 7 дней
								</p>
							</div>
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value="custom" id="custom" disabled />
						<Label htmlFor="custom" className="cursor-pointer opacity-50">
							<div>
								<p className="font-medium">Кастомный сегмент</p>
								<p className="text-sm text-muted-foreground">Создать собственный сегмент (скоро)</p>
							</div>
						</Label>
					</div>
				</RadioGroup>
			</CardContent>
		</Card>
	);
}
