/**
 * Step 4: Layout Selection
 */

import { LAYOUT_OPTIONS } from './constants';
import type { BookConfig, BookLayout } from './types';

type Step4LayoutProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

function getLayoutPreviewClasses(layout: BookLayout, isActive: boolean) {
	const base =
		'mt-3 h-16 w-full rounded-md border text-[10px] sm:text-xs flex items-center gap-2 p-2 transition-colors duration-300';

	if (layout === 'photo_text') {
		return `${base} ${
			isActive
				? 'border-[var(--ios-purple)] bg-[var(--ios-bg-secondary)]'
				: 'border-border bg-muted/60'
		}`;
	}

	if (layout === 'text_only') {
		return `${base} ${
			isActive
				? 'border-[var(--ios-blue)] bg-[var(--ios-bg-secondary)]'
				: 'border-border bg-muted/60'
		}`;
	}

	// minimal
	return `${base} ${
		isActive
			? 'border-[var(--ios-green)] bg-[var(--ios-bg-secondary)]'
			: 'border-border bg-muted/60'
	}`;
}

export function Step4Layout({ config, onConfigChange }: Step4LayoutProps) {
	return (
		<div className="space-y-4">
			<p className="text-foreground text-sm">Выберите макет для вашей книги</p>

			<div className="space-y-3">
				{LAYOUT_OPTIONS.map((option) => {
					const isActive = config.layout === option.value;

					return (
						<button
							className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
								isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'
							}`}
							key={option.value}
							onClick={() => onConfigChange({ layout: option.value })}
							type="button"
						>
							<div className="flex items-start gap-3">
								<span className="text-2xl">{option.emoji}</span>
								<div className="flex-1">
									<h3 className="mb-1 font-semibold text-foreground">{option.label}</h3>
									<p className="text-foreground text-sm">{option.description}</p>

									{/* Мини-превью макета: фото + текст / только текст / минималистичный */}
									<div className={getLayoutPreviewClasses(option.value, isActive)}>
										{option.value === 'photo_text' && (
											<div className="h-12 w-10 rounded-md bg-muted-foreground/30" />
										)}
										<div className="flex-1 space-y-1">
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
				<p className="text-foreground text-sm">
					💡 <strong className="font-semibold text-foreground">Совет:</strong> Макет определяет
					визуальное оформление книги. Выберите тот, который лучше всего подходит для ваших записей.
				</p>
			</div>
		</div>
	);
}
