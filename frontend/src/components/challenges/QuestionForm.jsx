import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const QuestionForm = ({
  currentQuestion,
  setCurrentQuestion,
  questions,
  editingQuestionId,
  bulkFile,
  setBulkFile,
  handleBulkCsvAdd,
  addQuestion,
  editQuestion,
  removeQuestion,
  cancelEditQuestion
}) => {
  const { isDark } = useTheme();

  const handleCurrentQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Single Question Form */}
      <div className={`
        ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
        rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {editingQuestionId ? 'Edit Question' : 'Add Single Question'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Question *
            </label>
            <textarea
              rows={3}
              value={currentQuestion.question}
              onChange={(e) => handleCurrentQuestionChange('question', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter the question"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <div key={index}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Option {index + 1} *
                </label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleCurrentQuestionChange('options', e.target.value, index)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder={`Enter option ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Correct Answer *
            </label>
            <select
              value={currentQuestion.answer}
              onChange={(e) => handleCurrentQuestionChange('answer', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select correct answer</option>
              {currentQuestion.options.map((option, index) => (
                <option key={index} value={option} disabled={!option}>
                  Option {index + 1}: {option || '(empty)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Explanation for Correct Answer *
            </label>
            <textarea
              rows={3}
              value={currentQuestion.explanation}
              onChange={(e) => handleCurrentQuestionChange('explanation', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Explain why this is the correct answer"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={addQuestion}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              {editingQuestionId ? 'Update Question' : 'Add Question'}
            </button>
            {editingQuestionId && (
              <button
                onClick={cancelEditQuestion}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Upload Form */}
      <div className={`
        mt-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
        rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Bulk Add via CSV
        </h3>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Upload a CSV file with columns: <b>question</b>, <b>option1</b>, <b>option2</b>, <b>option3</b>, <b>option4</b>, <b>answer</b>, <b>explanation</b>.
        </p>
        <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Note: The <b>answer</b> must exactly match the text in one of the option columns.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setBulkFile(e.target.files[0])}
          className={`w-full px-4 py-2 rounded-lg border ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
            file:text-sm file:font-semibold
            ${isDark ? 'file:bg-blue-600 file:text-white hover:file:bg-blue-700' : 'file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200'}
          `}
        />
        <button
          onClick={handleBulkCsvAdd}
          disabled={!bulkFile}
          className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all ${
            isDark
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Add Questions from CSV
        </button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Added Questions ({questions.length})
          </h3>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className={`
                  ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}
                  rounded-lg p-4 border
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Question {index + 1}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editQuestion(q)}
                      className={`p-1 rounded ${
                        isDark ? 'hover:bg-blue-900/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                      } transition-colors`}
                      title="Edit Question"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className={`p-1 rounded ${
                        isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                      } transition-colors`}
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`px-2 py-1 rounded ${
                        opt === q.answer
                          ? isDark
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-green-100 text-green-800'
                          : isDark
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {i + 1}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;