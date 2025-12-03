/**
 * Step 3: Style Selection
 */

import { Lock } from 'lucide-react';
import { STYLE_OPTIONS } from './constants';
import type { BookConfig } from './types';

type Step3StyleProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium: boolean;
	onUpgrade: () => void;
};

export function Step3Style({ config, onConfigChange, isPremium, onUpgrade }: Step3StyleProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					Выберите стиль повествования для вашей книги
				</p>
				{!isPremium && (
					<p className="text-xs text-amber-500 mt-2 font-medium">✨ Доступно только в Premium</p>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4">
				{STYLE_OPTIONS.map((option) => {
					const isActive = config.style === option.value;
					const isLocked = !isPremium;

					return (
						<button
							className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
								isActive
									? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5'
									: 'border-border bg-card/50 hover:bg-accent/50 hover:border-accent'
							} ${isLocked ? 'opacity-75' : ''}`}
							key={option.value}
							onClick={() => {
								if (isLocked) {
									onUpgrade();
								} else {
									onConfigChange({ style: option.value });
								}
							}}
							type="button"
						>
							<div className="flex items-start gap-4 mb-4">
								<span className="text-3xl">{option.emoji}</span>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="text-lg font-bold text-foreground">{option.label}</h3>
										{isLocked && <Lock className="w-4 h-4 text-amber-500" />}
									</div>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{option.description}
									</p>
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

							{/* Preview */}
							<div
								className={`rounded-xl border p-4 transition-all duration-300 ${
									isActive ? 'border-primary/20 bg-primary/5' : 'border-border/50 bg-muted/20'
								} `}
							>
								<div className="h-2 w-16 rounded-full bg-muted-foreground/20 mb-3" />
								<div className="space-y-2">
									<div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
									<div className="h-1.5 w-11/12 rounded-full bg-muted-foreground/10" />
									<div className="h-1.5 w-9/12 rounded-full bg-muted-foreground/10" />
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<div className="rounded-xl bg-muted/50 border border-border p-4">
				<p className="text-muted-foreground text-xs leading-relaxed text-center">
					💡 <strong>Совет:</strong> Стиль влияет на тон повествования и структуру книги. Выберите
					тот, который лучше всего отражает ваши воспоминания.
				</p>
			</div>
		</div>
	);
}
