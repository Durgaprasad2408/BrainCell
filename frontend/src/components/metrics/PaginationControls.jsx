import React, { Fragment } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  isDark
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {/* Pagination info */}
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} items
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                </Fragment>
              ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;