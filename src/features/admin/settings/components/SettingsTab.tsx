"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { APISettingsTab } from '@/components/screens/admin/settings/APISettingsTab';
import { LanguagesTab } from '@/components/screens/admin/settings/LanguagesTab';
import { PWASettingsTab } from '@/components/screens/admin/settings/PWASettingsTab';
import { PushNotificationsTab } from '@/components/screens/admin/settings/PushNotificationsTab';
import { GeneralSettingsTab } from '@/components/screens/admin/settings/GeneralSettingsTab';
import { SystemSettingsTab } from '@/components/screens/admin/settings/SystemSettingsTab';
import { TelegramSettingsTab } from '@/components/screens/admin/settings/TelegramSettingsTab';

interface SettingsTabProps {
  className?: string;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  className,
  activeSubTab,
  onSubTabChange
}) => {
  const [activeTab, setActiveTab] = useState(activeSubTab || 'api');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSubTabChange?.(value);
  };

  const tabs = [
    { value: 'api', label: 'API', icon: '🔑', description: 'Управление API ключами' },
    { value: 'telegram', label: 'Telegram', icon: '📱', description: 'Интеграция с Telegram' },
    { value: 'languages', label: 'Языки', icon: '🌍', description: 'Настройки языков' },
    { value: 'pwa', label: 'PWA', icon: '📱', description: 'PWA настройки' },
    { value: 'push', label: 'Push', icon: '🔔', description: 'Push-уведомления' },
    { value: 'general', label: 'Общие', icon: '⚙️', description: 'Общие настройки' },
    { value: 'system', label: 'Система', icon: '🖥️', description: 'Системные настройки' }
  ];

  const filteredTabs = tabs.filter(tab =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`admin-panel ${className}`}>
      <div className="admin-p-6 lg:admin-p-8 admin-pb-4 admin-max-w-[1400px] admin-mx-auto">
        {/* Заголовок страницы */}
        <header className="admin-mb-10">
          <h1 className="admin-text-4xl admin-font-bold admin-text-gray-900 admin-mb-3">
            Настройки системы
          </h1>
          <p className="admin-text-lg admin-text-gray-600">
            Управление всеми аспектами системы
          </p>
        </header>

        {/* Поиск по настройкам */}
        <div className="admin-search-container admin-mb-10 admin-max-w-xl">
          <svg
            className="admin-search-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Поиск настроек..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input admin-text-base"
            aria-label="Поиск по настройкам"
          />
        </div>

        {/* Навигация по вкладкам */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <nav className="admin-mb-10" aria-label="Навигация по настройкам">
            <TabsList className="admin-flex admin-flex-wrap admin-gap-3 admin-bg-white admin-border admin-border-gray-200 admin-p-2 admin-rounded-xl admin-shadow-sm">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="admin-flex admin-items-center admin-gap-3 admin-px-6 admin-py-4 admin-rounded-lg admin-font-medium admin-text-base admin-transition-all admin-duration-200 admin-text-gray-700 hover:admin-text-gray-900 hover:admin-bg-gray-50 focus-visible:admin-ring-2 focus-visible:admin-ring-admin-primary focus-visible:admin-ring-offset-2 data-[state=active]:admin-bg-admin-primary data-[state=active]:admin-text-white data-[state=active]:admin-shadow-md"
                  aria-label={`${tab.label} - ${tab.description}`}
                >
                  <span className="admin-text-xl" aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </nav>

          {/* Контент вкладок */}
          <main className="min-h-[500px]">
            {filteredTabs.length === 0 && searchQuery ? (
              <div className="admin-text-center admin-py-12">
                <p className="admin-text-gray-500 admin-text-lg admin-mb-2">
                  Нет настроек, соответствующих "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="admin-btn admin-btn-outline"
                >
                  Очистить поиск
                </button>
              </div>
            ) : (
              <>
                <TabsContent value="api">
                  <APISettingsTab />
                </TabsContent>

                <TabsContent value="telegram">
                  <TelegramSettingsTab />
                </TabsContent>

                <TabsContent value="languages">
                  <LanguagesTab />
                </TabsContent>

                <TabsContent value="pwa">
                  <PWASettingsTab />
                </TabsContent>

                <TabsContent value="push">
                  <PushNotificationsTab />
                </TabsContent>

                <TabsContent value="general">
                  <GeneralSettingsTab />
                </TabsContent>

                <TabsContent value="system">
                  <SystemSettingsTab />
                </TabsContent>
              </>
            )}
          </main>
        </Tabs>
      </div>
    </div>
  );
};