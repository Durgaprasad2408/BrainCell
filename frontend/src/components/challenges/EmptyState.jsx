import React from 'react';
import { Trophy } from 'lucide-react';

const EmptyState = ({ activeTab, isDark }) => {
  return (
    <div className="text-center py-16">
      <Trophy className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} strokeWidth={1.5} />
      <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        No {activeTab} challenges available right now.
      </p>
      <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Check back later or explore other sections!
      </p>
    </div>
  );
};

export default EmptyState;