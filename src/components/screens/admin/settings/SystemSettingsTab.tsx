"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundGradient } from '../../../ui/shadcn-io/background-gradient';
import { ShimmeringText } from '../../../ui/shadcn-io/shimmering-text';
import { MagneticButton } from '../../../ui/shadcn-io/magnetic-button';
import { Counter } from '../../../ui/shadcn-io/counter';
import { Status } from '../../../ui/shadcn-io/status';
import { Terminal } from '../../../ui/shadcn-io/terminal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

const systemMetrics = [
  { time: '00:00', cpu: 25, memory: 45, disk: 20 },
  { time: '04:00', cpu: 30, memory: 50, disk: 22 },
  { time: '08:00', cpu: 45, memory: 60, disk: 25 },
  { time: '12:00', cpu: 55, memory: 65, disk: 28 },
  { time: '16:00', cpu: 40, memory: 55, disk: 26 },
  { time: '20:00', cpu: 35, memory: 50, disk: 24 },
];

const apiCalls = [
  { endpoint: '/api/users', calls: 1200, avgTime: 45 },
  { endpoint: '/api/entries', calls: 800, avgTime: 60 },
  { endpoint: '/api/stats', calls: 400, avgTime: 30 },
  { endpoint: '/api/auth', calls: 200, avgTime: 25 },
];

const storageData = [
  { name: 'Database', value: 45, color: '#3b82f6' },
  { name: 'Files', value: 30, color: '#10b981' },
  { name: 'Logs', value: 15, color: '#f59e0b' },
  { name: 'Cache', value: 10, color: '#ef4444' },
];

const logEntries = [
  { timestamp: '2024-01-15 10:30:15', level: 'INFO', message: 'User authentication successful' },
  { timestamp: '2024-01-15 10:30:12', level: 'WARN', message: 'High memory usage detected' },
  { timestamp: '2024-01-15 10:30:08', level: 'ERROR', message: 'Database connection timeout' },
  { timestamp: '2024-01-15 10:30:05', level: 'INFO', message: 'API request processed' },
  { timestamp: '2024-01-15 10:30:02', level: 'INFO', message: 'System health check passed' },
];

export const SystemSettingsTab: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 29.3,
    memoryUsage: 53.5,
    diskUsage: 20.4,
    uptime: 973
  });
  const [logs, setLogs] = useState(logEntries);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setSystemStats(prev => ({
          cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
          diskUsage: Math.max(0, Math.min(100, prev.diskUsage + (Math.random() - 0.5) * 2)),
          uptime: prev.uptime + 1
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const handleSystemAction = (action: string) => {
    console.log(`Executing system action: ${action}`);
    // Add new log entry
    const newLog = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level: 'INFO',
      message: `System action executed: ${action}`
    };
    setLogs(prev => [newLog, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BackgroundGradient className="rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-4xl">🖥️</span>
            </div>
            <div>
              <ShimmeringText 
                text="System Monitoring" 
                className="text-2xl font-bold text-white"
                duration={2}
              />
              <p className="text-white/80 mt-2">Monitor system performance and health</p>
            </div>
          </div>
          
          <MagneticButton
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`${isMonitoring ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border-red-400/30' : 'bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-400/30'}`}
          >
            <span className="mr-2">{isMonitoring ? '⏸️' : '▶️'}</span>
            {isMonitoring ? 'Pause' : 'Resume'}
          </MagneticButton>
        </div>
      </BackgroundGradient>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">CPU Usage</h3>
          <div className="text-3xl font-bold text-blue-400 mb-2">{systemStats.cpuUsage.toFixed(1)}%</div>
          <Progress value={systemStats.cpuUsage} className="h-2" />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Memory</h3>
          <div className="text-3xl font-bold text-green-400 mb-2">{systemStats.memoryUsage.toFixed(1)}%</div>
          <Progress value={systemStats.memoryUsage} className="h-2" />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Disk Space</h3>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{systemStats.diskUsage.toFixed(1)}%</div>
          <Progress value={systemStats.diskUsage} className="h-2" />
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Uptime</h3>
          <Counter
            number={systemStats.uptime}
            setNumber={(n) => setSystemStats(prev => ({ ...prev, uptime: n }))}
            className="text-3xl font-bold text-purple-400"
          />
          <p className="text-white/80 mt-2">hours</p>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">System Actions</h3>
            <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30">
              ⚡ Quick Actions
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MagneticButton
              onClick={() => handleSystemAction('Clear Cache')}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-100 border-red-400/30"
            >
              <span className="mr-2">🗑️</span>
              Clear Cache
            </MagneticButton>
            <MagneticButton
              onClick={() => handleSystemAction('Backup Database')}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border-blue-400/30"
            >
              <span className="mr-2">💾</span>
              Backup Database
            </MagneticButton>
            <MagneticButton
              onClick={() => handleSystemAction('Restart Server')}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 border-orange-400/30"
            >
              <span className="mr-2">🔄</span>
              Restart Server
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Performance Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
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
                    dataKey="cpu" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* API Calls */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">API Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiCalls}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="endpoint" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={10}
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
                  <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Distribution */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Storage Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
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

      {/* System Logs */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">System Logs</h3>
            <Badge className="bg-gray-500/20 text-gray-100 border-gray-400/30">
              📋 Live Logs
            </Badge>
          </div>

          <Terminal className="h-64">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 w-32">{log.timestamp}</span>
                <Badge 
                  className={`w-16 text-center ${
                    log.level === 'ERROR' ? 'bg-red-500/20 text-red-100 border-red-400/30' :
                    log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30' :
                    'bg-green-500/20 text-green-100 border-green-400/30'
                  }`}
                >
                  {log.level}
                </Badge>
                <span className="text-white/80">{log.message}</span>
              </div>
            ))}
          </Terminal>
        </div>
      </div>
    </div>
  );
};