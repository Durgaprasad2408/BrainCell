import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const SubjectSelector = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  isDark,
  showActions = false,
  showViewUsers = false,
  showEditSubject = false,
  showDeleteSubject = false,
  onViewUsers,
  onEditSubject,
  onDeleteSubject,
  loading
}) => {
  if (loading && subjects.length === 0) {
    return (
      <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading subjects...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        No subjects found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {subjects.map((subject, index) => (
        <div
          key={subject._id || index}
          className={`relative group rounded-xl border transition-all ${
            selectedSubject === subject.name
              ? isDark
                ? 'bg-blue-600 border-blue-500 shadow-lg'
                : 'bg-blue-600 border-blue-500 shadow-lg'
              : isDark
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => onSelectSubject(subject.name)}
            className="w-full px-6 py-4 text-left"
          >
            <div className={`font-semibold mb-1 ${
              selectedSubject === subject.name ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {subject.name}
            </div>
            <div className={`text-xs ${
              selectedSubject === subject.name ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {subject.lessons} lessons · {subject.students} students
            </div>
          </button>
          {(showActions || showViewUsers || showEditSubject || showDeleteSubject) && (
            <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              {showViewUsers && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewUsers(subject);
                  }}
                  className={`p-1.5 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'
                  } shadow-sm`}
                  title="View Subject Users"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {showEditSubject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSubject(subject);
                  }}
                  className={`p-1.5 rounded-lg ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'
                  } shadow-sm`}
                  title="Edit Subject"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {showDeleteSubject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSubject(subject);
                  }}
                  className={`p-1.5 rounded-lg ${
                    isDark ? 'bg-red-900/50 hover:bg-red-900 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                  } shadow-sm`}
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubjectSelector;