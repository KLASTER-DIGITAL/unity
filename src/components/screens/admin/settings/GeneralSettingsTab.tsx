"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Status } from '../../../ui/shadcn-io/status';
import { AnimatedTooltip } from '../../../ui/shadcn-io/animated-tooltip';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';

export const GeneralSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: 'Unity Diary',
    appUrl: 'https://unity-diary-app.netlify.app',
    supportEmail: 'support@unity-diary.com',
    defaultLanguage: 'English',
    allowRegistration: true,
    maintenanceMode: false,
    maxEntriesPerDay: 10,
    premiumPrice: 9.99
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Set loaded settings
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      appName: 'Unity Diary',
      appUrl: 'https://unity-diary-app.netlify.app',
      supportEmail: 'support@unity-diary.com',
      defaultLanguage: 'English',
      allowRegistration: true,
      maintenanceMode: false,
      maxEntriesPerDay: 10,
      premiumPrice: 9.99
    });
    setHasChanges(true);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <span className="text-4xl">⚙️</span>
          </div>
          <div>
            <ShimmeringText 
              text="General Settings" 
              className="text-2xl font-bold text-white"
              duration={2}
            />
            <p className="text-white/80 mt-2">Configure application-wide settings</p>
          </div>
        </div>
      </BackgroundGradient>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-2">App Name</h3>
          <div className="text-2xl font-bold text-blue-400">{settings.appName}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-2">Default Language</h3>
          <div className="text-2xl font-bold text-green-400">{settings.defaultLanguage}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-2">Registration</h3>
          <Status status={settings.allowRegistration ? 'online' : 'offline'} />
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">Application Settings</h3>
            <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30">
              🔧 Core Settings
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Application Name</Label>
                <Input
                  value={settings.appName}
                  onChange={(e) => handleSettingChange('appName', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Application URL</Label>
                <Input
                  value={settings.appUrl}
                  onChange={(e) => handleSettingChange('appUrl', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Support Email</Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Default Language</Label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                >
                  <option value="English">English</option>
                  <option value="Russian">Russian</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Georgian">Georgian</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => handleSettingChange('allowRegistration', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label className="text-white/80">Allow User Registration</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  className="data-[state=checked]:bg-red-500"
                />
                <Label className="text-white/80">Maintenance Mode</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Max Entries Per Day</Label>
                <Input
                  type="number"
                  value={settings.maxEntriesPerDay}
                  onChange={(e) => handleSettingChange('maxEntriesPerDay', parseInt(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Premium Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.premiumPrice}
                  onChange={(e) => handleSettingChange('premiumPrice', parseFloat(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Advanced Configuration</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white font-medium">Custom CSS</Label>
              <Textarea
                placeholder="Enter custom CSS rules..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">Environment Variables</Label>
              <Textarea
                placeholder="KEY=VALUE&#10;API_URL=https://api.example.com&#10;DEBUG=true"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px] font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <MagneticButton
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30 disabled:opacity-50"
        >
          <span className="mr-2">💾</span>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </MagneticButton>
        
        <MagneticButton
          onClick={handleReset}
          className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 border-orange-400/30"
        >
          <span className="mr-2">🔄</span>
          Reset to Defaults
        </MagneticButton>
      </div>

      {/* Advanced Actions */}
      <div className="flex justify-center">
        <AnimatedTooltip content="Access advanced configuration options">
          <MagneticButton className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-400/30">
            <span className="mr-2">🔧</span>
            Advanced Settings
          </MagneticButton>
        </AnimatedTooltip>
      </div>
    </div>
  );
};