import React from 'react';

export const TestSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-3xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
              <p className="text-white/80 mt-2">Manage your application settings</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* API Settings Card */}
            <div className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔑</span>
                <h3 className="text-xl font-bold text-white">API Settings</h3>
              </div>
              <p className="text-white/80 mb-4">Manage OpenAI API configuration</p>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm text-white/60">API Key</div>
                  <div className="text-white font-mono">sk-***</div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500/20 hover:bg-green-500/30 text-green-100 px-4 py-2 rounded-lg transition-colors">
                    Save
                  </button>
                  <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 px-4 py-2 rounded-lg transition-colors">
                    Test
                  </button>
                </div>
              </div>
            </div>

            {/* Languages Card */}
            <div className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌐</span>
                <h3 className="text-xl font-bold text-white">Languages</h3>
              </div>
              <p className="text-white/80 mb-4">Manage translations and languages</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white">English</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Russian</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Georgian</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Card */}
            <div className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🖥️</span>
                <h3 className="text-xl font-bold text-white">System</h3>
              </div>
              <p className="text-white/80 mb-4">Monitor system performance</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white">CPU Usage</span>
                  <span className="text-green-400 font-bold">29.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Memory</span>
                  <span className="text-green-400 font-bold">53.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Disk Space</span>
                  <span className="text-yellow-400 font-bold">20.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
