// src/pages/Students/TakeChallenge.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import * as challengeService from '../../api/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const TakeChallenge = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // --- Helper: shuffleArray ---
  const shuffleArray = (array) => {
    if (!Array.isArray(array)) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // --- Fetch Challenge Data ---
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!isAuthenticated) {
        alert('Please login to take the challenge');
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        
        // !! IMPORTANT: Ensure you have `getChallengeById` in your `challengeService`.
        const response = await challengeService.getChallengeById(challengeId); 

        if (response.success) {
          const fetchedChallenge = response.data;
          setChallenge(fetchedChallenge);

          if (!Array.isArray(fetchedChallenge.questions) || fetchedChallenge.questions.length === 0) {
            alert('No questions available for this challenge.');
            navigate('/student/practice');
            return;
          }
          
          // Setup the quiz
          const numToShow = fetchedChallenge.numberOfQuestions || fetchedChallenge.questions.length;
          const shuffled = shuffleArray(fetchedChallenge.questions);
          const selectedQuestions = shuffled.slice(0, numToShow);
          
          setRandomizedQuestions(selectedQuestions);
          setCurrentQuestion(0);
          setUserAnswers({});
          setStartTime(new Date());
        } else {
          throw new Error(response.message || 'Failed to load challenge');
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError(err.message || 'Could not load challenge.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenge();
  }, [challengeId, isAuthenticated, navigate]);

  // --- handleAnswerSelect ---
  const handleAnswerSelect = (questionIdx, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: answer
    }));
  };

  // --- handleSubmitQuiz (MODIFIED) ---
  const handleSubmitQuiz = async () => {
    if (!challenge || !isAuthenticated) return;

    try {
      setSubmitting(true);

      const endTime = new Date();
      const timeSpent = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 0;

      const answers = randomizedQuestions.map((question, index) => ({
        questionId: question?._id,
        userAnswer: userAnswers[index] || ''
      }));

      const response = await challengeService.submitChallenge({
        challengeId: challenge._id, // Use _id from fetched challenge
        answers,
        timeSpent
      });

      if (response.success) {
        // *** KEY CHANGE: Navigate to the new results page ***
        navigate(`/student/practice/results/${challenge._id}`);
      } else {
        alert(response.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
      alert(error.response?.data?.message || error.message || 'Failed to submit challenge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <button onClick={() => navigate('/student/practice')} className={`flex items-center space-x-2 mb-4 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Challenges</span>
            </button>
            <div className="text-center py-8">
              <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // --- Render Logic ---
  
  if (!challenge || !randomizedQuestions || randomizedQuestions.length === 0) {
      return <div className={`text-center p-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Challenge data is not available.</div>;
  }

  const question = randomizedQuestions[currentQuestion];
  if (!question) {
      console.error("Current question index out of bounds or question undefined:", currentQuestion, randomizedQuestions);
      return <div className="text-center p-8 text-red-500">Error loading question.</div>;
  };
  const userAnswer = userAnswers[currentQuestion];

  return (
    <div className={`min-h-screen pt-20 pb-8 transition-colors duration-200 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
                    navigate('/student/practice');
                  }
                }}
                className={`flex items-center space-x-2 text-sm font-medium ${
                  isDark
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Challenges</span>
              </button>
              <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Question {currentQuestion + 1} of {randomizedQuestions.length}
              </div>
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {challenge.description}
            </p>
          </div>

          {/* Question Body */}
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 dark:border-gray-700'}`}>
            <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {(question.options || []).map((option, index) => {
                const isUserAnswer = userAnswer === option;
                
                let baseClasses = `w-full text-left p-4 rounded-lg border transition-all text-sm font-medium`;
                let stateClasses = '';

                // We only need the "quiz in progress" styling
                if (isUserAnswer) {
                  stateClasses = isDark ? 'bg-blue-900/50 border-blue-600 text-blue-200 ring-2 ring-blue-500' : 'bg-blue-100 border-blue-400 text-blue-800 ring-2 ring-blue-400';
                } else {
                  stateClasses = isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600/70 text-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`${baseClasses} ${stateClasses}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${
                          isUserAnswer
                            ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                            : 'border-gray-400 dark:border-gray-500'
                        }`}>
                        {isUserAnswer && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium mr-1">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 dark:border-gray-700'}`}>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentQuestion === randomizedQuestions.length - 1 ? (
                // Submit Button (Last question)
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2 text-sm font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                // Next Button
                <button
                  onClick={() => setCurrentQuestion(Math.min(randomizedQuestions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === randomizedQuestions.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeChallenge;