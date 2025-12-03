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
		style: 'warm_family' as any,
		// biome-ignore lint/suspicious/noExplicitAny: initial state
		layout: 'photo_text' as any,
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
		// ✅ FIX: Always show all steps, but lock Premium ones in UI
		if (currentStep < 4) {
			setCurrentStep((prev) => (prev + 1) as WizardStep);
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

			// ✅ FIX: Set draft ID immediately
			const newDraftId = result.draftId || null;
			setGeneratedDraftId(newDraftId);
			setGenerationError(null);

			// ✅ FIX: НЕ показываем модальное окно сразу - ждем завершения прогресса
			// Прогресс будет завершен через BookGenerationProgress.onComplete -> handleProgressComplete
			if (newDraftId) {
				console.log('[useBookCreation] Generation success, draft ID:', newDraftId);
				// НЕ закрываем прогресс и НЕ показываем модальное окно здесь
				// Ждем handleProgressComplete из BookGenerationProgress
			}
		} catch (error) {
			console.error('[useBookCreation] Error generating book:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Произошла ошибка при создании книги';
			setGenerationError(errorMessage);
			toast.error('Ошибка генерации', { description: errorMessage });
			setShowProgress(false); // Hide progress immediately on error
			isGeneratingRef.current = false;
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRetry = () => {
		setGenerationError(null);
		handleGenerate();
	};

	// ✅ FIX: Показываем модальное окно успеха ТОЛЬКО после завершения прогресса
	const handleProgressComplete = useCallback(() => {
		console.log('[useBookCreation] Progress complete, checking draft ID...');

		// We use the state updater to access the latest draftId value reliably
		setGeneratedDraftId((currentDraftId) => {
			if (currentDraftId) {
				console.log('[useBookCreation] Draft ID found, showing success modal:', currentDraftId);
				setShowProgress(false);
				isGeneratingRef.current = false;
				// ✅ FIX: Показываем модальное окно ТОЛЬКО после завершения прогресса
				setShowSuccessModal(true);
			} else {
				console.warn('[useBookCreation] No draft ID found, closing progress without success modal');
				setShowProgress(false);
				isGeneratingRef.current = false;
				// Не показываем модальное окно если нет draft ID
			}
			return currentDraftId;
		});
	}, []);

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
