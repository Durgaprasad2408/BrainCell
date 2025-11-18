import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

const ResourceActions = ({ resource, onView, onDelete, isDark }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onView(resource)}
        className={`p-2 rounded-lg ${
          isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
        } transition-colors`}
        title="View Resource"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(resource._id)}
        className={`p-2 rounded-lg ${
          isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
        } transition-colors`}
        title="Delete Resource"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ResourceActions;