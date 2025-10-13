"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Counter } from '../../../ui/shadcn-io/counter';
import { Status } from '../../../ui/shadcn-io/status';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Badge } from '../../../ui/badge';

const installationData = [
  { month: 'Jan', installations: 120, activeUsers: 95 },
  { month: 'Feb', installations: 180, activeUsers: 140 },
  { month: 'Mar', installations: 250, activeUsers: 200 },
  { month: 'Apr', installations: 320, activeUsers: 260 },
  { month: 'May', installations: 400, activeUsers: 320 },
  { month: 'Jun', installations: 480, activeUsers: 380 },
];

const platformData = [
  { name: 'iOS', value: 45, color: '#007AFF' },
  { name: 'Android', value: 35, color: '#34C759' },
  { name: 'Desktop', value: 20, color: '#FF9500' },
];

export const PWASettingsTab: React.FC = () => {
  const [manifest, setManifest] = useState({
    appName: 'Unity Diary',
    shortName: 'Diary',
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    displayMode: 'standalone',
    serviceWorkerActive: true
  });
  const [stats, setStats] = useState({
    installations: 1247,
    activeUsers: 892,
    retentionRate: 78
  });

  const handleSaveManifest = () => {
    console.log('Saving manifest:', manifest);
    // Save manifest functionality
  };

  const handleRegenerateIcons = () => {
    console.log('Regenerating icons...');
    // Regenerate icons functionality
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <span className="text-4xl">📱</span>
          </div>
          <div>
            <ShimmeringText 
              text="PWA Configuration" 
              className="text-2xl font-bold text-white"
              duration={2}
            />
            <p className="text-white/80 mt-2">Manage Progressive Web App settings</p>
          </div>
        </div>
      </BackgroundGradient>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Installations</h3>
          <Counter
            number={stats.installations}
            setNumber={(n) => setStats(prev => ({ ...prev, installations: n }))}
            className="text-4xl font-bold text-blue-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Active Users</h3>
          <Counter
            number={stats.activeUsers}
            setNumber={(n) => setStats(prev => ({ ...prev, activeUsers: n }))}
            className="text-4xl font-bold text-green-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Retention Rate</h3>
          <div className="text-4xl font-bold text-yellow-400">{stats.retentionRate}%</div>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manifest Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Manifest Settings</h3>
              <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                📄 Web App Manifest
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">App Name</Label>
                <Input
                  value={manifest.appName}
                  onChange={(e) => setManifest(prev => ({ ...prev, appName: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Short Name</Label>
                <Input
                  value={manifest.shortName}
                  onChange={(e) => setManifest(prev => ({ ...prev, shortName: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium">Theme Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-white/20 cursor-pointer"
                      style={{ backgroundColor: manifest.themeColor }}
                      onClick={() => {
                        const newColor = prompt('Enter color:', manifest.themeColor);
                        if (newColor) setManifest(prev => ({ ...prev, themeColor: newColor }));
                      }}
                    />
                    <Input
                      value={manifest.themeColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-medium">Background Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-white/20 cursor-pointer"
                      style={{ backgroundColor: manifest.backgroundColor }}
                      onClick={() => {
                        const newColor = prompt('Enter color:', manifest.backgroundColor);
                        if (newColor) setManifest(prev => ({ ...prev, backgroundColor: newColor }));
                      }}
                    />
                    <Input
                      value={manifest.backgroundColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Display Mode</Label>
                <select
                  value={manifest.displayMode}
                  onChange={(e) => setManifest(prev => ({ ...prev, displayMode: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                >
                  <option value="standalone">Standalone</option>
                  <option value="fullscreen">Fullscreen</option>
                  <option value="minimal-ui">Minimal UI</option>
                  <option value="browser">Browser</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={manifest.serviceWorkerActive}
                  onCheckedChange={(checked) => setManifest(prev => ({ ...prev, serviceWorkerActive: checked }))}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label className="text-white/80">Service Worker Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <MagneticButton
                onClick={handleSaveManifest}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30"
              >
                <span className="mr-2">💾</span>
                Save Manifest
              </MagneticButton>
              <MagneticButton
                onClick={handleRegenerateIcons}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30"
              >
                <span className="mr-2">🔄</span>
                Regenerate Icons
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Device Preview */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Live Preview</h3>
            <div className="flex justify-center">
              <div className="w-64 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl border-4 border-white/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{manifest.appName}</div>
                  <div className="text-sm opacity-80">{manifest.shortName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Installation Trends */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Installation Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={installationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="installations" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Platform Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};