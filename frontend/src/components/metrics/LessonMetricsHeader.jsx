import React from 'react';
import { ArrowLeft } from 'lucide-react';

const LessonMetricsHeader = ({ isDark, title, subtitle, onBack }) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          {title}
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default LessonMetricsHeader;