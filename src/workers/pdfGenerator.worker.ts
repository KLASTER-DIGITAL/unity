/**
 * PDF Generator Web Worker
 *
 * Offloads heavy @react-pdf/renderer PDF generation to a background thread
 * to prevent UI blocking and improve user experience.
 *
 * @author UNITY Team
 * @date 2025-12-01
 */

import { pdf } from '@react-pdf/renderer';
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

			// Create PDF document component
			const pdfDoc = React.createElement(BookPDFDocument, {
				story: payload.story,
				metadata: payload.metadata,
				style: payload.style,
				theme: payload.theme,
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
			const blob = await pdf(pdfDoc).toBlob();

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
