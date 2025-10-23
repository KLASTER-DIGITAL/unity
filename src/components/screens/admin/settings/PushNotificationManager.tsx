/**
 * Push Notification Manager
 * 
 * Компонент для управления Web Push уведомлениями в админ-панели:
 * - Генерация VAPID keys
 * - Отправка push уведомлений всем пользователям
 * - Просмотр статистики subscriptions
 * - История отправленных уведомлений
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface PushStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSent: number;
  totalDelivered: number;
}

export function PushNotificationManager() {
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');
  const [vapidPrivateKey, setVapidPrivateKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState<PushStats | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('/icon-192.png');

  useEffect(() => {
    loadVapidKeys();
    loadStats();
  }, []);

  /**
   * Загружает VAPID keys из admin_settings
   */
  const loadVapidKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['vapid_public_key', 'vapid_private_key']);

      if (error) {
        console.error('Failed to load VAPID keys:', error);
        return;
      }

      const publicKeyRow = data?.find((row) => row.key === 'vapid_public_key');
      const privateKeyRow = data?.find((row) => row.key === 'vapid_private_key');

      if (publicKeyRow) setVapidPublicKey(publicKeyRow.value);
      if (privateKeyRow) setVapidPrivateKey(privateKeyRow.value);
    } catch (error) {
      console.error('Error loading VAPID keys:', error);
    }
  };

  /**
   * Загружает статистику subscriptions
   */
  const loadStats = async () => {
    try {
      // Total subscriptions
      const { count: totalCount } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      // Active subscriptions
      const { count: activeCount } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total sent from history
      const { data: historyData } = await supabase
        .from('push_notifications_history')
        .select('total_sent, total_delivered');

      const totalSent = historyData?.reduce((sum, row) => sum + (row.total_sent || 0), 0) || 0;
      const totalDelivered = historyData?.reduce((sum, row) => sum + (row.total_delivered || 0), 0) || 0;

      setStats({
        totalSubscriptions: totalCount || 0,
        activeSubscriptions: activeCount || 0,
        totalSent,
        totalDelivered,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  /**
   * Генерирует новые VAPID keys
   */
  const generateVapidKeys = async () => {
    setIsGenerating(true);
    try {
      // В production нужно использовать web-push библиотеку
      // Для демонстрации генерируем случайные ключи
      const publicKey = btoa(crypto.getRandomValues(new Uint8Array(65)).join(','));
      const privateKey = btoa(crypto.getRandomValues(new Uint8Array(32)).join(','));

      // Сохраняем в admin_settings
      await supabase.from('admin_settings').upsert([
        {
          key: 'vapid_public_key',
          value: publicKey,
          category: 'push_notifications',
        },
        {
          key: 'vapid_private_key',
          value: privateKey,
          category: 'push_notifications',
        },
      ], { onConflict: 'key' });

      setVapidPublicKey(publicKey);
      setVapidPrivateKey(privateKey);

      alert('✅ VAPID keys сгенерированы и сохранены!');
    } catch (error) {
      console.error('Error generating VAPID keys:', error);
      alert('❌ Ошибка при генерации VAPID keys');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Отправляет push уведомление всем пользователям
   */
  const sendPushNotification = async () => {
    if (!title || !body) {
      alert('❌ Заполните заголовок и текст уведомления');
      return;
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      alert('❌ Сначала сгенерируйте VAPID keys');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('❌ Не авторизован');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-sender`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_ids: 'all',
            title,
            body,
            icon,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send push notification');
      }

      alert(`✅ Отправлено: ${result.sent} из ${result.total}`);
      
      // Очищаем форму
      setTitle('');
      setBody('');
      
      // Обновляем статистику
      loadStats();
    } catch (error) {
      console.error('Error sending push notification:', error);
      alert(`❌ Ошибка: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* VAPID Keys Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">VAPID Keys</h3>
        
        {!vapidPublicKey || !vapidPrivateKey ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              VAPID keys не настроены. Сгенерируйте их для работы Web Push API.
            </p>
            <button
              onClick={generateVapidKeys}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Генерация...' : 'Сгенерировать VAPID Keys'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Public Key</label>
              <input
                type="text"
                value={vapidPublicKey}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Private Key</label>
              <input
                type="password"
                value={vapidPrivateKey}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 font-mono text-xs"
              />
            </div>
            <button
              onClick={generateVapidKeys}
              disabled={isGenerating}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              Перегенерировать
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Статистика</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubscriptions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Всего подписок</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Активных</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalSent}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Отправлено</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalDelivered}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Доставлено</div>
            </div>
          </div>
        </div>
      )}

      {/* Send Push Notification */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Отправить уведомление</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Новое достижение!"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Текст</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Поздравляем с новым достижением!"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Иконка (URL)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <button
            onClick={sendPushNotification}
            disabled={isSending || !vapidPublicKey}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSending ? 'Отправка...' : 'Отправить всем пользователям'}
          </button>
        </div>
      </div>
    </div>
  );
}

