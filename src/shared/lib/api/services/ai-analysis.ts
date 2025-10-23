import { createClient } from '@/utils/supabase/client';
import { API_URLS } from '../config/urls';
import type { AIAnalysisResult } from '../types';

/**
 * Analyze text with AI
 * @param text - Text to analyze
 * @param userName - Optional user name for personalization
 * @param userId - Optional user ID for tracking
 * @returns AI analysis result with reply, summary, sentiment, etc.
 */
export async function analyzeTextWithAI(
  text: string,
  userName?: string,
  userId?: string
): Promise<AIAnalysisResult> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No active session. Please log in.');
    }

    const response = await fetch(API_URLS.AI_ANALYSIS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text, userName, userId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI analysis failed:', errorText);
      throw new Error(`AI analysis failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[AI ANALYSIS] Analysis complete:', result);

    return {
      reply: result.reply || '',
      summary: result.summary || '',
      insight: result.insight || '',
      sentiment: result.sentiment || 'neutral',
      category: result.category || 'Другое',
      tags: result.tags || [],
      confidence: result.confidence || 0,
      isAchievement: result.isAchievement || false,
      mood: result.mood || 'нормальное',
      entrySummaryId: result.entrySummaryId
    };
  } catch (error) {
    console.error('[AI ANALYSIS] Error:', error);
    throw error;
  }
}

