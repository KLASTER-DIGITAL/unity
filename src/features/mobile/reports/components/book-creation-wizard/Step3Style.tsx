/**
 * Step 3: Style Selection
 * ✅ FIX: Улучшенный дизайн с Card компонентами для лучшей видимости
 */

import { Check } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/components/ui/utils';
import { STYLE_OPTIONS } from './constants';
import type { BookConfig, BookStyle } from './types';

type Step3StyleProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

function getPreviewClasses(style: BookStyle, isActive: boolean) {
	const base =
		'mt-3 h-16 w-full rounded-md border text-[10px] sm:text-xs flex flex-col justify-between p-2 transition-colors duration-300';

	if (style === 'warm_family') {
		return `${base} ${
			isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/30'
		}`;
	}

	if (style === 'biographical') {
		return `${base} ${
			isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/30'
		}`;
	}

	// motivational
	return `${base} ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/30'}`;
}

export function Step3Style({ config, onConfigChange }: Step3StyleProps) {
	return (
		<div className="space-y-4">
			<p className="text-base font-medium text-foreground">
				Выберите стиль повествования для вашей книги
			</p>

			<div className="space-y-3">
				{STYLE_OPTIONS.map((option) => {
					const isActive = config.style === option.value;

					return (
						<Card
							key={option.value}
							className={cn(
								'cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden',
								isActive
									? 'border-primary border-2 bg-primary/5 shadow-sm ring-2 ring-primary/20'
									: 'border-border hover:border-primary/50 hover:bg-accent/50'
							)}
							onClick={() => onConfigChange({ style: option.value })}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-4">
									{/* Emoji Icon */}
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
										{option.emoji}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0 space-y-2">
										{/* Header with title and checkmark */}
										<div className="flex items-start justify-between gap-2">
											<h3 className="text-base font-semibold text-foreground leading-tight">
												{option.label}
											</h3>
											{isActive && (
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
													<Check className="h-4 w-4" strokeWidth={3} />
												</div>
											)}
										</div>

										{/* Description */}
										<p className="text-sm text-muted-foreground leading-relaxed">
											{option.description}
										</p>

										{/* Мини-превью страницы книги для выбранного стиля */}
										<div className={getPreviewClasses(option.value, isActive)}>
											<div className="h-2 w-10 rounded-full bg-foreground/70" />
											<div className="space-y-1">
												<div className="h-1.5 w-full rounded-full bg-foreground/30" />
												<div className="h-1.5 w-4/5 rounded-full bg-foreground/20" />
												<div className="h-1.5 w-3/5 rounded-full bg-foreground/10" />
											</div>
										</div>
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
						💡 <strong className="font-semibold text-foreground">Совет:</strong> Стиль влияет на тон
						повествования и структуру книги. Выберите тот, который лучше всего отражает ваши
						воспоминания.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
