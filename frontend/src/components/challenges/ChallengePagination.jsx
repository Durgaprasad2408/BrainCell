import React from 'react';

const ChallengePagination = ({ currentPage, totalPages, onPageChange, isDark }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        aria-label="Previous"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`mr-4 p-2 rounded-md transition-colors ${
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 1L2 9.24242L11 17" stroke={isDark ? '#9CA3AF' : '#111820'} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="flex gap-2 text-gray-500 text-sm md:text-base">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all ${
              currentPage === page
                ? 'bg-indigo-500 text-white'
                : `bg-white border border-gray-200 hover:bg-gray-100/70 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300`
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`ml-4 p-2 rounded-md transition-colors ${
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L10 9.24242L1 17" stroke={isDark ? '#9CA3AF' : '#111820'} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

export default ChallengePagination;