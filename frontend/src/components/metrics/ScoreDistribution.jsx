import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ScoreDistribution = ({ metricsData }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Score Distribution
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(metricsData.scoreDistribution).map(([range, count]) => (
            <div key={range} className="text-center">
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {count}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {range}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: metricsData.totalAttempts > 0 ? `${(count / metricsData.totalAttempts) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreDistribution;