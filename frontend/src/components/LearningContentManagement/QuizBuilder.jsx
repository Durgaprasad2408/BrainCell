import React from 'react';
import { Plus, Trash2, Edit, Download } from 'lucide-react';
import Papa from 'papaparse';

const QuizBuilder = ({
  quizQuestions,
  currentQuestion,
  setCurrentQuestion,
  editingQuestionId,
  setEditingQuestionId,
  bulkFile,
  setBulkFile,
  isDark,
  onAddQuestion,
  onRemoveQuestion,
  onEditQuestion,
  onCancelEditQuestion,
  onDownloadTemplate,
  onBulkCsvAdd
}) => {
  const handleQuestionChange = (field, value, optionIndex = null) => {
    if (field === 'options' && optionIndex !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBulkCsvAdd = () => {
    if (!bulkFile) {
      alert('Please select a CSV file first.');
      return;
    }

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const newQuestions = [];
          let index = 0;

          for (const row of results.data) {
            const options = [
              row.option1,
              row.option2,
              row.option3,
              row.option4
            ].filter(opt => opt && opt.trim() !== '');

            if (!row.question || options.length < 2 || !row.answer || !row.explanation) {
              throw new Error(`Row ${index + 1} is missing required fields. Make sure you have 'question', 'answer', 'explanation', and at least two options.`);
            }
            if (!options.includes(row.answer)) {
              throw new Error(`The answer "${row.answer}" for question "${row.question}" (Row ${index + 1}) is not listed in its options.`);
            }

            newQuestions.push({
              question: row.question,
              options: options,
              answer: row.answer,
              explanation: row.explanation,
              id: Date.now() + index++
            });
          }

          onBulkCsvAdd(newQuestions);
          setBulkFile(null);
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = null;

          alert(`Successfully added ${newQuestions.length} questions!`);

        } catch (error) {
          console.error('Error processing CSV:', error);
          alert(`Failed to add bulk questions: ${error.message}`);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
        alert(`Failed to parse CSV file: ${error.message}`);
      }
    });
  };

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Quiz Questions ({quizQuestions.length})
      </h3>

      {quizQuestions.length > 0 && (
        <div className="space-y-3 mb-6">
          {quizQuestions.map((q, index) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Question {index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditQuestion(q)}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                    }`}
                    title="Edit Question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveQuestion(q.id)}
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                    }`}
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {q.question}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
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
      )}

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Question
          </label>
          <textarea
            value={currentQuestion.question}
            onChange={(e) => handleQuestionChange('question', e.target.value)}
            placeholder="Enter the question"
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <div key={index}>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Option {index + 1}
              </label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleQuestionChange('options', e.target.value, index)}
                placeholder={`Enter option ${index + 1}`}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Correct Answer
          </label>
          <select
            value={currentQuestion.answer}
            onChange={(e) => handleQuestionChange('answer', e.target.value)}
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
            Explanation (Optional)
          </label>
          <textarea
            value={currentQuestion.explanation}
            onChange={(e) => handleQuestionChange('explanation', e.target.value)}
            placeholder="Explain why this is the correct answer..."
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div className="flex gap-3">
          {editingQuestionId !== null && (
            <button
              type="button"
              onClick={onCancelEditQuestion}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onAddQuestion}
            disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt) || !currentQuestion.answer}
            className={`${
              editingQuestionId !== null ? 'flex-1' : 'w-full'
            } px-4 py-2 rounded-lg border-2 border-dashed font-medium transition-all ${
              currentQuestion.question && currentQuestion.options.every(opt => opt) && currentQuestion.answer
                ? isDark
                  ? 'border-blue-600 text-blue-400 hover:bg-blue-600/10'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                : isDark
                  ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            {editingQuestionId !== null ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>

      <div className={`mt-6 ${
        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
      } rounded-lg p-4 border ${
        isDark ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
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
    </div>
  );
};

export default QuizBuilder;