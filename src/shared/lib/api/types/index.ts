/**
 * User profile interface
 */
export type UserProfile = {
	id: string;
	email: string;
	name: string;
	role?: 'user' | 'super_admin';
	avatar?: string;
	diaryName?: string;
	diaryEmoji?: string;
	language?: string;
	timezone?: string; // ✅ НОВОЕ: Автоопределенный timezone (e.g., "Europe/Moscow", "America/New_York")
	notificationSettings?: any;
	onboardingCompleted?: boolean;
	createdAt?: string;
	theme?: string;
	isPremium?: boolean;
	biometricEnabled?: boolean;
	backupEnabled?: boolean;
	offlineEnabled?: boolean;
	firstDayOfWeek?: string;
	privacySettings?: any;
};

/**
 * Media file interface
 */
export type MediaFile = {
	id: string;
	userId: string;
	fileName: string;
	filePath: string;
	fileType: string;
	fileSize: number;
	createdAt: string;
	url?: string;
	path?: string;
	type?: string;
	mimeType?: string;
};

/**
 * AI analysis result interface
 */
export type AIAnalysisResult = {
	reply: string;
	summary: string;
	insight: string;
	sentiment: 'positive' | 'neutral' | 'negative';
	category: string;
	tags: string[];
	confidence: number;
	isAchievement?: boolean;
	mood?: string;
	entrySummaryId?: string;
};

/**
 * Diary entry interface
 */
export type DiaryEntry = {
	id: string;
	userId: string;
	text: string;
	voiceUrl?: string | null;
	mediaUrl?: string | null;
	media?: MediaFile[];
	sentiment: 'positive' | 'neutral' | 'negative';
	category: string;
	tags: string[];
	aiReply: string;
	aiSummary?: string;
	aiInsight?: string;
	isAchievement?: boolean;
	mood?: string;
	createdAt: string;
	streakDay: number;
	focusArea: string;
};

/**
 * User statistics interface
 */
export type UserStats = {
	totalEntries: number;
	currentStreak: number;
	longestStreak: number;
	totalAchievements: number;
	categoriesCount: Record<string, number>;
	sentimentDistribution: {
		positive: number;
		neutral: number;
		negative: number;
	};
};

/**
 * Upload media options
 */
export type UploadMediaOptions = {
	thumbnail?: File;
	width?: number;
	height?: number;
	duration?: number;
};

/**
 * Motivation card interface
 */
export type MotivationCard = {
	id: string;
	entryId?: string;
	date: string;
	title: string;
	description: string;
	gradient: string;
	isMarked: boolean;
	isDefault?: boolean;
	sentiment?: string;
	mood?: string;
};

/**
 * Book draft interface
 */
export type BookDraft = {
	id: string;
	userId: string;
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: string;
	layout: string;
	theme: string;
	pdfUrl?: string;
	storyJson?: any;
	metadata: any;
	isDraft: boolean;
	isFinal: boolean;
	createdAt: string;
	updatedAt: string;
};

/**
 * Book generation request
 */
export type BookGenerationRequest = {
	period: {
		start: string;
		end: string;
	};
	contexts: string[];
	style: string;
	layout: string;
	theme: string;
	userId: string;
};
