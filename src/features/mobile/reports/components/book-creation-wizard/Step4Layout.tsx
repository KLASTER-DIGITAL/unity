/**
 * Step 4: Layout Selection
 */

import { LAYOUT_OPTIONS } from './constants';
import type { BookConfig } from './types';

type Step4LayoutProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

export function Step4Layout({ config, onConfigChange }: Step4LayoutProps) {
	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">Выберите макет для вашей книги</p>

			<div className="space-y-3">
				{LAYOUT_OPTIONS.map((option) => (
					<button
						className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
							config.layout === option.value
								? 'border-primary bg-primary/10'
								: 'border-border bg-card hover:bg-accent'
						}`}
						key={option.value}
						onClick={() => onConfigChange({ layout: option.value })}
						type="button"
					>
						<div className="flex items-start gap-3">
							<span className="text-2xl">{option.emoji}</span>
							<div className="flex-1">
								<h3 className="mb-1 font-semibold">{option.label}</h3>
								<p className="text-muted-foreground text-sm">{option.description}</p>
							</div>
							{config.layout === option.value && (
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							)}
						</div>
					</button>
				))}
			</div>

			<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
				<p className="text-muted-foreground text-sm">
					💡 <strong>Совет:</strong> Макет определяет визуальное оформление книги. Выберите тот,
					который лучше всего подходит для ваших записей.
				</p>
			</div>
		</div>
	);
}
