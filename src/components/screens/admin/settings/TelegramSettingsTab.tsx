import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '../../../../utils/supabase/client';

export function TelegramSettingsTab() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [telegramStats, setTelegramStats] = useState({
    totalUsers: 0,
    telegramUsers: 0,
    lastActivity: null
  });
  const [botInfo, setBotInfo] = useState({
    username: '@diary_bookai_bot',
    domain: 'unity-diary-app.netlify.app',
    tokenMasked: '8297834785:******AQbo'
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadTelegramSettings();
      loadTelegramStats();
    }
  }, [session]);

  const loadTelegramSettings = async () => {
    if (!session) return;
    
    try {
      // Проверяем переменную окружения напрямую через Edge Function
      const response = await fetch(
        `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-auth`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.connected);
        if (data.botUsername) setBotInfo(prev => ({ ...prev, username: data.botUsername }));
        if (data.domain) setBotInfo(prev => ({ ...prev, domain: data.domain }));
      } else {
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('Error loading Telegram settings:', error);
      setIsConfigured(false);
    }
  };

  const loadTelegramStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, telegram_id, created_at, updated_at');

      if (profiles) {
        const telegramUsers = profiles.filter(p => p.telegram_id).length;
        const lastActivity = profiles
          .filter(p => p.telegram_id)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

        setTelegramStats({
          totalUsers: profiles.length,
          telegramUsers,
          lastActivity: lastActivity?.updated_at || null
        });
      }
    } catch (error) {
      console.error('Error loading Telegram stats:', error);
    }
  };

  const testTelegramIntegration = async () => {
    if (!session) {
      toast.error('Необходимо войти в систему');
      return;
    }
    
    setIsLoading(true);
    try {
      // Проверяем переменную окружения напрямую через Edge Function
      const response = await fetch(
        `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-auth`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.connected) {
          toast.success('Интеграция с Telegram активна');
          setIsConfigured(true);
        } else {
          toast.error('Интеграция с Telegram не настроена');
          setIsConfigured(false);
        }
      } else {
        throw new Error('Не удалось проверить интеграцию');
      }
    } catch (error) {
      console.error('Error testing Telegram integration:', error);
      toast.error('Ошибка тестирования интеграции');
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Настройки Telegram</h2>

      {/* Статус интеграции */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Статус интеграции</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isConfigured ? '#28a745' : '#dc3545'
          }} />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {isConfigured ? 'Интеграция активна' : 'Требуется настройка'}
          </span>
        </div>
      </div>

      {/* Статистика пользователей */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Статистика пользователей</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{telegramStats.totalUsers}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Всего пользователей</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{telegramStats.telegramUsers}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Через Telegram</div>
          </div>
        </div>
        {telegramStats.lastActivity && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Последняя активность: {new Date(telegramStats.lastActivity).toLocaleString('ru-RU')}
          </div>
        )}
      </div>

      {/* Настройки бота */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Настройки бота</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Bot Username
          </label>
          <input
            type="text"
            value={botInfo.username}
            disabled
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Bot Token (замаскирован)
          </label>
          <input
            type="text"
            value={botInfo.tokenMasked}
            disabled
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Домен приложения
          </label>
          <input
            type="text"
            value={botInfo.domain}
            disabled
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>

        <button
          onClick={testTelegramIntegration}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Проверка...' : 'Проверить интеграцию'}
        </button>
      </div>

      <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Инструкции по настройке</h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Создайте бота в Telegram</strong><br />
            Используйте @BotFather для создания нового бота
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Получите токен бота</strong><br />
            Скопируйте токен из сообщения BotFather
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Настройте домены</strong><br />
            Добавьте ваш домен в настройки бота через BotFather
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Добавьте токен в переменные окружения Supabase</strong><br />
            В Dashboard → Edge Functions добавьте TELEGRAM_BOT_TOKEN
          </li>
        </ol>
      </div>
    </div>
  );
}
