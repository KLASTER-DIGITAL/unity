import { createClient } from '@/utils/supabase/client';
import { API_URLS } from '../config/urls';
import type { MotivationCard } from '../types';

/**
 * Get motivation cards for a user
 * @param userId - User ID
 * @returns Array of motivation cards
 */
export async function getMotivationCards(userId: string): Promise<MotivationCard[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  try {
    console.log('[MOTIVATIONS] 🎯 Attempting motivations microservice (5s timeout)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URLS.MOTIVATIONS}/cards/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[MOTIVATIONS] ✅ Microservice success');
    return data.cards || [];

  } catch (microserviceError: any) {
    console.error('[MOTIVATIONS] ❌ Microservice failed, using fallback...');

    // Fallback: Direct Supabase query
    const { data, error } = await supabase
      .from('motivation_cards')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('[MOTIVATIONS] ❌ Fallback also failed:', error);
      throw new Error('Failed to fetch motivation cards');
    }

    console.log('[MOTIVATIONS] ✅ Fallback success');
    return data || [];
  }
}

/**
 * Mark a motivation card as read
 * @param userId - User ID
 * @param cardId - Card ID
 */
export async function markCardAsRead(userId: string, cardId: string): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  try {
    console.log('[MOTIVATIONS] 🎯 Marking card as read via microservice (5s timeout)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URLS.MOTIVATIONS}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId, cardId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Mark as read failed');
    }

    console.log('[MOTIVATIONS] ✅ Card marked as read via microservice');
    return;

  } catch (microserviceError: any) {
    console.error('[MOTIVATIONS] ❌ Microservice failed, using fallback...');

    // Fallback: Direct Supabase update
    const { error } = await supabase
      .from('motivation_cards')
      .update({ is_marked: true })
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) {
      console.error('[MOTIVATIONS] ❌ Fallback also failed:', error);
      throw new Error('Failed to mark card as read');
    }

    console.log('[MOTIVATIONS] ✅ Card marked as read via fallback');
  }
}

