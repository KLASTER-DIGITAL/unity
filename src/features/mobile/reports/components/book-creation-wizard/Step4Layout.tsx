/**
 * Step 4: Layout Selection
 * ✅ FIX: Улучшенный дизайн с Card компонентами для лучшей видимости
 */

import { Check } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/components/ui/utils';
import { LAYOUT_OPTIONS } from './constants';
import type { BookConfig } from './types';

type Step4LayoutProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

export function Step4Layout({ config, onConfigChange }: Step4LayoutProps) {
	return (
		<div className="space-y-4">
			<p className="text-base font-medium text-foreground">Выберите макет для вашей книги</p>

			<div className="space-y-3">
				{LAYOUT_OPTIONS.map((option) => {
					const isActive = config.layout === option.value;

					return (
						<Card
							key={option.value}
							className={cn(
								'cursor-pointer transition-all duration-300 hover:shadow-md',
								isActive
									? 'border-primary border-2 bg-primary/5 shadow-sm'
									: 'border-border hover:border-primary/50'
							)}
							onClick={() => onConfigChange({ layout: option.value })}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<span className="text-3xl shrink-0">{option.emoji}</span>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2 mb-1">
											<h3 className="text-base font-semibold text-foreground leading-tight">
												{option.label}
											</h3>
											{isActive && (
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
													<Check className="h-4 w-4" strokeWidth={3} />
												</div>
											)}
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{option.description}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card className="border-border/50 bg-muted/30">
				<CardContent className="p-3">
					<p className="text-sm text-muted-foreground leading-relaxed">
						💡 <strong className="font-semibold text-foreground">Совет:</strong> Макет определяет
						визуальное оформление книги. Выберите тот, который лучше всего подходит для ваших
						записей.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
