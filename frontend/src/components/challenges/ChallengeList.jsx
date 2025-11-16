import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart3, Star, Edit, Trash2, Eye, Copy } from 'lucide-react';

const ChallengeList = ({ 
  challenges, 
  navigate, 
  handleEditChallenge, 
  handleDeleteChallenge, 
  getDifficultyColor, 
  getSuccessRateColor, 
  getStatusColor, 
  determineStatus, 
  metricsRoutePrefix = '/admin' 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <tr>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Challenge
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Category
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Difficulty
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Stats
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Status
            </th>
            <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {challenges.map((challenge) => (
            <tr key={challenge._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
              <td className="px-6 py-4">
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {challenge.title}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Star className="w-3 h-3" />
                    {challenge.points} points
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                }`}>
                  {challenge.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <BarChart3 className="w-3 h-3" />
                    {challenge.attempts || 0} attempts
                  </div>
                  <div className={`text-xs font-medium ${getSuccessRateColor(challenge.successRate || 0)}`}>
                    {challenge.successRate || 0}% success rate
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(determineStatus(challenge))}`}>
                  {determineStatus(challenge)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`${metricsRoutePrefix}/challenges/metrics/${challenge._id}`)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    } transition-colors`}
                    title="View Challenge Metrics"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditChallenge(challenge)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    } transition-colors`}
                    title="Edit Challenge"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {metricsRoutePrefix.includes('instructor') && (
                    <button
                      className={`p-2 rounded-lg ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      } transition-colors`}
                      title="Duplicate Challenge"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteChallenge(challenge._id || challenge.id)}
                    className={`p-2 rounded-lg ${
                      isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                    } transition-colors`}
                    title="Delete Challenge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeList;