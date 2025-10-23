/**
 * Advanced PWA Analytics
 * 
 * Расширенная аналитика для PWA:
 * - Retention rate по когортам
 * - Funnel анализ (prompt → install → usage)
 * - Детальная статистика по дням/неделям/месяцам
 * - Экспорт в CSV/JSON
 */

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface CohortData {
  cohort: string; // Дата первого визита
  week0: number; // Retention в неделю 0 (100%)
  week1: number; // Retention в неделю 1
  week2: number; // Retention в неделю 2
  week3: number; // Retention в неделю 3
  week4: number; // Retention в неделю 4
  totalUsers: number;
}

export interface FunnelData {
  stage: string;
  users: number;
  percentage: number;
  dropoff: number;
}

export interface TimeSeriesData {
  date: string;
  installs: number;
  uninstalls: number;
  activeUsers: number;
  standaloneUsage: number;
}

export interface BrowserStats {
  browser: string;
  installs: number;
  conversionRate: number;
  avgTimeToInstall: number; // в минутах
}

export interface AdvancedPWAStats {
  // Общая статистика
  totalInstalls: number;
  totalUninstalls: number;
  activeInstalls: number;
  conversionRate: number;
  
  // Retention
  cohorts: CohortData[];
  overallRetention: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
  
  // Funnel
  funnel: FunnelData[];
  
  // Time series
  timeSeries: TimeSeriesData[];
  
  // Browser breakdown
  browsers: BrowserStats[];
  
  // Engagement
  avgSessionsPerUser: number;
  avgTimeToInstall: number; // в минутах
  installsByDayOfWeek: { day: string; installs: number }[];
  installsByHour: { hour: number; installs: number }[];
}

/**
 * Получить retention rate по когортам
 */
export async function getCohortRetention(
  startDate: string,
  endDate: string
): Promise<CohortData[]> {
  try {
    // Получаем всех пользователей с их первым визитом
    const { data: users, error } = await supabase
      .from('usage')
      .select('user_id, created_at')
      .eq('operation_type', 'pwa_install_accepted')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error || !users) {
      console.error('[Advanced Analytics] Failed to get cohort data:', error);
      return [];
    }

    // Группируем по неделям
    const cohorts = new Map<string, Set<string>>();
    
    users.forEach(user => {
      const weekStart = getWeekStart(new Date(user.created_at));
      if (!cohorts.has(weekStart)) {
        cohorts.set(weekStart, new Set());
      }
      cohorts.get(weekStart)!.add(user.user_id);
    });

    // Вычисляем retention для каждой когорты
    const cohortData: CohortData[] = [];
    
    for (const [cohort, userIds] of cohorts.entries()) {
      const retention = await calculateCohortRetention(cohort, Array.from(userIds));
      cohortData.push({
        cohort,
        week0: 100,
        week1: retention.week1,
        week2: retention.week2,
        week3: retention.week3,
        week4: retention.week4,
        totalUsers: userIds.size,
      });
    }

    return cohortData.sort((a, b) => a.cohort.localeCompare(b.cohort));
  } catch (error) {
    console.error('[Advanced Analytics] Error getting cohort retention:', error);
    return [];
  }
}

/**
 * Вычислить retention для когорты
 */
async function calculateCohortRetention(
  cohortStart: string,
  userIds: string[]
): Promise<{ week1: number; week2: number; week3: number; week4: number }> {
  const cohortDate = new Date(cohortStart);
  
  const weeks = [1, 2, 3, 4];
  const retention: any = {};
  
  for (const week of weeks) {
    const weekStart = new Date(cohortDate);
    weekStart.setDate(weekStart.getDate() + week * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const { data, error } = await supabase
      .from('usage')
      .select('user_id')
      .in('user_id', userIds)
      .eq('operation_type', 'pwa_standalone_usage')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());
    
    if (!error && data) {
      const activeUsers = new Set(data.map(d => d.user_id)).size;
      retention[`week${week}`] = Math.round((activeUsers / userIds.length) * 100);
    } else {
      retention[`week${week}`] = 0;
    }
  }
  
  return retention;
}

/**
 * Получить funnel анализ
 */
export async function getFunnelAnalysis(): Promise<FunnelData[]> {
  try {
    // Получаем количество пользователей на каждом этапе
    const { data, error } = await supabase
      .from('usage')
      .select('operation_type, user_id')
      .in('operation_type', [
        'pwa_install_prompt_shown',
        'pwa_install_accepted',
        'pwa_standalone_usage',
      ]);

    if (error || !data) {
      console.error('[Advanced Analytics] Failed to get funnel data:', error);
      return [];
    }

    // Подсчитываем уникальных пользователей на каждом этапе
    const promptShown = new Set(
      data.filter(d => d.operation_type === 'pwa_install_prompt_shown').map(d => d.user_id)
    ).size;
    
    const installed = new Set(
      data.filter(d => d.operation_type === 'pwa_install_accepted').map(d => d.user_id)
    ).size;
    
    const activeUsers = new Set(
      data.filter(d => d.operation_type === 'pwa_standalone_usage').map(d => d.user_id)
    ).size;

    const funnel: FunnelData[] = [
      {
        stage: 'Показ Install Prompt',
        users: promptShown,
        percentage: 100,
        dropoff: 0,
      },
      {
        stage: 'Установка PWA',
        users: installed,
        percentage: promptShown > 0 ? Math.round((installed / promptShown) * 100) : 0,
        dropoff: promptShown - installed,
      },
      {
        stage: 'Активное использование',
        users: activeUsers,
        percentage: installed > 0 ? Math.round((activeUsers / installed) * 100) : 0,
        dropoff: installed - activeUsers,
      },
    ];

    return funnel;
  } catch (error) {
    console.error('[Advanced Analytics] Error getting funnel analysis:', error);
    return [];
  }
}

/**
 * Получить time series данные
 */
export async function getTimeSeriesData(
  startDate: string,
  endDate: string
): Promise<TimeSeriesData[]> {
  try {
    const { data, error } = await supabase
      .from('usage')
      .select('operation_type, created_at')
      .in('operation_type', [
        'pwa_install_accepted',
        'pwa_uninstall',
        'pwa_standalone_usage',
      ])
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('[Advanced Analytics] Failed to get time series data:', error);
      return [];
    }

    // Группируем по дням
    const dailyData = new Map<string, TimeSeriesData>();
    
    data.forEach(event => {
      const date = event.created_at.split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          installs: 0,
          uninstalls: 0,
          activeUsers: 0,
          standaloneUsage: 0,
        });
      }
      
      const dayData = dailyData.get(date)!;
      
      if (event.operation_type === 'pwa_install_accepted') {
        dayData.installs++;
      } else if (event.operation_type === 'pwa_uninstall') {
        dayData.uninstalls++;
      } else if (event.operation_type === 'pwa_standalone_usage') {
        dayData.standaloneUsage++;
      }
    });

    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('[Advanced Analytics] Error getting time series data:', error);
    return [];
  }
}

/**
 * Получить статистику по браузерам
 */
export async function getBrowserStats(): Promise<BrowserStats[]> {
  // TODO: Implement browser stats from metadata
  return [];
}

/**
 * Экспорт в CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Экспорт в JSON
 */
export function exportToJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper: Получить начало недели
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

