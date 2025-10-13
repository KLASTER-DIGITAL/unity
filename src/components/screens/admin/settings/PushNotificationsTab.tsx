"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Counter } from '../../../ui/shadcn-io/counter';
import { Status } from '../../../ui/shadcn-io/status';
import { SparklesCore } from '../../../ui/shadcn-io/sparkles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';

const notificationStats = [
  { month: 'Jan', sent: 1000, delivered: 950, clicked: 190 },
  { month: 'Feb', sent: 1200, delivered: 1140, clicked: 228 },
  { month: 'Mar', sent: 1500, delivered: 1425, clicked: 285 },
  { month: 'Apr', sent: 1800, delivered: 1710, clicked: 342 },
  { month: 'May', sent: 2000, delivered: 1900, clicked: 380 },
  { month: 'Jun', sent: 2200, delivered: 2090, clicked: 418 },
];

const performanceData = [
  { campaign: 'Welcome', sent: 1000, delivered: 950, clicked: 190, rate: 19.0 },
  { campaign: 'Reminder', sent: 800, delivered: 760, clicked: 152, rate: 19.0 },
  { campaign: 'Promotion', sent: 600, delivered: 570, clicked: 114, rate: 19.0 },
  { campaign: 'Update', sent: 400, delivered: 380, clicked: 76, rate: 19.0 },
];

export const PushNotificationsTab: React.FC = () => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    targetAudience: 'All Users',
    scheduled: false
  });
  const [stats, setStats] = useState({
    sent: 1247,
    delivered: 1189,
    clicked: 234,
    clickRate: 19.7
  });
  const [rating, setRating] = useState(4.2);

  const handleSendNotification = () => {
    console.log('Sending notification:', notification);
    // Send notification functionality
  };

  const handleSaveTemplate = () => {
    console.log('Saving template:', notification);
    // Save template functionality
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <span className="text-4xl">🔔</span>
          </div>
          <div>
            <ShimmeringText 
              text="Push Notifications" 
              className="text-2xl font-bold text-white"
              duration={2}
            />
            <p className="text-white/80 mt-2">Manage push notifications and campaigns</p>
          </div>
        </div>
      </BackgroundGradient>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Sent</h3>
          <Counter
            number={stats.sent}
            setNumber={(n) => setStats(prev => ({ ...prev, sent: n }))}
            className="text-3xl font-bold text-blue-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Delivered</h3>
          <Counter
            number={stats.delivered}
            setNumber={(n) => setStats(prev => ({ ...prev, delivered: n }))}
            className="text-3xl font-bold text-green-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Clicked</h3>
          <Counter
            number={stats.clicked}
            setNumber={(n) => setStats(prev => ({ ...prev, clicked: n }))}
            className="text-3xl font-bold text-yellow-400"
          />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Click Rate</h3>
          <div className="text-3xl font-bold text-purple-400">{stats.clickRate}%</div>
        </div>
      </div>

      {/* Create Notification */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">Create New Notification</h3>
            <Badge className="bg-orange-500/20 text-orange-100 border-orange-400/30">
              📝 Draft
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white font-medium">Title</Label>
                <Input
                  placeholder="Notification title"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Message</Label>
                <Textarea
                  placeholder="Notification message"
                  value={notification.message}
                  onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Target Audience</Label>
                <select
                  value={notification.targetAudience}
                  onChange={(e) => setNotification(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                >
                  <option value="All Users">All Users</option>
                  <option value="Active Users">Active Users</option>
                  <option value="Inactive Users">Inactive Users</option>
                  <option value="Premium Users">Premium Users</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={notification.scheduled}
                  onCheckedChange={(checked) => setNotification(prev => ({ ...prev, scheduled: checked }))}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label className="text-white/80">Schedule Notification</Label>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Preview</h4>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="space-y-2">
                  <div className="font-semibold text-white">
                    {notification.title || 'Notification Title'}
                  </div>
                  <div className="text-white/80 text-sm">
                    {notification.message || 'Notification message will appear here...'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <MagneticButton
                  onClick={handleSendNotification}
                  disabled={!notification.title || !notification.message}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30"
                >
                  <span className="mr-2">📤</span>
                  Send Notification
                </MagneticButton>
                <MagneticButton
                  onClick={handleSaveTemplate}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30"
                >
                  <span className="mr-2">📋</span>
                  Save as Template
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Performance */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Notification Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="campaign" 
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
                  <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Engagement Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={notificationStats}>
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
                    dataKey="sent" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicked" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Campaign Rating</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="text-white/80">
              Average rating: <span className="font-semibold text-white">{rating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <SparklesCore
          id="push-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={600}
          className="w-full h-full"
          particleColor="#ffffff"
        />
      </div>
    </div>
  );
};