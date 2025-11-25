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
		<div className="space-y-6">
			<p className="text-white/70 text-sm text-center">Выберите макет для вашей книги</p>

			<div className="grid grid-cols-1 gap-4">
				{LAYOUT_OPTIONS.map((option) => {
					const isActive = config.layout === option.value;

					return (
						<button
							className={`relative overflow - hidden rounded - 2xl border p - 5 text - left transition - all duration - 300 ${
								isActive
									? 'border-white/40 bg-white/10 shadow-lg shadow-white/10'
									: 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
							} `}
							key={option.value}
							onClick={() => onConfigChange({ layout: option.value })}
							type="button"
						>
							<div className="flex items-start gap-4 mb-4">
								<span className="text-3xl">{option.emoji}</span>
								<div className="flex-1">
									<h3 className="text-lg font-bold text-white mb-1">{option.label}</h3>
									<p className="text-white/70 text-sm leading-relaxed">{option.description}</p>
								</div>
								{isActive && (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
										<svg
											className="h-4 w-4 text-black"
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
								className={`rounded - xl border p - 4 flex items - center gap - 3 transition - all duration - 300 ${
									isActive ? 'border-white/20 bg-white/5' : 'border-white/10 bg-white/[0.02]'
								} `}
							>
								{option.value === 'photo_text' && (
									<div className="h-14 w-12 rounded-lg bg-white/20 flex-shrink-0" />
								)}
								<div className="flex-1 space-y-2">
									<div className="h-1.5 w-full rounded-full bg-white/20" />
									<div className="h-1.5 w-11/12 rounded-full bg-white/15" />
									<div className="h-1.5 w-9/12 rounded-full bg-white/10" />
								</div>
							</div>
						</button>
					);
				})}
			</div>

			<div className="rounded-xl bg-white/5 border border-white/10 p-4">
				<p className="text-white/60 text-xs leading-relaxed text-center">
					💡 <strong>Совет:</strong> Макет определяет визуальное оформление книги. Выберите тот,
					который лучше всего подходит для ваших записей.
				</p>
			</div>
		</div>
	);
}
