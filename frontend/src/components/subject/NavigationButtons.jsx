import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationButtons = ({ navigationDetails, selectContent, isDark }) => {
  const { prevLesson, nextLesson, isCurrentCompleted } = navigationDetails;

  if (!navigationDetails || (!prevLesson && !nextLesson)) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
      {prevLesson ? (
        <button
          onClick={() => selectContent(prevLesson)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
      ) : (
        <div /> // Spacer
      )}

      {nextLesson && (
        <button
          onClick={() => selectContent(nextLesson)}
          disabled={!isCurrentCompleted}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            !isCurrentCompleted
              ? isDark
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : `bg-blue-600 hover:bg-blue-700 text-white`
          }`}
          title={!isCurrentCompleted ? "Complete the current topic to unlock" : "Next Topic"}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;