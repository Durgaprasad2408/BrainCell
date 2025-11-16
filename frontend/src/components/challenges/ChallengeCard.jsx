import React from 'react';
import { Calendar, Clock, Trophy, Users, ChevronRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getStatusColor, getDifficultyColor } from './utils';

const ChallengeCard = ({ challenge, userHasCompleted, timeRemaining }) => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status, isDark)} capitalize`}>
          {challenge.status}
        </span>
        {challenge.status === 'live' && timeRemaining && (
          <div className="flex items-center space-x-1 text-xs font-medium text-red-600 dark:text-red-400">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{challenge.title}</h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{challenge.subtitle}</p>
      <div className="space-y-3 mb-6">
        <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <Calendar className="w-4 h-4" />
          <span>{challenge.date}</span>
        </div>
        <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <Clock className="w-4 h-4" />
          <span>{challenge.time}</span>
        </div>
        <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <Users className="w-4 h-4" />
          <span>{challenge.participants || 0} participants</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm">
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty: </span>
          <span className={`font-medium ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
        </div>
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {challenge.questionsCount || 0} Questions • {challenge.duration || '?'} mins
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Leaderboard Button */}
        <button
          disabled={challenge.status === 'upcoming'}
          className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            challenge.status === 'upcoming'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (challenge.status !== 'upcoming') {
              navigate(`/student/challenges/leaderboard/${challenge.id}`);
            }
          }}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>

        {/* Results Button */}
        {userHasCompleted && (
          <button
            className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/student/challenges/results/${challenge.id}`);
            }}
          >
            <Award className="w-4 h-4" />
            <span>Review Answers</span>
          </button>
        )}

        {!userHasCompleted && challenge.status !== 'upcoming' && <div className="flex-grow"></div>}

        {/* View/Join/Submitted Button Group */}
        <div className="ml-auto">
          {challenge.status === 'upcoming' ? (
            <button
              disabled
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm rounded-lg cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
            >
              <span>Coming Soon</span>
            </button>
          ) : challenge.status === 'completed' ? (
            <button
              disabled
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm rounded-lg cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
            >
              <span>Challenge Ended</span>
            </button>
          ) : userHasCompleted ? (
            <button
              disabled
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm rounded-lg cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
            >
              <span>Already Submitted</span>
            </button>
          ) : (
            <button
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please login to take the challenge');
                  navigate('/login');
                  return;
                }
                if (!challenge.hasQuestions) {
                  alert('No questions available for this challenge.');
                  return;
                }
                navigate(`/student/challenges/take/${challenge.id}`);
              }}
            >
              <span>Take Challenge</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;