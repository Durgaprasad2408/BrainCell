import React from 'react';
import { Clock, Calendar, BookOpen } from 'lucide-react';

const LessonInfoCard = ({ lesson, isDark, formatDate }) => {
  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            {lesson?.title}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            Subject: {lesson?.subject}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            Module: {lesson?.module}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Type: {lesson?.type}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Duration
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {lesson?.duration}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Created
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatDate(lesson?.createdAt)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </span>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            lesson?.status === 'Published'
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {lesson?.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonInfoCard;