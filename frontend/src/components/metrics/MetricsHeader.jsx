import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ArrowLeft,
  Calendar,
  Target,
  BarChart3,
  Award
} from 'lucide-react';

const MetricsHeader = ({ challenge, metricsData }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Challenge Metrics
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {challenge.title}
          </p>
        </div>
      </div>

      {/* Challenge Info */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {challenge.category} • {challenge.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {challenge.points} points
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {challenge.numberOfQuestions} questions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Success Rate: {metricsData.successRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsHeader;