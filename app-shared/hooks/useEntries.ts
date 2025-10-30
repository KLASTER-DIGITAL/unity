/**
 * useEntries Hook for React Native
 *
 * Управление записями дневника с real-time updates
 * Адаптировано из PWA версии для React Native
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

export interface DiaryEntry {
	id: string;
	userId: string;
	text: string;
	sentiment: "positive" | "neutral" | "negative";
	category: string;
	mood: string;
	isFirstEntry: boolean;
	media: any;
	aiReply: string;
	aiSummary: string | null;
	aiInsight: string | null;
	isAchievement: boolean;
	tags: string[];
	streakDay: number;
	focusArea: string;
	createdAt: string;
	voiceUrl: string | null;
	mediaUrl: string | null;
}

interface UseEntriesResult {
	entries: DiaryEntry[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	createEntry: (entry: Partial<DiaryEntry>) => Promise<DiaryEntry>;
	updateEntry: (
		id: string,
		updates: Partial<DiaryEntry>,
	) => Promise<DiaryEntry>;
	deleteEntry: (id: string) => Promise<void>;
}

/**
 * Hook для работы с записями дневника
 */
export function useEntries(userId: string | undefined): UseEntriesResult {
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Fetch entries
	const fetchEntries = useCallback(async () => {
		if (!userId) {
			setEntries([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const { data, error: fetchError } = await supabase
				.from("entries")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (fetchError) {
				throw fetchError;
			}

			// Convert to camelCase
			const formattedEntries: DiaryEntry[] = (data || []).map((entry: any) => ({
				id: entry.id,
				userId: entry.user_id,
				text: entry.text,
				sentiment: entry.sentiment,
				category: entry.category,
				mood: entry.mood,
				isFirstEntry: entry.is_first_entry,
				media: entry.media,
				aiReply: entry.ai_reply,
				aiSummary: entry.ai_summary,
				aiInsight: entry.ai_insight,
				isAchievement: entry.is_achievement,
				tags: entry.tags,
				streakDay: entry.streak_day,
				focusArea: entry.focus_area,
				createdAt: entry.created_at,
				voiceUrl: entry.voice_url,
				mediaUrl: entry.media_url,
			}));

			setEntries(formattedEntries);
		} catch (err) {
			console.error("[useEntries] Error fetching entries:", err);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	// Initial fetch
	useEffect(() => {
		fetchEntries();
	}, [fetchEntries]);

	// Real-time subscription
	useEffect(() => {
		if (!userId) return;

		const channel = supabase
			.channel(`entries:${userId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "entries",
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log("[useEntries] Real-time update:", payload);
					fetchEntries();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, fetchEntries]);

	// Create entry
	const createEntry = useCallback(
		async (entry: Partial<DiaryEntry>): Promise<DiaryEntry> => {
			if (!userId) {
				throw new Error("User ID is required");
			}

			try {
				const { data, error: insertError } = await supabase
					.from("entries")
					.insert({
						user_id: userId,
						text: entry.text,
						sentiment: entry.sentiment || "neutral",
						category: entry.category || "Другое",
						mood: entry.mood || "нормальное",
						is_first_entry: entry.isFirstEntry,
						media: entry.media || null,
						ai_reply: entry.aiReply || "",
						ai_summary: entry.aiSummary || null,
						ai_insight: entry.aiInsight || null,
						is_achievement: entry.isAchievement,
						tags: entry.tags || [],
						streak_day: entry.streakDay || 1,
						focus_area: entry.focusArea || entry.category || "Другое",
						created_at: new Date().toISOString(),
					})
					.select()
					.single();

				if (insertError) {
					throw insertError;
				}

				// Convert to camelCase
				const newEntry: DiaryEntry = {
					id: data.id,
					userId: data.user_id,
					text: data.text,
					sentiment: data.sentiment,
					category: data.category,
					mood: data.mood,
					isFirstEntry: data.is_first_entry,
					media: data.media,
					aiReply: data.ai_reply,
					aiSummary: data.ai_summary,
					aiInsight: data.ai_insight,
					isAchievement: data.is_achievement,
					tags: data.tags,
					streakDay: data.streak_day,
					focusArea: data.focus_area,
					createdAt: data.created_at,
					voiceUrl: data.voice_url,
					mediaUrl: data.media_url,
				};

				setEntries((prev) => [newEntry, ...prev]);
				return newEntry;
			} catch (err) {
				console.error("[useEntries] Error creating entry:", err);
				throw err;
			}
		},
		[userId],
	);

	// Update entry
	const updateEntry = useCallback(
		async (id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> => {
			try {
				const { data, error: updateError } = await supabase
					.from("entries")
					.update({
						text: updates.text,
						sentiment: updates.sentiment,
						category: updates.category,
						mood: updates.mood,
						ai_reply: updates.aiReply,
						ai_summary: updates.aiSummary,
						ai_insight: updates.aiInsight,
						tags: updates.tags,
						focus_area: updates.focusArea,
					})
					.eq("id", id)
					.select()
					.single();

				if (updateError) {
					throw updateError;
				}

				// Convert to camelCase
				const updatedEntry: DiaryEntry = {
					id: data.id,
					userId: data.user_id,
					text: data.text,
					sentiment: data.sentiment,
					category: data.category,
					mood: data.mood,
					isFirstEntry: data.is_first_entry,
					media: data.media,
					aiReply: data.ai_reply,
					aiSummary: data.ai_summary,
					aiInsight: data.ai_insight,
					isAchievement: data.is_achievement,
					tags: data.tags,
					streakDay: data.streak_day,
					focusArea: data.focus_area,
					createdAt: data.created_at,
					voiceUrl: data.voice_url,
					mediaUrl: data.media_url,
				};

				setEntries((prev) => prev.map((e) => (e.id === id ? updatedEntry : e)));
				return updatedEntry;
			} catch (err) {
				console.error("[useEntries] Error updating entry:", err);
				throw err;
			}
		},
		[],
	);

	// Delete entry
	const deleteEntry = useCallback(async (id: string): Promise<void> => {
		try {
			const { error: deleteError } = await supabase
				.from("entries")
				.delete()
				.eq("id", id);

			if (deleteError) {
				throw deleteError;
			}

			setEntries((prev) => prev.filter((e) => e.id !== id));
		} catch (err) {
			console.error("[useEntries] Error deleting entry:", err);
			throw err;
		}
	}, []);

	return {
		entries,
		isLoading,
		error,
		refetch: fetchEntries,
		createEntry,
		updateEntry,
		deleteEntry,
	};
}
