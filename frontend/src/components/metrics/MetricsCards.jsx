import React from 'react';
import { Users, TrendingUp, BookOpen } from 'lucide-react';

const MetricsCards = ({ metrics, lesson, activeTab, onTabChange, isDark }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border p-6 cursor-pointer transition-all duration-200 ${activeTab === 'completions' ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => onTabChange(activeTab === 'completions' ? null : 'completions')}
      >
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Completions</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.totalCompletions || 0}
            </p>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.completionRate || 0}%
            </p>
          </div>
        </div>
      </div>

      <div
        className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border p-6 cursor-pointer transition-all duration-200 ${activeTab === 'content' ? 'ring-2 ring-purple-500' : ''}`}
        onClick={() => onTabChange(activeTab === 'content' ? null : 'content')}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Content</p>
            <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lesson?.type || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.totalStudents || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;