"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Counter } from '../../../ui/shadcn-io/counter';
import { Status } from '../../../ui/shadcn-io/status';
import { SparklesCore } from '../../../ui/shadcn-io/sparkles';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

const languageData = [
  { name: 'English', value: 100, color: '#3b82f6' },
  { name: 'Russian', value: 85, color: '#10b981' },
  { name: 'Spanish', value: 70, color: '#f59e0b' },
  { name: 'French', value: 60, color: '#ef4444' },
  { name: 'German', value: 45, color: '#8b5cf6' },
  { name: 'Georgian', value: 20, color: '#06b6d4' },
];

const usageData = [
  { language: 'English', users: 1200, percentage: 45 },
  { language: 'Russian', users: 800, percentage: 30 },
  { language: 'Spanish', users: 400, percentage: 15 },
  { language: 'French', users: 200, percentage: 7 },
  { language: 'German', users: 100, percentage: 3 },
];

export const LanguagesTab: React.FC = () => {
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [totalLanguages, setTotalLanguages] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLanguages();
    loadTranslations();
  }, []);

  const loadLanguages = async () => {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) return;

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/languages', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
        setTotalLanguages(data.languages?.length || 0);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadTranslations = async () => {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) return;

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/translations', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(token).access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || []);
        setTotalKeys(data.translations?.length || 0);
        
        // Calculate average progress
        const totalProgress = languageData.reduce((sum, lang) => sum + lang.value, 0);
        setAvgProgress(Math.round(totalProgress / languageData.length));
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const handleAddLanguage = () => {
    // Add language functionality
    console.log('Adding new language...');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <span className="text-4xl">🌐</span>
          </div>
          <div>
            <ShimmeringText 
              text="Language Management" 
              className="text-2xl font-bold text-white"
              duration={2}
            />
            <p className="text-white/80 mt-2">Manage translations and languages</p>
          </div>
        </div>
      </BackgroundGradient>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Total Languages</h3>
          <Counter
            number={totalLanguages}
            setNumber={setTotalLanguages}
            className="text-4xl font-bold text-blue-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Translation Keys</h3>
          <Counter
            number={totalKeys}
            setNumber={setTotalKeys}
            className="text-4xl font-bold text-green-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Avg. Progress</h3>
          <div className="text-4xl font-bold text-yellow-400">{avgProgress}%</div>
          <Progress value={avgProgress} className="mt-4" />
        </div>
      </div>

      {/* Add Language Button */}
      <div className="flex justify-center">
        <MagneticButton
          onClick={handleAddLanguage}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30"
        >
          <span className="mr-2">➕</span>
          Add Language
        </MagneticButton>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Translation Progress Pie Chart */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Translation Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
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

        {/* Language Usage Bar Chart */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Language Usage</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="language" 
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
                  <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languageData.map((lang, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{lang.name}</h4>
                <Status status={lang.value > 80 ? 'online' : lang.value > 50 ? 'degraded' : 'offline'} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Progress</span>
                  <span className="text-white">{lang.value}%</span>
                </div>
                <Progress value={lang.value} className="h-2" />
              </div>

              <div className="flex gap-2">
                <MagneticButton className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30 text-sm">
                  Edit
                </MagneticButton>
                <MagneticButton className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-400/30 text-sm">
                  Auto-translate
                </MagneticButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <SparklesCore
          id="languages-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={800}
          className="w-full h-full"
          particleColor="#ffffff"
        />
      </div>
    </div>
  );
};