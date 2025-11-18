import React from 'react';
import { Plus } from 'lucide-react';

const LibraryHeader = ({ isDark, onAddResource }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Library Management
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage educational resources and materials
        </p>
      </div>
      <button
        onClick={onAddResource}
        className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="w-5 h-5" />
        Add Resource
      </button>
    </div>
  );
};

export default LibraryHeader;