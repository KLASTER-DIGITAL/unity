/**
 * Book Creation Wizard
 *
 * 4-step wizard for creating a personalized PDF book.
 *
 * Steps:
 * 1. Period selection (start/end dates)
 * 2. Contexts selection (categories filter)
 * 3. Style selection (warm_family/biographical/motivational)
 * 4. Layout selection (photo_text/text_only/minimal)
 *
 * Theme is always 'light' by default.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { createClient } from '@/utils/supabase/client';
import { BookGenerationProgress } from './BookGenerationProgress';

type BookCreationWizardProps = {
	onComplete?: (draftId: string) => void;
	onCancel?: () => void;
};

type WizardStep = 1 | 2 | 3 | 4;

type BookConfig = {
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: 'warm_family' | 'biographical' | 'motivational';
	layout: 'photo_text' | 'text_only' | 'minimal';
};

export function BookCreationWizard({ onComplete, onCancel }: BookCreationWizardProps) {
	const [currentStep, setCurrentStep] = useState<WizardStep>(1);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [generatedDraftId, setGeneratedDraftId] = useState<string | null>(null);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [diaryName, setDiaryName] = useState<string>('');
	const [diaryEmoji, setDiaryEmoji] = useState<string>('');

	const [config, setConfig] = useState<BookConfig>({
		periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
		periodEnd: new Date().toISOString().split('T')[0], // today
		contexts: [],
		style: '' as any, // Force user to select
		layout: '' as any, // Force user to select
	});

	// Get user ID and profile from session
	useEffect(() => {
		const getUserData = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);

				// Fetch profile for diary_name and diary_emoji
				const { data: profile } = await supabase
					.from('profiles')
					.select('diary_name, diary_emoji')
					.eq('id', session.user.id)
					.single();

				if (profile) {
					setDiaryName(profile.diary_name || '');
					setDiaryEmoji(profile.diary_emoji || '');
				}
			}
		};
		getUserData();
	}, []);

	// Fetch available categories from user's entries
	useEffect(() => {
		if (!userId) return;

		const fetchCategories = async () => {
			try {
				const supabase = createClient();
				const { data, error } = await supabase
					.from('entries')
					.select('category')
					.eq('user_id', userId)
					.not('category', 'is', null);

				if (error) {
					console.error('[WIZARD] Error fetching categories:', error);
					return;
				}

				// Extract unique categories
				const categories = [...new Set(data.map((entry) => entry.category).filter(Boolean))];
				setAvailableCategories(categories as string[]);
			} catch (error) {
				console.error('[WIZARD] Error:', error);
			}
		};

		fetchCategories();
	}, [userId]);

	// Handle next step
	const handleNext = () => {
		if (currentStep < 4) {
			setCurrentStep((prev) => (prev + 1) as WizardStep);
		} else {
			handleGenerate();
		}
	};

	// Handle previous step
	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as WizardStep);
		}
	};

	// Handle generate book
	const handleGenerate = async () => {
		if (!userId) {
			toast.error('Необходима авторизация');
			return;
		}

		try {
			setIsGenerating(true);
			setShowProgress(true); // ✅ Show progress modal

			// Get access token
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				toast.error('Необходима авторизация');
				setIsGenerating(false);
				setShowProgress(false);
				return;
			}

			console.log('[WIZARD] Generating book with config:', {
				userId: session.user.id,
				periodStart: config.periodStart,
				periodEnd: config.periodEnd,
				contexts: config.contexts,
				style: config.style,
				layout: config.layout,
				theme: 'light', // Always use light theme
				diaryName: diaryName || 'Мой дневник',
				diaryEmoji: diaryEmoji || '📝',
			});

			// Call Edge Function
			const response = await fetch(API_URLS.BOOKS_GENERATE_DRAFT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					userId: session.user.id,
					periodStart: config.periodStart,
					periodEnd: config.periodEnd,
					contexts: config.contexts,
					style: config.style,
					layout: config.layout,
					theme: 'light', // Always use light theme
					diaryName: diaryName || 'Мой дневник',
					diaryEmoji: diaryEmoji || '📝',
				}),
			});

			const result = await response.json();

			console.log('[WIZARD] API response:', result);

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать черновик');
			}

			// ✅ Store draft ID for later
			setGeneratedDraftId(result.draftId);
			toast.success('Черновик книги создан!');
		} catch (error) {
			console.error('[WIZARD] Error generating book:', error);
			toast.error(error instanceof Error ? error.message : 'Произошла ошибка при создании книги');
			setShowProgress(false); // ✅ Hide progress on error
		} finally {
			setIsGenerating(false);
		}
	};

	// Validate current step
	const isStepValid = () => {
		switch (currentStep) {
			case 1:
				return config.periodStart && config.periodEnd && config.periodStart <= config.periodEnd;
			case 2:
				return true; // Contexts are optional
			case 3:
				return config.style !== '';
			case 4:
				return config.layout !== '';
			default:
				return false;
		}
	};

	// Toggle context
	const toggleContext = (context: string) => {
		setConfig((prev) => ({
			...prev,
			contexts: prev.contexts.includes(context)
				? prev.contexts.filter((c) => c !== context)
				: [...prev.contexts, context],
		}));
	};

	return (
		<>
			<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-background">
				{/* Header */}
				<div className="bg-linear-to-r from-purple-600 to-blue-600 p-4 text-white sm:p-6">
					<div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12">
							<Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
						</div>
						<div>
							<h2 className="text-lg sm:text-xl">Создание книги</h2>
							<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
								Шаг {currentStep} из 4
							</p>
						</div>
					</div>

					{/* Progress */}
					<Progress className="h-2" value={(currentStep / 4) * 100} />
				</div>

				{/* Content */}
				<div className="max-h-[calc(100vh-180px)] overflow-y-auto p-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">
								{currentStep === 1 && 'Выберите период'}
								{currentStep === 2 && 'Выберите контексты'}
								{currentStep === 3 && 'Выберите стиль'}
								{currentStep === 4 && 'Выберите макет'}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 sm:space-y-4">
							{/* Step 1: Period Selection */}
							{currentStep === 1 && (
								<div className="space-y-4">
									<div>
										<Label htmlFor="periodStart">Начало периода</Label>
										<div className="relative mt-2">
											<Calendar
												className="absolute top-3 left-3 h-5 w-5 text-muted-foreground"
												strokeWidth={2}
											/>
											<input
												className="w-full rounded-lg border bg-background py-2 pr-3 pl-10 transition-colors duration-300"
												id="periodStart"
												max={config.periodEnd}
												onChange={(e) => setConfig({ ...config, periodStart: e.target.value })}
												type="date"
												value={config.periodStart}
											/>
										</div>
									</div>
									<div>
										<Label htmlFor="periodEnd">Конец периода</Label>
										<div className="relative mt-2">
											<Calendar
												className="absolute top-3 left-3 h-5 w-5 text-muted-foreground"
												strokeWidth={2}
											/>
											<input
												className="w-full rounded-lg border bg-background py-2 pr-3 pl-10 transition-colors duration-300"
												id="periodEnd"
												max={new Date().toISOString().split('T')[0]}
												min={config.periodStart}
												onChange={(e) => setConfig({ ...config, periodEnd: e.target.value })}
												type="date"
												value={config.periodEnd}
											/>
										</div>
									</div>
									<p className="text-muted-foreground text-sm">
										Выберите период для создания книги. Будут использованы записи из этого
										диапазона.
									</p>
								</div>
							)}

							{/* Step 2: Contexts Selection */}
							{currentStep === 2 && (
								<div className="space-y-3 sm:space-y-4">
									{availableCategories.length === 0 ? (
										<p className="text-muted-foreground text-xs sm:text-sm">
											У вас пока нет категорий в записях. Все записи будут включены в книгу.
										</p>
									) : (
										<>
											<p className="text-muted-foreground text-xs sm:text-sm">
												Выберите категории записей для включения в книгу. Если ничего не выбрано,
												будут использованы все записи.
											</p>
											<div className="max-h-[300px] space-y-2 overflow-y-auto">
												{availableCategories.map((category) => (
													<div
														className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors duration-300 hover:border-primary/50"
														key={category}
													>
														<Checkbox
															checked={config.contexts.includes(category)}
															className="border-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
															id={`context-${category}`}
															onCheckedChange={() => toggleContext(category)}
														/>
														<Label
															className="flex-1 cursor-pointer text-sm sm:text-base"
															htmlFor={`context-${category}`}
														>
															{category}
														</Label>
													</div>
												))}
											</div>
										</>
									)}
								</div>
							)}

							{/* Step 3: Style Selection */}
							{currentStep === 3 && (
								<div className="space-y-3 sm:space-y-4">
									<p className="text-muted-foreground text-xs sm:text-sm">
										Выберите стиль повествования для вашей книги.
									</p>
									<div className="space-y-2">
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.style === 'warm_family'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, style: 'warm_family' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">
												🏡 Семейная история
											</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												Теплое повествование о моментах единения, любви и совместного роста
											</div>
										</button>
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.style === 'biographical'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, style: 'biographical' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">📖 Биография</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												Фокус на личном развитии и ключевых моментах жизни
											</div>
										</button>
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.style === 'motivational'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, style: 'motivational' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">🚀 Мотивация</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												История успеха с акцентом на достижения и преодоление трудностей
											</div>
										</button>
									</div>
								</div>
							)}

							{/* Step 4: Layout Selection */}
							{currentStep === 4 && (
								<div className="space-y-3 sm:space-y-4">
									<p className="text-muted-foreground text-xs sm:text-sm">
										Выберите макет страниц для вашей книги.
									</p>
									<div className="space-y-2">
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.layout === 'photo_text'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, layout: 'photo_text' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">📸 Фото + Текст</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												Фотографии с текстовым описанием на каждой странице
											</div>
										</button>
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.layout === 'text_only'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, layout: 'text_only' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">📝 Только текст</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												Классический текстовый формат без изображений
											</div>
										</button>
										<button
											className={`w-full rounded-lg border p-3 text-left transition-colors duration-300 sm:p-4 ${
												config.layout === 'minimal'
													? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig({ ...config, layout: 'minimal' })}
											style={{ minHeight: '44px' }}
											type="button"
										>
											<div className="mb-1 text-sm font-medium sm:text-base">✨ Минимализм</div>
											<div className="text-muted-foreground text-xs sm:text-sm">
												Минималистичный дизайн с акцентом на содержание
											</div>
										</button>
									</div>
								</div>
							)}

							{/* Navigation Buttons */}
							<div className="flex flex-col gap-3 pt-4">
								<div className="flex flex-row gap-2">
									{currentStep > 1 && (
										<Button className="flex-1" onClick={handlePrevious} variant="outline">
											<ChevronLeft className="mr-1 h-4 w-4 sm:mr-2" strokeWidth={2} />
											<span className="text-sm sm:text-base">Назад</span>
										</Button>
									)}
									{currentStep < 4 ? (
										<Button
											className="flex-1"
											disabled={!isStepValid()}
											onClick={handleNext}
											style={{ minHeight: '44px' }}
										>
											<span className="text-sm sm:text-base">Далее</span>
											<ChevronRight className="ml-1 h-4 w-4 sm:ml-2" strokeWidth={2} />
										</Button>
									) : (
										<Button
											className="flex-1"
											disabled={!isStepValid() || isGenerating}
											onClick={handleNext}
											style={{ minHeight: '44px' }}
										>
											{isGenerating ? (
												<>
													<Sparkles className="mr-1 h-4 w-4 animate-spin sm:mr-2" strokeWidth={2} />
													<span className="text-sm sm:text-base">Создание...</span>
												</>
											) : (
												<>
													<Sparkles className="mr-1 h-4 w-4 sm:mr-2" strokeWidth={2} />
													<span className="text-sm sm:text-base">Создать книгу</span>
												</>
											)}
										</Button>
									)}
								</div>

								{onCancel && (
									<Button
										className="w-full"
										onClick={onCancel}
										style={{ minHeight: '44px' }}
										variant="ghost"
									>
										<span className="text-sm sm:text-base">Отмена</span>
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Progress Modal */}
			<BookGenerationProgress
				isOpen={showProgress}
				onClose={() => setShowProgress(false)}
				onComplete={() => {
					setShowProgress(false);
					if (generatedDraftId) {
						onComplete?.(generatedDraftId);
					}
				}}
			/>
		</>
	);
}
