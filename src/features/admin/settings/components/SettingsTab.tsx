import {
  Brain,
  Key,
  Languages,
  MessageCircle,
  Monitor,
  Search,
  Settings,
  Smartphone,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { AISettingsTab } from '@/components/screens/admin/settings/AISettingsTab';
import { APIServicesTab } from '@/components/screens/admin/settings/APIServicesTab';
import { GeneralSettingsTab } from '@/components/screens/admin/settings/GeneralSettingsTab';
import { SystemSettingsTab } from '@/components/screens/admin/settings/SystemSettingsTab';
import { TelegramSettingsTab } from '@/components/screens/admin/settings/TelegramSettingsTab';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { LanguagesAndTranslationsTab } from './LanguagesAndTranslationsTab';
import { MobileConfigTab } from './mobile-config';

type SettingsTabProps = {
  className?: string;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  className,
  activeSubTab,
  onSubTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(activeSubTab || 'openai-api');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageForTranslations] = useState<string | undefined>();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSubTabChange?.(value);
  };

  const tabs = [
    {
      value: 'api-services',
      label: 'API Services',
      icon: Key,
      description: 'Управление API сервисами',
    },
    { value: 'ai', label: 'AI', icon: Brain, description: 'Настройки AI моделей' },
    {
      value: 'telegram',
      label: 'Telegram',
      icon: MessageCircle,
      description: 'Интеграция с Telegram',
    },
    {
      value: 'languages-translations',
      label: 'Языки и переводы',
      icon: Languages,
      description: 'Управление языками и переводами',
    },
    {
      value: 'mobile',
      label: 'Mobile',
      icon: Smartphone,
      description: 'Настройки React Native приложения',
    },
    { value: 'general', label: 'Общие', icon: Settings, description: 'Общие настройки' },
    { value: 'system', label: 'Система', icon: Monitor, description: 'Системные настройки' },
  ];

  const filteredTabs = tabs.filter(
    (tab) =>
      tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={className}>
      <div className="mx-auto max-w-[1400px] p-6 pb-4 lg:p-8">
        {/* Заголовок страницы */}
        <header className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-foreground">Настройки системы</h1>
          <p className="text-base text-muted-foreground">Управление всеми аспектами системы</p>
        </header>

        {/* Поиск по настройкам */}
        <div className="relative mb-8 max-w-xl">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            autoComplete="off"
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по настройкам"
            type="text"
            value={searchQuery}
          />
        </div>

        {/* Навигация по вкладкам */}
        <Tabs className="w-full" onValueChange={handleTabChange} value={activeTab}>
          <TabsList className="mb-8 inline-flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-lg bg-muted p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  aria-label={`${tab.label} - ${tab.description}`}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  key={tab.value}
                  value={tab.value}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Контент вкладок */}
          <div className="min-h-[500px]">
            {filteredTabs.length === 0 && searchQuery ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-lg text-muted-foreground">
                  Нет настроек, соответствующих "{searchQuery}"
                </p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Очистить поиск
                </Button>
              </div>
            ) : (
              <>
                <TabsContent className="mt-0" value="api-services">
                  <APIServicesTab />
                </TabsContent>

                <TabsContent className="mt-0" value="ai">
                  <AISettingsTab />
                </TabsContent>

                <TabsContent className="mt-0" value="telegram">
                  <TelegramSettingsTab />
                </TabsContent>

                <TabsContent className="mt-0" value="languages-translations">
                  <LanguagesAndTranslationsTab initialLanguage={selectedLanguageForTranslations} />
                </TabsContent>

                <TabsContent className="mt-0" value="mobile">
                  <MobileConfigTab />
                </TabsContent>

                <TabsContent className="mt-0" value="general">
                  <GeneralSettingsTab />
                </TabsContent>

                <TabsContent className="mt-0" value="system">
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
