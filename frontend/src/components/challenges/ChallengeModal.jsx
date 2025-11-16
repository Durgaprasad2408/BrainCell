import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ChallengeModal = ({
  showCreateModal,
  resetModal,
  editMode,
  currentStep,
  challengeData,
  setChallengeData,
  handleNextStep,
  handlePreviousStep,
  handleCreateChallenge,
  children
}) => {
  const { isDark } = useTheme();

  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        rounded-xl border shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto
      `}>
        <div className={`
          p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}
          flex items-center justify-between
        `}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editMode ? 'Edit Challenge' : 'Create New Challenge'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Step {currentStep} of 2: {currentStep === 1 ? 'Challenge Details' : 'Add Questions'}
            </p>
          </div>
          <button
            onClick={resetModal}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentStep === 1 && (
          <div className="p-6 space-y-4">
            {/* Challenge Details Form */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Title *
              </label>
              <input
                type="text"
                value={challengeData.title}
                onChange={(e) => setChallengeData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter challenge title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={challengeData.category}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Difficulty
                </label>
                <select
                  value={challengeData.difficulty}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Points *
                </label>
                <input
                  type="number"
                  value={challengeData.points}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, points: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter points"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Number of Questions to Show *
                </label>
                <input
                  type="number"
                  min="1"
                  value={challengeData.numberOfQuestions}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, numberOfQuestions: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter number of questions"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description *
              </label>
              <textarea
                rows={4}
                value={challengeData.description}
                onChange={(e) => setChallengeData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter challenge description"
              />
            </div>

            {(challengeData.category === 'daily' || challengeData.category === 'weekly') && (
              <div className={`
                ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'}
                rounded-lg p-4 border space-y-4
              `}>
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Schedule Challenge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={challengeData.startDate}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={challengeData.startTime}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, startTime: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={challengeData.endTime}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, endTime: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This challenge will only be visible to users during the scheduled time period on the start date.
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && children}

        <div className={`
          p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}
          flex justify-between gap-3
        `}>
          <div>
            {currentStep === 2 && (
              <button
                onClick={handlePreviousStep}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } transition-colors`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetModal}
              className={`px-6 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              } transition-colors`}
            >
              Cancel
            </button>
            {currentStep === 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreateChallenge}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {editMode ? 'Update Challenge' : 'Create Challenge'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;