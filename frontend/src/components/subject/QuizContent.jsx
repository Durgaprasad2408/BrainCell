import React from 'react';
import { CheckCircle } from 'lucide-react';
import NavigationButtons from './NavigationButtons';

const QuizContent = ({
  currentContent,
  quizResults,
  quizAnswers,
  handleQuizAnswer,
  submitQuiz,
  retakeQuiz,
  navigationDetails,
  selectContent,
  isDark
}) => {
  if (!currentContent || currentContent.type !== 'Quiz') return null;

  const quizResult = quizResults[currentContent._id];
  const hasAnswered = currentContent.quizQuestions.every((q, index) =>
    quizAnswers[`${currentContent._id}_q${index}`] !== undefined
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {currentContent.title}
        </h1>
        {quizResult && (
          <div className={`p-4 rounded-lg mb-4 ${
            quizResult.passed
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <h3 className="font-semibold mb-1">Results</h3>
            <p>You scored {quizResult.correct} out of {quizResult.total} ({quizResult.score}%)</p>
            {quizResult.passed ? (
              <p className="text-sm mt-1">Quiz passed! You can proceed to the next lesson.</p>
            ) : (
              <p className="text-sm mt-1">You need 70% to pass. Please review and retake.</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {currentContent.quizQuestions.map((question, qIndex) => {
          const userAnswer = quizAnswers[`${currentContent._id}_q${qIndex}`];
          const showResult = quizResult !== undefined;

          return (
            <div key={qIndex} className={`p-6 rounded-lg transition-colors duration-200 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Question {qIndex + 1}: {question.question}
              </h3>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  let buttonClass = `w-full text-left p-3 rounded border transition-all duration-200 ${
                    isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`;

                  if (showResult) {
                    if (option === question.answer) {
                      buttonClass += ` bg-green-100 border-green-300 text-green-800`;
                    } else if (option === userAnswer && option !== question.answer) {
                      buttonClass += ` bg-red-100 border-red-300 text-red-800`;
                    } else {
                      buttonClass += isDark
                        ? ` bg-gray-700 text-gray-300`
                        : ` bg-gray-50 text-gray-600`;
                    }
                  } else {
                    if (userAnswer === option) {
                      buttonClass += ` bg-blue-100 border-blue-300 text-blue-800`;
                    } else {
                      buttonClass += isDark
                        ? ` bg-gray-700 text-gray-300 hover:bg-gray-600`
                        : ` bg-gray-50 text-gray-700 hover:bg-gray-100`;
                    }
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => !showResult && handleQuizAnswer(`q${qIndex}`, option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          userAnswer === option
                            ? 'border-blue-500 bg-blue-500'
                            : isDark
                              ? 'border-gray-500'
                              : 'border-gray-400'
                        }`}>
                          {userAnswer === option && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && question.explanation && (
                <div className={`mt-4 p-3 rounded transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-blue-50'
                } border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
                  <p className={`text-sm transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-blue-800'
                  }`}>
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        {quizResult && !quizResult.passed && (
          <button
            onClick={retakeQuiz}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Retake Quiz
          </button>
        )}

        <div className="ml-auto">
          {!quizResult ? (
            <button
              onClick={submitQuiz}
              disabled={!hasAnswered}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                hasAnswered
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Quiz
            </button>
          ) : quizResult.passed ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Quiz Completed
            </div>
          ) : null}
        </div>
      </div>

      <NavigationButtons
        navigationDetails={navigationDetails}
        selectContent={selectContent}
        isDark={isDark}
      />
      {/* Note: No FAQ section for Quizzes by design, but you could add renderFAQSection() here if desired */}
    </div>
  );
};

export default QuizContent;