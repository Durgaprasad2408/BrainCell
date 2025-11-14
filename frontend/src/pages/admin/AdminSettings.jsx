import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Save,
  RefreshCw,
  Bell,
  Shield,
  Mail,
  Database,
  Globe,
  Palette,
  Key,
  AlertTriangle
} from 'lucide-react';

const AdminSettings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Settings
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 h-fit`}>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  General Settings
                </h2>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Application Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Automata Learning Platform"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Tagline
                  </label>
                  <input
                    type="text"
                    defaultValue="Master the Theory of Computation"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@automata.edu"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Timezone
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option>UTC (GMT+0:00)</option>
                    <option>EST (GMT-5:00)</option>
                    <option>PST (GMT-8:00)</option>
                    <option>IST (GMT+5:30)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Maintenance Mode
                    </label>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Temporarily disable access for maintenance
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-700' : 'bg-gray-200'} peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Appearance Settings
                </h2>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'].map((color) => (
                      <button
                        key={color}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Logo
                  </label>
                  <div className={`border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                    <Upload className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click to upload logo or drag and drop
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      PNG, JPG or SVG (max. 2MB)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show Animations
                    </label>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Enable page transitions and animations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-700' : 'bg-gray-200'} peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Notification Settings
                </h2>

                {[
                  { label: 'New User Registrations', desc: 'Get notified when new users sign up' },
                  { label: 'Challenge Submissions', desc: 'Receive alerts for new challenge submissions' },
                  { label: 'System Alerts', desc: 'Important system notifications and updates' },
                  { label: 'User Reports', desc: 'Notifications about user-reported issues' },
                  { label: 'Weekly Analytics', desc: 'Receive weekly platform statistics' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.label}
                      </label>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index < 3} className="sr-only peer" />
                      <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-700' : 'bg-gray-200'} peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Security Settings
                </h2>

                <div className={`${isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 flex gap-3`}>
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                      Security recommendations available
                    </p>
                    <p className={`text-xs ${isDark ? 'text-yellow-500' : 'text-yellow-700'} mt-1`}>
                      Enable two-factor authentication and review access logs regularly
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Two-Factor Authentication
                    </label>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className={`w-11 h-6 rounded-full peer ${isDark ? 'bg-gray-700' : 'bg-gray-200'} peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>

                <div>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors`}>
                    <Key className="w-4 h-4" />
                    Regenerate API Keys
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Email Settings
                </h2>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    defaultValue="587"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    From Email
                  </label>
                  <input
                    type="email"
                    defaultValue="noreply@automata.edu"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <button className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}>
                  Send Test Email
                </button>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Database Settings
                </h2>

                <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                        Database Status
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        Connected and healthy
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={`${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total Records:</span>
                      <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-blue-900'}`}>12,456</span>
                    </div>
                    <div>
                      <span className={`${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Database Size:</span>
                      <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-blue-900'}`}>248 MB</span>
                    </div>
                  </div>
                </div>

                <div>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} transition-colors`}>
                    <Database className="w-4 h-4" />
                    Backup Database
                  </button>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Auto Backup Schedule
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option>Daily at 2:00 AM</option>
                    <option>Weekly on Sunday</option>
                    <option>Monthly</option>
                    <option>Disabled</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default AdminSettings;
