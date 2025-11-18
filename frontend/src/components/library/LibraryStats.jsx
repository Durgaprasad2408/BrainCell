import React from 'react';

const LibraryStats = ({ stats, isDark }) => {
  const statsDisplay = [
    { label: 'Total Resources', value: stats.totalResources, color: 'blue' },
    { label: 'PDFs', value: stats.pdfCount, color: 'red' },
    { label: 'Videos', value: stats.videoCount, color: 'blue' },
    { label: 'Links', value: stats.linkCount, color: 'green' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statsDisplay.map((stat, index) => (
        <div
          key={index}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.label}</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default LibraryStats;