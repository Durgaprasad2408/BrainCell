import React from 'react';

const ChallengePagination = ({ filteredChallengesLength, currentPage, setCurrentPage, pageSize, isDark }) => {
  const totalPages = Math.ceil(filteredChallengesLength / pageSize);
  const onPageChange = setCurrentPage;

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
            ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 1L2 9.24242L11 17" stroke={isDark ? '#FFFFFF' : '#374151'} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all text-sm md:text-base ${
              currentPage === page
                ? 'bg-indigo-500 text-white shadow-md'
                : isDark
                  ? 'bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
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
            ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L10 9.24242L1 17" stroke={isDark ? '#FFFFFF' : '#374151'} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

export default ChallengePagination;