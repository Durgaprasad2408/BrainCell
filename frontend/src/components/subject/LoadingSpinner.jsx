import React from 'react';

const LoadingSpinner = ({ isDark }) => {
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading content...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;