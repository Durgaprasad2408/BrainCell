import React from 'react';
import { ArrowUp, ArrowDown, BookOpen, CheckSquare, Video as VideoIcon, Eye, Edit, Trash2 } from 'lucide-react';

const LessonTable = ({
  lessons,
  isDark,
  onViewMetrics,
  onEdit,
  onDelete,
  showOrderColumn = false
}) => {
  const getIcon = (type) => {
    if (type === 'Quiz') return CheckSquare;
    if (type === 'Video') return VideoIcon;
    return BookOpen;
  };

  const getTypeColor = (type) => {
    if (type === 'Lesson') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    if (type === 'Quiz') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <tr>
              {showOrderColumn && (
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                  Order
                </th>
              )}
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Content
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Module
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Type
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Performance
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={showOrderColumn ? 6 : 5} className={`px-6 py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No lessons found
                </td>
              </tr>
            ) : (
              lessons.map((lesson, index) => {
                const Icon = getIcon(lesson.type);

                return (
                  <tr key={lesson._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    {showOrderColumn && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {lesson.order || index + 1}
                          </span>
                          <button
                            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {lesson.title}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lesson.duration || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {lesson.module}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(lesson.type)}`}>
                        {lesson.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="mb-1">{lesson.completions || 0} completions</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewMetrics(lesson)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors`}
                          title="View Metrics"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(lesson)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors`}
                          title="Edit Content"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(lesson)}
                          className={`p-2 rounded-lg ${
                            isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          } transition-colors`}
                          title="Delete Content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LessonTable;