/**
 * Types for Chat Input Section
 */

import type { DiaryEntry } from '@/shared/lib/api';

export type ChatMessage = {
	id: string;
	type: 'user' | 'ai';
	text: string;
	timestamp: Date;
	category?: string;
	sentiment?: 'positive' | 'neutral' | 'negative';
	entryId?: string;
};

export type ChatInputSectionProps = {
	onMessageSent?: (message: ChatMessage) => void;
	onEntrySaved?: (entry: DiaryEntry) => void;
	userName?: string;
	userId?: string;
};

export type Category = {
	id: string;
	label: string;
	icon: string;
	color: string;
};
