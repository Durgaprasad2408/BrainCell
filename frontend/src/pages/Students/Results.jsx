import React from 'react';
import { ArrowLeft, Award, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const Results = ({ submission, challenge, onBack }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-white';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!submission || !challenge) {
    return (
      // 3. Apply isDark logic
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
              No submission data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // 3. Apply isDark logic to all parent divs and elements
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className={`flex items-center space-x-2 ${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Challenges</span>
            </button>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            {challenge.title} - Your Results
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {challenge.description}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-blue-100 mb-6">You have completed the challenge</p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className={`text-4xl font-bold mb-1 ${getScoreColor(Math.round((submission.score / challenge.points) * 100))}`}>
                  {submission.score}/{challenge.points}
                </div>
                <div className="text-sm text-white">Your Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-4xl font-bold mb-1">
                  {submission.correctAnswers}/{submission.totalQuestions}
                </div>
                <div className="text-sm text-blue-100">Correct</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-4xl font-bold mb-1">
                  {submission.timeSpent > 0 ? `${submission.timeSpent}m` : 'N/A'}
                </div>
                <div className="text-sm text-blue-100">Time Spent</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Performance Breakdown
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round((submission.score / challenge.points) * 100)}%
                </span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                <div
                  className={`h-3 rounded-full transition-all ${
                    (submission.score / challenge.points) * 100 >= 80
                      ? 'bg-green-500'
                      : (submission.score / challenge.points) * 100 >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(submission.score / challenge.points) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className={`flex items-center space-x-3 p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} rounded-lg`}>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {submission.correctAnswers}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Correct Answers
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-3 p-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} rounded-lg`}>
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {submission.totalQuestions - submission.correctAnswers}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Incorrect Answers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Challenge Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className={`flex justify-between items-center p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty</span>
              <span className={`font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>
            <div className={`flex justify-between items-center p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Questions
              </span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {submission.totalQuestions}
              </span>
            </div>
            <div className={`flex justify-between items-center p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Submitted At</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm`}>
                {formatDate(submission.submittedAt)}
              </span>
            </div>
            <div className={`flex justify-between items-center p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Time Spent</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {submission.timeSpent > 0 ? `${submission.timeSpent} minutes` : 'Not tracked'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate(`/student/challenges/leaderboard/${challenge._id}`)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Detailed Answer Review
          </h3>

          <div className="space-y-6">
            {submission.answers.map((answer, index) => (
              <div
                key={index}
                className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex-1`}>
                    Question {index + 1}: {answer.question}
                  </h4>
                  {answer.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {answer.options.map((option, optionIndex) => {
                    const isUserAnswer = option === answer.userAnswer;
                    const isCorrectAnswer = option === answer.correctAnswer;

                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border transition-all ${
                          isCorrectAnswer
                            ? isDark
                              ? 'bg-green-900/30 border-green-700 text-green-300'
                              : 'bg-green-100 border-green-300 text-green-800'
                            : isUserAnswer && !isCorrectAnswer
                            ? isDark
                              ? 'bg-red-900/30 border-red-700 text-red-300'
                              : 'bg-red-100 border-red-300 text-red-800'
                            : isDark
                            ? 'bg-gray-700 border-gray-600 text-gray-400'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-xs font-semibold">Correct Answer</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-auto text-xs font-semibold">Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {answer.explanation && (
                  <div
                    className={`p-4 border rounded-lg ${
                      isDark
                        ? 'bg-blue-900/20 border-blue-800'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <h5 className={`font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'} mb-2`}>
                      Explanation:
                    </h5>
                    <p className={`${isDark ? 'text-blue-300' : 'text-blue-700'} text-sm`}>
                      {answer.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;