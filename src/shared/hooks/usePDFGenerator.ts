/**
 * PDF Generator Hook
 *
 * Custom hook to generate PDFs using Web Worker for better performance.
 * Includes caching to avoid re-generating the same PDF.
 *
 * @author UNITY Team
 * @date 2025-12-01
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/shared/lib/i18n';
import {
	cachePDF,
	generateContentHash,
	getCachedPDF,
	type PDFCacheKey,
} from '@/shared/lib/pdf/pdfCache';
import { createClient } from '@/utils/supabase/client';
import type { PDFWorkerMessage, PDFWorkerResponse } from '@/workers/pdfGenerator.worker';

export type PDFGenerationState = {
	isGenerating: boolean;
	progress: number;
	message: string;
	error: string | null;
};

export type PDFGenerationOptions = {
	story: {
		title?: string;
		subtitle?: string;
		prologue?: string;
		epilogue?: string;
		dedication?: string;
		chapters?: Array<{
			title?: string;
			content?: string;
			highlights?: string[];
			is_divider?: boolean;
			is_chronicle?: boolean;
		}>;
	};
	metadata?: {
		diaryEmoji?: string;
	};
	style?: string;
	theme?: string;
	draftId: string;
	useCache?: boolean;
};

export function usePDFGenerator() {
	const { t } = useTranslation();
	const workerRef = useRef<Worker | null>(null);
	const [state, setState] = useState<PDFGenerationState>({
		isGenerating: false,
		progress: 0,
		message: '',
		error: null,
	});

	const generatePDF = useCallback(
		async (options: PDFGenerationOptions): Promise<string> => {
			const { story, metadata, style, theme, draftId, useCache = true } = options;

			try {
				setState({
					isGenerating: true,
					progress: 0,
					message: t('books.pdf.checking_cache', 'Проверка кэша...'),
					error: null,
				});

				// Get user session
				const supabase = createClient();
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!session?.user) {
					throw new Error('Необходима авторизация');
				}

				const userId = session.user.id;

				// Check cache first
				if (useCache) {
					const contentHash = generateContentHash(story);
					const cached = await getCachedPDF({
						userId,
						draftId,
						contentHash,
					});

					if (cached && !cached.isStale) {
						console.log('[PDF-GENERATOR] Using cached PDF');

						setState({
							isGenerating: false,
							progress: 100,
							message: t('books.pdf.cache_hit', 'PDF получен из кэша'),
							error: null,
						});

						// Still update database with cached URL
						await supabase
							.from('books_archive')
							.update({
								pdf_url: cached.url,
								is_final: true,
								is_draft: false,
							})
							.eq('id', draftId);

						return cached.url;
					}
				}

				// Create Web Worker if not exists
				if (!workerRef.current) {
					workerRef.current = new Worker(
						new URL('../../../workers/pdfGenerator.worker.ts', import.meta.url),
						{
							type: 'module',
						}
					);
				}

				// Generate PDF using Web Worker
				const pdfUrl = await new Promise<string>((resolve, reject) => {
					if (!workerRef.current) {
						reject(new Error('Worker not initialized'));
						return;
					}

					workerRef.current.onmessage = async (event: MessageEvent<PDFWorkerResponse>) => {
						const { type, payload } = event.data;

						switch (type) {
							case 'PDF_PROGRESS':
								setState((prev) => ({
									...prev,
									progress: payload.progress,
									message: payload.message,
								}));
								break;

							case 'PDF_SUCCESS': {
								try {
									// Upload to Supabase Storage
									setState((prev) => ({
										...prev,
										progress: 95,
										message: t('books.pdf.uploading', 'Загрузка PDF...'),
									}));

									const cacheKey: PDFCacheKey = {
										userId,
										draftId,
										contentHash: generateContentHash(story),
									};

									const url = await cachePDF(cacheKey, payload.blob);

									// Update database
									const { error: dbError } = await supabase
										.from('books_archive')
										.update({
											pdf_url: url,
											is_final: true,
											is_draft: false,
										})
										.eq('id', draftId);

									if (dbError) {
										throw new Error(`Ошибка обновления БД: ${dbError.message}`);
									}

									setState({
										isGenerating: false,
										progress: 100,
										message: t('books.pdf.success', 'PDF создан!'),
										error: null,
									});

									resolve(url);
								} catch (error) {
									const errorMsg = error instanceof Error ? error.message : 'Unknown error';
									setState((prev) => ({
										...prev,
										isGenerating: false,
										error: errorMsg,
									}));
									reject(error);
								}
								break;
							}

							case 'PDF_ERROR':
								setState((prev) => ({
									...prev,
									isGenerating: false,
									error: payload.error,
								}));
								reject(new Error(payload.error));
								break;
						}
					};

					workerRef.current.onerror = (error) => {
						console.error('[PDF-GENERATOR] Worker error:', error);
						setState((prev) => ({
							...prev,
							isGenerating: false,
							error: 'Ошибка Web Worker',
						}));
						reject(error);
					};

					// Send message to worker
					const message: PDFWorkerMessage = {
						type: 'GENERATE_PDF',
						payload: {
							story,
							metadata,
							style,
							theme,
						},
					};

					workerRef.current.postMessage(message);
				});

				toast.success(t('books.pdf.success', 'PDF книга создана!'));
				return pdfUrl;
			} catch (error) {
				console.error('[PDF-GENERATOR] Error:', error);
				const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';

				setState((prev) => ({
					...prev,
					isGenerating: false,
					error: errorMsg,
				}));

				toast.error(t('books.pdf.error', 'Ошибка при создании PDF'), {
					description: errorMsg,
				});

				throw error;
			}
		},
		[t]
	);

	// Cleanup worker on unmount
	const cleanup = useCallback(() => {
		if (workerRef.current) {
			workerRef.current.terminate();
			workerRef.current = null;
		}
	}, []);

	return {
		generatePDF,
		state,
		cleanup,
	};
}
