import React from 'react';
import { FileText, Video, Link as LinkIcon, Package } from 'lucide-react';

const LibraryStats = ({ stats, isDark }) => {
  const statsDisplay = [
    { label: 'Total Resources', value: stats.totalResources, icon: Package, color: 'blue' },
    { label: 'PDFs', value: stats.pdfCount, icon: FileText, color: 'red' },
    { label: 'Videos', value: stats.videoCount, icon: Video, color: 'blue' },
    { label: 'Links', value: stats.linkCount, icon: LinkIcon, color: 'green' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statsDisplay.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center gap-3">
              <IconComponent className={`w-8 h-8 text-${stat.color}-500`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LibraryStats;