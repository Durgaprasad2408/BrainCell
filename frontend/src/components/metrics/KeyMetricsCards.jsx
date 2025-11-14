import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';

const KeyMetricsCards = ({ metricsData, questionStats, setActiveTab, activeTab }) => {
  const { isDark } = useTheme();

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const cardClasses = (isClickable, isActive) => {
    let classes = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`;
    if (isClickable) {
      classes += ` cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`;
    }
    return classes;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div
        className={cardClasses(true, activeTab === 'recentSubmissions')}
        onClick={() => setActiveTab('recentSubmissions')}
      >
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Participants</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metricsData.uniqueParticipants}
            </p>
          </div>
        </div>
      </div>

      <div className={cardClasses(false, false)}>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metricsData.averageScore}%
            </p>
          </div>
        </div>
      </div>

      <div
        className={cardClasses(true, activeTab === 'scoreDistribution')}
        onClick={() => setActiveTab('scoreDistribution')}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-green-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score Distribution</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Object.entries(metricsData.scoreDistribution).reduce((a, b) => metricsData.scoreDistribution[a[0]] > metricsData.scoreDistribution[b[0]] ? a : b)[0]}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Most common range
            </p>
          </div>
        </div>
      </div>

      <div
        className={cardClasses(true, activeTab === 'questionPerformance')}
        onClick={() => setActiveTab('questionPerformance')}
      >
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-orange-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Question Performance</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {questionStats.length > 0 ? Math.round(questionStats.reduce((sum, q) => sum + q.successRate, 0) / questionStats.length) : 0}%
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Avg success rate
            </p>
          </div>
        </div>
      </div>

      <div className={cardClasses(false, false)}>
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-red-500" />
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Time</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(metricsData.averageTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsCards;