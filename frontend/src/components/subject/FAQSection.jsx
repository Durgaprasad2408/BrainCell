import React from 'react';
import { MessageCircle, HelpCircle, Send } from 'lucide-react';

const FAQSection = ({ faqs, newQuestion, setNewQuestion, handleSubmitQuery, submittingQuery, querySuccess, isDark }) => {
  return (
    <div className="mt-8 pt-8 space-y-6 border-t border-gray-200 dark:border-gray-700">
      <div className={`p-6 rounded-lg transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-semibold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Ask a Question
          </h2>
        </div>
        <div className="space-y-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Have a question about this lesson? Ask here..."
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleSubmitQuery}
              disabled={!newQuestion.trim() || submittingQuery}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !newQuestion.trim() || submittingQuery
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {submittingQuery ? 'Submitting...' : 'Submit Question'}
            </button>
            {querySuccess && (
              <span className="text-sm text-green-600 font-medium">
                Question submitted successfully!
              </span>
            )}
          </div>
        </div>
      </div>

      {faqs.length > 0 && (
        <div className={`p-6 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className={`text-xl font-semibold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className={`p-4 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="mb-2">
                  <p className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Q: {faq.question}
                  </p>
                </div>
                <div>
                  <p className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    A: {faq.answer}
                  </p>
                </div>
                <div className={`mt-2 text-xs transition-colors duration-200 ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Answered by {faq.instructorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQSection;
