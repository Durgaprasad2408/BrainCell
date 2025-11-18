import React from 'react';
import { Search } from 'lucide-react';

const LibraryFilters = ({ searchQuery, selectedType, onSearchChange, onTypeChange, isDark }) => {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF Notes</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
        </select>
      </div>
    </div>
  );
};

export default LibraryFilters;