/**
 * Step 3: Style Selection
 */

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
			isActive
				? 'border-[var(--ios-purple)] bg-[var(--ios-bg-secondary)]'
				: 'border-border bg-muted/60'
		}`;
	}

	if (style === 'biographical') {
		return `${base} ${
			isActive
				? 'border-[var(--ios-blue)] bg-[var(--ios-bg-secondary)]'
				: 'border-border bg-muted/60'
		}`;
	}

	// motivational
	return `${base} ${
		isActive
			? 'border-[var(--ios-green)] bg-[var(--ios-bg-secondary)]'
			: 'border-border bg-muted/60'
	}`;
}

export function Step3Style({ config, onConfigChange }: Step3StyleProps) {
	return (
		<div className="space-y-4">
			<p className="text-base text-foreground">Выберите стиль повествования для вашей книги</p>

			<div className="space-y-3">
				{STYLE_OPTIONS.map((option) => {
					const isActive = config.style === option.value;

					return (
						<button
							className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
								isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'
							}`}
							key={option.value}
							onClick={() => onConfigChange({ style: option.value })}
							type="button"
						>
							<div className="flex items-start gap-3">
								<span className="text-2xl">{option.emoji}</span>
								<div className="flex-1">
									<h3 className="mb-1 text-base font-semibold text-foreground">{option.label}</h3>
									<p className="mb-3 text-sm text-foreground">{option.description}</p>

									{/* Мини-превью страницы книги для выбранного стиля */}
									<div className={getPreviewClasses(option.value, isActive)}>
										<div className="h-2 w-10 rounded-full bg-muted-foreground/60" />
										<div className="space-y-1">
											<div className="h-1.5 w-full rounded-full bg-muted-foreground/40" />
											<div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/30" />
											<div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/20" />
										</div>
									</div>
								</div>
								{isActive && (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											viewBox="0 0 24 24"
											aria-label="Selected"
											role="img"
										>
											<title>Selected</title>
											<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
								)}
							</div>
						</button>
					);
				})}
			</div>

			<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
				<p className="text-sm text-foreground">
					💡 <strong className="font-semibold text-foreground">Совет:</strong> Стиль влияет на тон
					повествования и структуру книги. Выберите тот, который лучше всего отражает ваши
					воспоминания.
				</p>
			</div>
		</div>
	);
}
