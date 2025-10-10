import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493`;

// Получить access token текущего пользователя
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session.access_token;
}

// Получить статистику для админ-панели
export async function getAdminStats() {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch admin stats');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch admin stats');
    }

    return data.stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}

// Получить список всех пользователей
export async function getAdminUsers(page = 1, limit = 50) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch users');
    }

    // Пагинация на клиенте
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = data.users.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total: data.total,
      page,
      limit,
      totalPages: Math.ceil(data.total / limit)
    };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

// Обновить статус подписки пользователя
export async function updateUserSubscription(userId: string, isPremium: boolean) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isPremium,
        subscriptionStatus: isPremium ? 'active' : 'none'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update subscription');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update subscription');
    }

    return data.profile;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

// Удалить пользователя (только супер-админ)
export async function deleteUser(userId: string) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Удаляем профиль
    const profileResponse = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Удаляем записи
    const entriesResponse = await fetch(`${API_BASE_URL}/entries/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.ok || !entriesResponse.ok) {
      throw new Error('Failed to delete user');
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Отправить push-уведомление всем пользователям
export async function sendBroadcastNotification(title: string, message: string) {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // TODO: Реализовать endpoint для отправки push-уведомлений
    console.log('Broadcasting notification:', { title, message });
    
    return {
      success: true,
      sent: 0 // Количество отправленных уведомлений
    };
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    throw error;
  }
}
