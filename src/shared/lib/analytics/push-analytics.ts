/**
 * Push Notifications Analytics
 * 
 * Отслеживание эффективности push уведомлений:
 * - Delivered rate (доставлено)
 * - Open rate (открыто)
 * - Click-through rate (CTR)
 * - Статистика по браузерам
 * - Статистика по времени
 */

import { createClient } from '@/utils/supabase/client';

export interface PushAnalyticsEvent {
  notification_id?: string;
  user_id: string;
  event_type: 'delivered' | 'opened' | 'closed' | 'subscribed' | 'unsubscribed';
  browser_info?: {
    name: string;
    version: string;
    os: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PushAnalyticsStats {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_closed: number;
  delivery_rate: number; // %
  open_rate: number; // %
  ctr: number; // Click-through rate %
  by_browser: {
    browser: string;
    sent: number;
    delivered: number;
    opened: number;
    delivery_rate: number;
    open_rate: number;
  }[];
  by_hour: {
    hour: number;
    sent: number;
    delivered: number;
    opened: number;
  }[];
  by_day: {
    date: string;
    sent: number;
    delivered: number;
    opened: number;
  }[];
}

/**
 * Отслеживает событие push уведомления
 */
export async function trackPushEvent(event: PushAnalyticsEvent): Promise<void> {
  try {
    const supabase = createClient();

    // Сохраняем в usage таблицу
    const { error } = await supabase.from('usage').insert({
      user_id: event.user_id,
      operation_type: `push_${event.event_type}`,
      metadata: {
        notification_id: event.notification_id,
        browser_info: event.browser_info,
        timestamp: event.timestamp,
        ...event.metadata,
      },
    });

    if (error) {
      console.error('[Push Analytics] Failed to track event:', error);
    } else {
      console.log(`[Push Analytics] Tracked: push_${event.event_type}`);
    }
  } catch (error) {
    console.error('[Push Analytics] Error tracking event:', error);
  }
}

/**
 * Отслеживает доставку push уведомления
 */
export async function trackPushDelivered(
  userId: string,
  notificationId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackPushEvent({
    notification_id: notificationId,
    user_id: userId,
    event_type: 'delivered',
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Отслеживает открытие push уведомления
 */
export async function trackPushOpened(
  userId: string,
  notificationId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackPushEvent({
    notification_id: notificationId,
    user_id: userId,
    event_type: 'opened',
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Отслеживает закрытие push уведомления
 */
export async function trackPushClosed(
  userId: string,
  notificationId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackPushEvent({
    notification_id: notificationId,
    user_id: userId,
    event_type: 'closed',
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Отслеживает подписку на push уведомления
 */
export async function trackPushSubscribed(
  userId: string,
  browserInfo?: { name: string; version: string; os: string },
  metadata?: Record<string, any>
): Promise<void> {
  await trackPushEvent({
    user_id: userId,
    event_type: 'subscribed',
    browser_info: browserInfo,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Отслеживает отписку от push уведомлений
 */
export async function trackPushUnsubscribed(
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackPushEvent({
    user_id: userId,
    event_type: 'unsubscribed',
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Получает статистику push уведомлений за период
 */
export async function getPushAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<PushAnalyticsStats | null> {
  try {
    const supabase = createClient();

    // Формируем запрос
    let query = supabase
      .from('usage')
      .select('*')
      .in('operation_type', [
        'push_delivered',
        'push_opened',
        'push_closed',
        'push_subscribed',
        'push_unsubscribed',
      ]);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('[Push Analytics] Failed to get analytics:', error);
      return null;
    }

    if (!events || events.length === 0) {
      return {
        total_sent: 0,
        total_delivered: 0,
        total_opened: 0,
        total_closed: 0,
        delivery_rate: 0,
        open_rate: 0,
        ctr: 0,
        by_browser: [],
        by_hour: [],
        by_day: [],
      };
    }

    // Подсчитываем метрики
    const delivered = events.filter((e) => e.operation_type === 'push_delivered').length;
    const opened = events.filter((e) => e.operation_type === 'push_opened').length;
    const closed = events.filter((e) => e.operation_type === 'push_closed').length;

    // Получаем total_sent из push_notifications_history
    const { data: history } = await supabase
      .from('push_notifications_history')
      .select('total_sent');

    const totalSent = history?.reduce((sum, h) => sum + (h.total_sent || 0), 0) || 0;

    // Вычисляем проценты
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const ctr = totalSent > 0 ? (opened / totalSent) * 100 : 0;

    // Статистика по браузерам
    const browserStats = new Map<string, { sent: number; delivered: number; opened: number }>();

    events.forEach((event) => {
      const browserName = event.metadata?.browser_info?.name || 'Unknown';
      const stats = browserStats.get(browserName) || { sent: 0, delivered: 0, opened: 0 };

      if (event.operation_type === 'push_delivered') {
        stats.delivered++;
      } else if (event.operation_type === 'push_opened') {
        stats.opened++;
      }

      browserStats.set(browserName, stats);
    });

    const byBrowser = Array.from(browserStats.entries()).map(([browser, stats]) => ({
      browser,
      sent: stats.sent,
      delivered: stats.delivered,
      opened: stats.opened,
      delivery_rate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
      open_rate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
    }));

    // Статистика по часам
    const hourStats = new Map<number, { sent: number; delivered: number; opened: number }>();

    events.forEach((event) => {
      const hour = new Date(event.created_at).getHours();
      const stats = hourStats.get(hour) || { sent: 0, delivered: 0, opened: 0 };

      if (event.operation_type === 'push_delivered') {
        stats.delivered++;
      } else if (event.operation_type === 'push_opened') {
        stats.opened++;
      }

      hourStats.set(hour, stats);
    });

    const byHour = Array.from(hourStats.entries())
      .map(([hour, stats]) => ({
        hour,
        sent: stats.sent,
        delivered: stats.delivered,
        opened: stats.opened,
      }))
      .sort((a, b) => a.hour - b.hour);

    // Статистика по дням
    const dayStats = new Map<string, { sent: number; delivered: number; opened: number }>();

    events.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      const stats = dayStats.get(date) || { sent: 0, delivered: 0, opened: 0 };

      if (event.operation_type === 'push_delivered') {
        stats.delivered++;
      } else if (event.operation_type === 'push_opened') {
        stats.opened++;
      }

      dayStats.set(date, stats);
    });

    const byDay = Array.from(dayStats.entries())
      .map(([date, stats]) => ({
        date,
        sent: stats.sent,
        delivered: stats.delivered,
        opened: stats.opened,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_sent: totalSent,
      total_delivered: delivered,
      total_opened: opened,
      total_closed: closed,
      delivery_rate: deliveryRate,
      open_rate: openRate,
      ctr,
      by_browser: byBrowser,
      by_hour: byHour,
      by_day: byDay,
    };
  } catch (error) {
    console.error('[Push Analytics] Error getting analytics:', error);
    return null;
  }
}

