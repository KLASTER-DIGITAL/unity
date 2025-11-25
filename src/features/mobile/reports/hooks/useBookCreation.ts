/**
 * useBookCreation Hook
 * Shared logic for Book Creation Wizard (Web & Mobile)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '../../../../utils/supabase/client';
import { DEFAULT_PERIOD_DAYS } from '../components/book-creation-wizard/constants';
import type { BookConfig, WizardStep } from '../components/book-creation-wizard/types';
import {
	checkFreeTierLimit,
	fetchAvailableCategories,
	generateBookDraft,
	validateMinimumEntries,
} from '../components/book-creation-wizard/utils';

export function useBookCreation(
	onComplete?: (draftId: string) => void,
	existingBookId?: string // ✅ NEW: Optional ID for overwrite mode
) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [generatedDraftId, setGeneratedDraftId] = useState<string | null>(null);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [diaryName, setDiaryName] = useState<string>('');
	const [diaryEmoji, setDiaryEmoji] = useState<string>('');
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [isPremium, setIsPremium] = useState(false);
	const [showUpsellModal, setShowUpsellModal] = useState(false);
	const [isLoadingUser, setIsLoadingUser] = useState(true);

	// Prevent multiple calls to handleGenerate
	const isGeneratingRef = useRef(false);

	const [config, setConfig] = useState<BookConfig>({
		// biome-ignore lint/suspicious/noExplicitAny: initial state
		planType: '' as any,
		type: 'month',
		periodStart: new Date(Date.now() - DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0],
		periodEnd: new Date().toISOString().split('T')[0],
		contexts: [],
		// biome-ignore lint/suspicious/noExplicitAny: initial state
		style: '' as any,
		// biome-ignore lint/suspicious/noExplicitAny: initial state
		layout: '' as any,
		theme: 'light',
	});

	const [currentStep, setCurrentStep] = useState<WizardStep>(0);

	// Load user data
	useEffect(() => {
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complex user data loading logic
		const getUserData = async () => {
			try {
				setIsLoadingUser(true);
				const supabase = createClient();
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session?.user?.id) {
					setUserId(session.user.id);

					const { data: profile } = await supabase
						.from('profiles')
						.select('diary_name, diary_emoji, is_premium')
						.eq('id', session.user.id)
						.single();

					if (profile) {
						setDiaryName(profile.diary_name || '');
						setDiaryEmoji(profile.diary_emoji || '');
						const userIsPremium = profile.is_premium || false;
						setIsPremium(userIsPremium);

						// Set initial step and planType
						if (userIsPremium) {
							setConfig((prev) => ({ ...prev, planType: 'premium' }));
							setCurrentStep(1); // Skip step 0 for Premium
						} else {
							setCurrentStep(0);
						}
					} else {
						setCurrentStep(0);
					}
				} else {
					setCurrentStep(0);
				}
			} catch (error) {
				console.error('[useBookCreation] Error loading user data:', error);
				setCurrentStep(0);
			} finally {
				setIsLoadingUser(false);
			}
		};
		getUserData();
	}, []);

	// Load categories
	useEffect(() => {
		if (!userId) return;

		const loadCategories = async () => {
			const categories = await fetchAvailableCategories(userId);
			setAvailableCategories(categories);
		};

		loadCategories();
	}, [userId]);

	const handleConfigChange = (updates: Partial<BookConfig>) => {
		setConfig((prev) => ({ ...prev, ...updates }));
	};

	const handleNext = () => {
		// Skip steps for FREE users
		if (config.planType === 'free') {
			if (currentStep === 0)
				setCurrentStep(1); // 0 → 1 (period)
			else if (currentStep === 1)
				setCurrentStep(2); // 1 → 2 (contexts)
			else if (currentStep === 2) {
				// FREE: skip style and layout, go directly to generation
				handleGenerate();
			}
		} else {
			// PREMIUM: full flow
			if (currentStep < 4) {
				setCurrentStep((prev) => (prev + 1) as WizardStep);
			}
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => (prev - 1) as WizardStep);
		}
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complex validation logic
	const handleGenerate = async () => {
		if (isGeneratingRef.current) {
			console.log('[useBookCreation] Generation already in progress, skipping...');
			return;
		}

		if (!userId) {
			toast.error('Ошибка', { description: 'Пользователь не авторизован' });
			return;
		}

		try {
			isGeneratingRef.current = true;
			setIsGenerating(true);
			setShowProgress(true);

			// Validate minimum entries
			const { valid, count } = await validateMinimumEntries(
				userId,
				config.periodStart,
				config.periodEnd,
				config.contexts
			);

			if (!valid) {
				toast.error('Недостаточно записей', {
					description: `Найдено ${count} записей. Минимум 5 записей требуется для создания книги.`,
				});
				isGeneratingRef.current = false;
				setIsGenerating(false);
				setShowProgress(false);
				return;
			}

			// Check free tier limit (only if NOT overwriting)
			// If overwriting, we assume user already paid/used quota for the original book
			if (!existingBookId) {
				const { canGenerate } = await checkFreeTierLimit(userId, isPremium);

				if (!canGenerate) {
					toast.error('Лимит исчерпан', {
						description:
							'Free пользователи могут создавать 1 книгу в месяц. Перейдите на Premium для неограниченной генерации.',
					});
					isGeneratingRef.current = false;
					setIsGenerating(false);
					setShowProgress(false);
					return;
				}
			}

			// Generate book draft
			const result = await generateBookDraft(config, userId, diaryName, diaryEmoji);

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать черновик');
			}

			// ✅ NEW: If overwriting, delete the old book
			if (existingBookId && result.draftId) {
				console.log('[useBookCreation] Overwriting: Deleting old book', existingBookId);
				const { deleteBook } = await import('../components/book-creation-wizard/utils');
				await deleteBook(existingBookId, userId);
			}

			setGeneratedDraftId(result.draftId || null);
			setGenerationError(null);
			// Toast will be shown in Success Modal after progress completes
		} catch (error) {
			console.error('[useBookCreation] Error generating book:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Произошла ошибка при создании книги';
			setGenerationError(errorMessage);
			toast.error('Ошибка генерации', { description: errorMessage });
			setShowProgress(false);
			isGeneratingRef.current = false;
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRetry = () => {
		setGenerationError(null);
		handleGenerate();
	};

	const handleProgressComplete = useCallback(() => {
		setShowProgress(false);
		isGeneratingRef.current = false;
		if (generatedDraftId) {
			setShowSuccessModal(true);
		}
	}, [generatedDraftId]);

	const handleGoToEditor = () => {
		setShowSuccessModal(false);
		if (generatedDraftId) {
			onComplete?.(generatedDraftId);
		}
	};

	return {
		// State
		currentStep,
		config,
		isGenerating,
		showProgress,
		showSuccessModal,
		generatedDraftId,
		availableCategories,
		userId,
		diaryName,
		diaryEmoji,
		generationError,
		isPremium,
		showUpsellModal,
		isLoadingUser,

		// Setters
		setShowProgress,
		setShowSuccessModal,
		setShowUpsellModal,
		setConfig,
		setCurrentStep,

		// Handlers
		handleConfigChange,
		handleNext,
		handlePrevious,
		handleGenerate,
		handleRetry,
		handleProgressComplete,
		handleGoToEditor,
	};
}
