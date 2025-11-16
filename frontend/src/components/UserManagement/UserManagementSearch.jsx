import React from 'react';
import { Search, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const UserManagementSearch = ({ searchQuery, onSearchChange, onDownloadTemplate }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm mb-6`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDownloadTemplate}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
              title="Download Template"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSearch;