"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Counter } from '../../../ui/shadcn-io/counter';
import { Status } from '../../../ui/shadcn-io/status';
import { AnimatedTooltip } from '../../../ui/shadcn-io/animated-tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Badge } from '../../../ui/badge';

const apiUsageData = [
  { month: 'Jan', requests: 4000, tokens: 120000, cost: 12.50 },
  { month: 'Feb', requests: 3000, tokens: 90000, cost: 9.75 },
  { month: 'Mar', requests: 5000, tokens: 150000, cost: 15.25 },
  { month: 'Apr', requests: 4500, tokens: 135000, cost: 13.80 },
  { month: 'May', requests: 6000, tokens: 180000, cost: 18.50 },
  { month: 'Jun', requests: 5500, tokens: 165000, cost: 16.75 },
];

export const APISettingsTab: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [usageStats, setUsageStats] = useState({
    requests: 1247,
    tokens: 45678,
    cost: 12.34
  });

  useEffect(() => {
    // Load saved API key
    const loadApiKey = async () => {
      try {
        const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
        if (!token) return;

        const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings/openai_api_key', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(token).access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.setting?.value) {
            setApiKey(data.setting.value);
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) return;

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'openai_api_key',
          value: apiKey
        })
      });

      if (response.ok) {
        setIsValid(true);
        // Show success animation
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const handleValidate = async () => {
    if (!apiKey) return;
    
    setIsValidating(true);
    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <span className="text-4xl">🔑</span>
          </div>
          <div>
            <ShimmeringText 
              text="OpenAI API Configuration" 
              className="text-2xl font-bold text-white"
              duration={2}
            />
            <p className="text-white/80 mt-2">Manage your OpenAI API key and monitor usage</p>
          </div>
        </div>
      </BackgroundGradient>

      {/* Main Configuration Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Key Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <AnimatedTooltip content="Validate API key">
                    <Button
                      onClick={handleValidate}
                      disabled={!apiKey || isValidating}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30"
                    >
                      {isValidating ? 'Validating...' : 'Validate'}
                    </Button>
                  </AnimatedTooltip>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label className="text-white/80">Auto-refresh usage stats</Label>
              </div>

              <div className="flex gap-2">
                <MagneticButton
                  onClick={handleSave}
                  disabled={!apiKey || !isValid}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30"
                >
                  <span className="mr-2">💾</span>
                  Save Configuration
                </MagneticButton>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <Status status={isValid ? 'online' : 'offline'} />
              <span className="text-white/80">
                {isValid ? 'API Key Valid' : 'API Key Invalid'}
              </span>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Usage Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <Counter
                  number={usageStats.requests}
                  setNumber={(n) => setUsageStats(prev => ({ ...prev, requests: n }))}
                  className="text-2xl font-bold text-blue-400"
                />
                <p className="text-white/80 mt-2">Requests</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <Counter
                  number={usageStats.tokens}
                  setNumber={(n) => setUsageStats(prev => ({ ...prev, tokens: n }))}
                  className="text-2xl font-bold text-green-400"
                />
                <p className="text-white/80 mt-2">Tokens</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">${usageStats.cost}</div>
                <p className="text-white/80 mt-2">Cost</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Usage Chart */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">API Usage Trends</h3>
              <p className="text-white/80">Last 30 days</p>
            </div>
            <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
              📈 +12% this month
            </Badge>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsageData}>
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
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <MagneticButton className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-400/30">
          <span className="mr-2">📊</span>
          View API History
        </MagneticButton>
      </div>
    </div>
  );
};