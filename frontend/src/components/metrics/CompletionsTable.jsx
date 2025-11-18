import React from 'react';
import ItemsPerPageSelector from './ItemsPerPageSelector';
import PaginationControls from './PaginationControls';

const CompletionsTable = ({
  completions,
  lesson,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isDark,
  formatDate
}) => {
  const totalItems = completions.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = completions.slice(startIndex, endIndex);

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Completions
          </h3>

          <ItemsPerPageSelector
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            isDark={isDark}
          />
        </div>
      </div>

      {completions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    #
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Student
                  </th>
                  {lesson?.type === 'Quiz' && (
                    <>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Questions Attempted
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Correct
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Score
                      </th>
                    </>
                  )}
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    {lesson?.type === 'Quiz' ? 'Submitted' : 'Completed At'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((completion, index) => (
                  <tr key={index} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {startIndex + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {completion.user}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {completion.email}
                        </div>
                      </div>
                    </td>
                    {lesson?.type === 'Quiz' && (
                      <>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {lesson?.quizQuestions?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          }`}>
                            {Math.floor(Math.random() * (lesson?.quizQuestions?.length || 5))} {/* Placeholder */}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {Math.floor(Math.random() * 100)}% {/* Placeholder */}
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(completion.completedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            isDark={isDark}
          />
        </>
      ) : (
        <div className="p-6">
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No completions yet
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionsTable;