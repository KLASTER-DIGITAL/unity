import { useState } from "react";
import { Smartphone, Bell, Globe, Database, Shield, Zap, Key, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/shadcn-io/tabs";
import { PWASettingsTab } from "./settings/PWASettingsTab";
import { PushNotificationsTab } from "./settings/PushNotificationsTab";
import { GeneralSettingsTab } from "./settings/GeneralSettingsTab";
import { SystemSettingsTab } from "./settings/SystemSettingsTab";
import { APISettingsTab } from "./APISettingsTab";
import { LanguagesTab } from "./LanguagesTab";

interface SettingsTabProps {
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export function SettingsTab({ activeSubTab = "pwa", onSubTabChange }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="!text-[17px]">Настройки приложения</CardTitle>
          <CardDescription className="!text-[13px] !font-normal">Управление конфигурацией и параметрами приложения</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={onSubTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-muted overflow-x-auto">
              <TabsTrigger value="api" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Key className="w-3 h-3" />
                <span className="hidden lg:inline">API</span>
              </TabsTrigger>
              <TabsTrigger value="languages" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Languages className="w-3 h-3" />
                <span className="hidden lg:inline">Языки</span>
              </TabsTrigger>
              <TabsTrigger value="pwa" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Smartphone className="w-3 h-3" />
                <span className="hidden lg:inline">PWA</span>
              </TabsTrigger>
              <TabsTrigger value="push" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Bell className="w-3 h-3" />
                <span className="hidden lg:inline">Push</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Globe className="w-3 h-3" />
                <span className="hidden lg:inline">Общие</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1 !text-[12px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Database className="w-3 h-3" />
                <span className="hidden lg:inline">Система</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="mt-6">
              <APISettingsTab />
            </TabsContent>

            <TabsContent value="languages" className="mt-6">
              <LanguagesTab />
            </TabsContent>

            <TabsContent value="pwa" className="mt-6">
              <PWASettingsTab />
            </TabsContent>

            <TabsContent value="push" className="mt-6">
              <PushNotificationsTab />
            </TabsContent>

            <TabsContent value="general" className="mt-6">
              <GeneralSettingsTab />
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <SystemSettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
