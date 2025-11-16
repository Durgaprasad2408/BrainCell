import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ChallengePagination = ({ 
  filteredChallengesLength, 
  currentPage,
  setCurrentPage,
  pageSize
}) => {
  const { isDark } = useTheme();

  const totalPages = Math.ceil(filteredChallengesLength / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredChallengesLength);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        {/* Results Info */}
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredChallengesLength > 0 ? startItem : 0} to {endItem} of {filteredChallengesLength} challenges
        </p>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                currentPage === 1
                  ? isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {generatePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className={`px-3 py-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border ${
                        currentPage === page
                          ? isDark
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : isDark
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePagination;