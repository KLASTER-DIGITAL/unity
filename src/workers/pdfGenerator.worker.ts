/**
 * PDF Generator Web Worker
 *
 * Offloads heavy @react-pdf/renderer PDF generation to a background thread
 * to prevent UI blocking and improve user experience.
 *
 * @author UNITY Team
 * @date 2025-12-01
 */

import { Font, pdf } from '@react-pdf/renderer';
import React from 'react';
import { BookPDFDocument } from '../features/mobile/reports/components/BookPDFDocument';

export type PDFWorkerMessage = {
	type: 'GENERATE_PDF';
	payload: {
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
		fontBaseUrl: string; // ✅ NEW: Pass font URL from main thread
	};
};

export type PDFWorkerResponse =
	| {
			type: 'PDF_PROGRESS';
			payload: {
				progress: number;
				message: string;
			};
	  }
	| {
			type: 'PDF_SUCCESS';
			payload: {
				blob: Blob;
			};
	  }
	| {
			type: 'PDF_ERROR';
			payload: {
				error: string;
			};
	  };

// Worker message handler
self.onmessage = async (event: MessageEvent<PDFWorkerMessage>) => {
	const { type, payload } = event.data;

	if (type === 'GENERATE_PDF') {
		try {
			// Send progress: starting
			self.postMessage({
				type: 'PDF_PROGRESS',
				payload: {
					progress: 10,
					message: 'Подготовка документа...',
				},
			} satisfies PDFWorkerResponse);

			// ✅ Register fonts dynamically using passed URL
			const FONT_BASE_URL = payload.fontBaseUrl;

			try {
				Font.register({
					family: 'Noto Sans',
					fonts: [
						{
							src: `${FONT_BASE_URL}/noto-sans/NotoSans-Regular.woff2`,
							fontWeight: 400,
						},
						{
							src: `${FONT_BASE_URL}/noto-sans/NotoSans-Medium.woff2`,
							fontWeight: 500,
						},
						{
							src: `${FONT_BASE_URL}/noto-sans/NotoSans-SemiBold.woff2`,
							fontWeight: 600,
						},
					],
				});

				Font.register({
					family: 'Noto Serif',
					fonts: [
						{
							src: `${FONT_BASE_URL}/noto-serif/NotoSerif-Regular.woff2`,
							fontWeight: 400,
						},
						{
							src: `${FONT_BASE_URL}/noto-serif/NotoSerif-SemiBold.woff2`,
							fontWeight: 600,
						},
					],
				});
			} catch (fontError) {
				console.warn('Font registration failed (might be already registered):', fontError);
			}

			// Create PDF document component
			const pdfDoc = React.createElement(BookPDFDocument, {
				story: payload.story,
				metadata: payload.metadata,
				bookStyle: payload.style, // ✅ Updated prop name
				theme: payload.theme,
				// We don't need to pass fontBaseUrl to component if we registered fonts globally here
			});

			// Send progress: rendering
			self.postMessage({
				type: 'PDF_PROGRESS',
				payload: {
					progress: 40,
					message: 'Генерация PDF...',
				},
			} satisfies PDFWorkerResponse);

			// Generate PDF blob (this is the CPU-intensive part)
			// biome-ignore lint/suspicious/noExplicitAny: ReactPDF types are strict
			const blob = await pdf(pdfDoc as any).toBlob();

			// Send progress: finalizing
			self.postMessage({
				type: 'PDF_PROGRESS',
				payload: {
					progress: 90,
					message: 'Финализация...',
				},
			} satisfies PDFWorkerResponse);

			// Send success with blob
			self.postMessage({
				type: 'PDF_SUCCESS',
				payload: {
					blob,
				},
			} satisfies PDFWorkerResponse);
		} catch (error) {
			// Send error
			const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
			self.postMessage({
				type: 'PDF_ERROR',
				payload: {
					error: errorMessage,
				},
			} satisfies PDFWorkerResponse);
		}
	}
};
