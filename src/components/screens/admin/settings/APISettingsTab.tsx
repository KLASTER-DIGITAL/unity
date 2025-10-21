import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { OpenAISettingsContent } from './openai/OpenAISettingsContent';
import { OpenAIAnalyticsContent } from './openai/OpenAIAnalyticsContent';
import { Key, BarChart3 } from 'lucide-react';

export function APISettingsTab() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Key className="w-6 h-6" />
          OpenAI API
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление API ключом и мониторинг использования
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <OpenAISettingsContent />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <OpenAIAnalyticsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
