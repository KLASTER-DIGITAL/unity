"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';

interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
}

interface Translation {
  key: string;
  language: string;
  value: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const LanguagesTab: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([
    { code: 'ru', name: 'Русский', native_name: 'Русский', flag: '🇷🇺', is_active: true },
    { code: 'en', name: 'Английский', native_name: 'English', flag: '🇺🇸', is_active: true },
    { code: 'es', name: 'Испанский', native_name: 'Español', flag: '🇪🇸', is_active: true },
    { code: 'de', name: 'Немецкий', native_name: 'Deutsch', flag: '🇩🇪', is_active: false },
    { code: 'fr', name: 'Французский', native_name: 'Français', flag: '🇫🇷', is_active: false },
    { code: 'zh', name: 'Китайский', native_name: '中文', flag: '🇨🇳', is_active: false },
    { code: 'ja', name: 'Японский', native_name: '日本語', flag: '🇯🇵', is_active: false },
    { code: 'ka', name: 'Грузинский', native_name: 'ქართული', flag: '🇬🇪', is_active: true },
  ]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ru');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/translations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || []);
        toast.success('Переводы успешно загружены! 📚');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка загрузки переводов');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation);
    setEditValue(translation.value);
  };

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;

    if (!editValue.trim()) {
      toast.error('Введите текст перевода');
      return;
    }

    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: editingTranslation.key,
          language: editingTranslation.language,
          value: editValue
        })
      });

      if (response.ok) {
        setTranslations(prev =>
          prev.map(t =>
            t.key === editingTranslation.key && t.language === editingTranslation.language
              ? { ...t, value: editValue }
              : t
          )
        );
        setEditingTranslation(null);
        setEditValue('');
        toast.success('Перевод успешно сохранен! 🌍');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка сохранения перевода');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const getTranslationProgress = (languageCode: string) => {
    const totalKeys = 50;
    const translatedKeys = translations.filter(t => t.language === languageCode).length;
    return Math.round((translatedKeys / totalKeys) * 100);
  };

  const getLanguageData = () => {
    return languages.map((lang, index) => ({
      name: lang.name,
      value: getTranslationProgress(lang.code),
      color: COLORS[index % COLORS.length]
    }));
  };

  const getBarChartData = () => {
    return languages.map(lang => ({
      language: lang.code.toUpperCase(),
      progress: getTranslationProgress(lang.code),
      name: lang.name
    }));
  };

  return (
    <div className="admin-space-y-10">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          🌍
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Управление языками
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Управление переводами и локализацией приложения
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded-full admin-text-xs admin-font-medium">
            🌐 Мультиязычность
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            📊 Аналитика
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Основная панель управления */}
        <div className="lg:admin-col-span-2 admin-space-y-8">
          {/* Карточки языков */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                🌍 Активные языки
              </h3>
              <p className="admin-card-description">
                Управление поддерживаемыми языками приложения
              </p>
            </div>
            <div className="admin-card-content">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-8">
                {languages.map((language) => (
                  <div key={language.code} className="admin-card admin-border admin-border-gray-200 admin-shadow-sm hover:admin-shadow-md admin-transition-shadow">
                    <div className="admin-p-8">
                      <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
                        <div className="admin-flex admin-items-center admin-gap-4">
                          <div className="admin-text-4xl" aria-hidden="true">{language.flag}</div>
                          <div>
                            <div className="admin-font-semibold admin-text-gray-900 admin-text-lg">{language.name}</div>
                            <div className="admin-text-gray-600 admin-text-sm">{language.native_name}</div>
                          </div>
                        </div>
                        <div className="admin-flex admin-flex-col admin-items-end admin-gap-2">
                          <div className={`admin-w-3 admin-h-3 admin-rounded-full ${language.is_active ? 'admin-bg-admin-success' : 'admin-bg-admin-gray-400'}`} aria-hidden="true"></div>
                          <div className={`admin-px-2 admin-py-1 admin-rounded admin-text-xs admin-font-medium ${language.is_active ? 'admin-bg-admin-success-lighter admin-text-admin-success' : 'admin-bg-admin-gray-100 admin-text-admin-gray-600'}`}>
                            {language.is_active ? "Активен" : "Неактивен"}
                          </div>
                        </div>
                      </div>

                      <div className="admin-space-y-3">
                        <div className="admin-flex admin-justify-between admin-text-sm">
                          <span className="admin-text-gray-600">Прогресс переводов</span>
                          <span className="admin-font-medium admin-text-gray-900">{getTranslationProgress(language.code)}%</span>
                        </div>
                        <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2">
                          <div
                            className="admin-bg-admin-primary admin-h-2 admin-rounded-full admin-transition-all"
                            style={{ width: `${getTranslationProgress(language.code)}%` }}
                            aria-label={`Прогресс переводов: ${getTranslationProgress(language.code)}%`}
                          ></div>
                        </div>
                        <div className="admin-flex admin-gap-2">
                          <button
                            onClick={() => setSelectedLanguage(language.code)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            title="Автоперевод"
                            aria-label={`Запустить автоперевод для языка ${language.name}`}
                          >
                            Автоперевод
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Визуализация и статистика */}
        <div className="admin-space-y-6">
          {/* Круговая диаграмма прогресса */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📊 Прогресс переводов
              </h3>
            </div>
            <div className="admin-card-content">
              <SimpleChart
                data={getLanguageData()}
                dataKey="value"
                xAxisKey="name"
                title="Прогресс переводов по языкам"
                type="pie"
              />
            </div>
          </div>

          {/* Статистика переводов */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📈 Статистика
              </h3>
            </div>
            <div className="admin-card-content admin-space-y-4">
              <div className="admin-grid admin-grid-cols-2 admin-gap-4">
                <div className="admin-p-4 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-primary-light">
                  <div className="admin-text-3xl admin-font-semibold admin-text-admin-primary admin-mb-1">{languages.length}</div>
                  <div className="admin-text-gray-600 admin-text-sm">Всего языков</div>
                </div>
                <div className="admin-p-4 admin-bg-admin-success-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-success-light">
                  <div className="admin-text-3xl admin-font-semibold admin-text-admin-success admin-mb-1">
                    {languages.filter(l => l.is_active).length}
                  </div>
                  <div className="admin-text-gray-600 admin-text-sm">Активных</div>
                </div>
                <div className="admin-p-4 admin-bg-admin-warning-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-warning-light">
                  <div className="admin-text-3xl admin-font-semibold admin-text-admin-warning admin-mb-1">{translations.length}</div>
                  <div className="admin-text-gray-600 admin-text-sm">Переводов</div>
                </div>
                <div className="admin-p-4 admin-bg-admin-secondary-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-secondary-light">
                  <div className="admin-text-3xl admin-font-semibold admin-text-admin-secondary admin-mb-1">
                    {Math.round(translations.length / languages.length)}
                  </div>
                  <div className="admin-text-gray-600 admin-text-sm">На язык</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Редактор переводов */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
            📝 Редактирование переводов
          </h3>
          <p className="admin-card-description">
            Редактирование текстов для языка: {languages.find(l => l.code === selectedLanguage)?.name}
          </p>
        </div>
        <div className="admin-card-content">
          <div className="admin-space-y-4 admin-max-h-96 admin-overflow-y-auto">
            {translations
              .filter(t => t.language === selectedLanguage)
              .slice(0, 15)
              .map((translation, index) => (
                <div key={index} className="admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200 hover:admin-bg-gray-100 admin-transition-colors">
                  <div className="admin-flex admin-items-start admin-justify-between admin-mb-3">
                    <div className="admin-flex-1">
                      <div className="admin-font-medium admin-text-gray-900 admin-text-sm admin-mb-1">{translation.key}</div>
                      <div className="admin-text-gray-600 admin-text-xs">Ключ перевода</div>
                    </div>
                    <div className="admin-px-2 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded admin-text-xs admin-font-medium">
                      {translation.language.toUpperCase()}
                    </div>
                  </div>

                  {editingTranslation?.key === translation.key && editingTranslation?.language === translation.language ? (
                    <div className="admin-space-y-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="admin-input"
                      />
                      <div className="admin-flex admin-gap-2">
                        <button onClick={handleSaveTranslation} className="admin-btn admin-btn-success admin-btn-sm">
                          💾 Сохранить
                        </button>
                        <button
                          onClick={() => {
                            setEditingTranslation(null);
                            setEditValue('');
                          }}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                        >
                          ❌ Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-flex admin-items-center admin-justify-between">
                      <span className="admin-text-gray-900 admin-flex-1 admin-mr-4">{translation.value}</span>
                      <button
                        onClick={() => handleEditTranslation(translation)}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        title="Редактировать перевод"
                        aria-label={`Редактировать перевод для ключа ${translation.key}`}
                      >
                        ✏️ Редактировать
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Действия и кнопки */}
      <div className="admin-flex admin-justify-center admin-gap-4">
        <button
          onClick={() => {
            toast.info('Функция автоперевода в разработке 🤖');
          }}
          className="admin-btn admin-btn-success admin-font-medium"
        >
          <span className="mr-2">🤖</span>
          Автоперевод AI
        </button>
        <button
          onClick={() => {
            toast.info('Функция экспорта отчетов в разработке 📊');
          }}
          className="admin-btn admin-btn-primary admin-font-medium"
        >
          <span className="mr-2">📊</span>
          Экспорт отчетов
        </button>
        <button
          onClick={loadTranslations}
          disabled={isLoading}
          className="admin-btn admin-btn-outline admin-font-medium"
        >
          {isLoading ? (
            <div className="admin-flex admin-items-center admin-gap-2">
              <div className="admin-spinner" />
              Загружаю...
            </div>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Обновить переводы
            </>
          )}
        </button>
      </div>
    </div>
  );
};