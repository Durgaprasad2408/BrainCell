import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, Lock, CheckCircle, Play, BookOpen, HelpCircle, Eye, EyeOff } from 'lucide-react';

const SubjectSidebar = ({
  subject,
  lessons,
  completedItems,
  quizResults,
  expandedWeeks,
  toggleModule,
  selectContent,
  sidebarVisible,
  setSidebarVisible,
  completedLessonCount,
  isDark,
  groupLessonsByModule,
  isUnlocked
}) => {
  if (!subject) return null;

  const moduleLessons = groupLessonsByModule();

  return (
    <div className={`fixed left-0 top-20 w-80 bottom-0 overflow-y-auto border-r transition-all duration-300 z-40 ${
      sidebarVisible ? 'translate-x-0' : '-translate-x-full'
    } ${
      isDark
        ? 'bg-gray-900 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b transition-colors duration-200 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <Link
          to="/student/learning"
          className={`mb-3 text-sm flex items-center gap-2 transition-colors duration-200 ${
            isDark
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Subjects
        </Link>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-lg font-bold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {subject?.name}
          </h2>
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`p-1 rounded transition-colors duration-200 ${
              isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            {sidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className={`text-sm transition-colors duration-200 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Complete lessons and quizzes to unlock new content
        </p>
        <div className="mt-3">
          <div className={`text-xs font-medium mb-1 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Progress: {completedLessonCount}/{lessons.length}
          </div>
          <div className={`w-full h-2 rounded-full transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{
                width: `${lessons.length > 0 ? (completedLessonCount / lessons.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-2">
        {Object.keys(moduleLessons).map((module) => (
          <div key={module} className="mb-2">
            <button
              onClick={() => toggleModule(module)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-200'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              <span className="font-medium text-sm">{module}</span>
              {expandedWeeks[module] ?
                <ChevronDown className="w-4 h-4" /> :
                <ChevronRight className="w-4 h-4" />
              }
            </button>

            {expandedWeeks[module] && (
              <div className="ml-4 mt-2 space-y-1">
                {moduleLessons[module].map((lesson, lessonIndex) => {
                  const unlocked = isUnlocked(module, lessonIndex);
                  const completed = completedItems[lesson._id];
                  const isQuiz = lesson.type === 'Quiz';
                  const quizResult = quizResults[lesson._id];

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => unlocked && selectContent(lesson)}
                      disabled={!unlocked}
                      className={`w-full flex items-center justify-between p-2 rounded text-left text-sm transition-all duration-200 ${
                        !unlocked
                          ? isDark
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : selectContent && selectContent._id === lesson._id
                            ? isDark
                              ? 'bg-blue-900 text-blue-200 border border-blue-700'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                            : isDark
                              ? 'hover:bg-gray-800 text-gray-300'
                              : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isQuiz ? (
                          <HelpCircle className="w-4 h-4" />
                        ) : lesson.type === 'Video' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                        <span>{lesson.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {quizResult && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            quizResult.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quizResult.score}%
                          </span>
                        )}
                        {!unlocked ? (
                          <Lock className="w-4 h-4" />
                        ) : completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                            isDark ? 'border-gray-600' : 'border-gray-300'
                          }`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectSidebar;