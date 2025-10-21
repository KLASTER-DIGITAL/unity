import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { APISettingsTab } from '@/components/screens/admin/settings/APISettingsTab';
import { AISettingsTab } from '@/components/screens/admin/settings/AISettingsTab';
import { PWASettingsTab } from '@/components/screens/admin/settings/PWASettingsTab';
import { PushNotificationsTab } from '@/components/screens/admin/settings/PushNotificationsTab';
import { GeneralSettingsTab } from '@/components/screens/admin/settings/GeneralSettingsTab';
import { SystemSettingsTab } from '@/components/screens/admin/settings/SystemSettingsTab';
import { TelegramSettingsTab } from '@/components/screens/admin/settings/TelegramSettingsTab';
import { LanguagesAndTranslationsTab } from './LanguagesAndTranslationsTab';
import {
  Key,
  Brain,
  MessageCircle,
  Languages,
  Smartphone,
  Bell,
  Settings,
  Monitor,
  Search
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState(activeSubTab || 'openai-api');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageForTranslations, setSelectedLanguageForTranslations] = useState<string | undefined>();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSubTabChange?.(value);
  };

  const tabs = [
    { value: 'openai-api', label: 'OpenAI API', icon: Key, description: 'Настройки OpenAI API' },
    { value: 'ai', label: 'AI', icon: Brain, description: 'Настройки AI моделей' },
    { value: 'telegram', label: 'Telegram', icon: MessageCircle, description: 'Интеграция с Telegram' },
    { value: 'languages-translations', label: 'Языки и переводы', icon: Languages, description: 'Управление языками и переводами' },
    { value: 'pwa', label: 'PWA', icon: Smartphone, description: 'PWA настройки' },
    { value: 'push', label: 'Push', icon: Bell, description: 'Push-уведомления' },
    { value: 'general', label: 'Общие', icon: Settings, description: 'Общие настройки' },
    { value: 'system', label: 'Система', icon: Monitor, description: 'Системные настройки' }
  ];

  const filteredTabs = tabs.filter(tab =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={className}>
      <div className="p-6 lg:p-8 pb-4 max-w-[1400px] mx-auto">
        {/* Заголовок страницы */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки системы
          </h1>
          <p className="text-base text-muted-foreground">
            Управление всеми аспектами системы
          </p>
        </header>

        {/* Поиск по настройкам */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по настройкам"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Навигация по вкладкам */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg bg-muted p-1 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  aria-label={`${tab.label} - ${tab.description}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Контент вкладок */}
          <div className="min-h-[500px]">
            {filteredTabs.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  Нет настроек, соответствующих "{searchQuery}"
                </p>
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                >
                  Очистить поиск
                </Button>
              </div>
            ) : (
              <>
                <TabsContent value="openai-api" className="mt-0">
                  <APISettingsTab />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <AISettingsTab />
                </TabsContent>

                <TabsContent value="telegram" className="mt-0">
                  <TelegramSettingsTab />
                </TabsContent>

                <TabsContent value="languages-translations" className="mt-0">
                  <LanguagesAndTranslationsTab initialLanguage={selectedLanguageForTranslations} />
                </TabsContent>

                <TabsContent value="pwa" className="mt-0">
                  <PWASettingsTab />
                </TabsContent>

                <TabsContent value="push" className="mt-0">
                  <PushNotificationsTab />
                </TabsContent>

                <TabsContent value="general" className="mt-0">
                  <GeneralSettingsTab />
                </TabsContent>

                <TabsContent value="system" className="mt-0">
                  <SystemSettingsTab />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};