import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import type { AdminStats } from "./types";
import { INITIAL_STATS } from "./constants";

/**
 * AdminDashboard - Utility functions
 */

// Load admin statistics from server
export async function loadAdminStats(t: (key: string, fallback: string) => string): Promise<AdminStats> {
  try {
    // Получаем токен авторизации
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No session');
    }

    // Загружаем реальные данные с сервера (admin-stats-api microservice)
    const response = await fetch(
      `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-stats-api`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load stats');
    }

    const data = await response.json();
    // Микросервис возвращает данные напрямую в корне объекта
    const { success, ...statsData } = data;

    console.log('Admin stats loaded:', statsData);
    return statsData as AdminStats;
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.error(t('error_loading_stats', 'Ошибка загрузки статистики'));
    
    // Fallback к пустым данным при ошибке
    return INITIAL_STATS;
  }
}

// Check if user is super admin
export function isSuperAdmin(userData?: any): boolean {
  return userData?.profile?.role === 'super_admin' || userData?.role === 'super_admin';
}

