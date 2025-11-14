import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Clock, Award, Medal, Calendar } from 'lucide-react';
import * as challengeService from '../../api/challengeService';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const Leaderboard = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme(); // <-- 2. Get isDark state
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [challengeId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeService.getChallengeLeaderboard(challengeId);
      if (response.success) {
        setLeaderboardData(response.data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getBadgeIcon = (badge) => {
    if (badge === 'gold') return <Medal className="w-6 h-6 text-yellow-500" />;
    if (badge === 'silver') return <Medal className="w-6 h-6 text-gray-400" />;
    if (badge === 'bronze') return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      // 3. Apply isDark logic
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading leaderboard...</p>
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
            <button
              onClick={() => navigate('/student/practice')}
              className={`flex items-center space-x-2 mb-4 ${
                isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
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

  if (!leaderboardData) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-8 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/student/practice')}
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

          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Leaderboard
              </h1>
            </div>
            <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {leaderboardData.challenge.title}
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {leaderboardData.challenge.description}
            </p>
            <div className="flex items-center justify-center mt-4 space-x-6">
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Award className="w-4 h-4" />
                <span>Difficulty: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{leaderboardData.challenge.difficulty}</span></span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Trophy className="w-4 h-4" />
                <span>Participants: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{leaderboardData.totalParticipants}</span></span>
              </div>
            </div>
          </div>
        </div>

        {leaderboardData.leaderboard.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No submissions yet. Be the first to take this challenge!
            </p>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="space-y-3">
              {leaderboardData.leaderboard.map((participant) => (
                <div
                  key={participant.rank}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    participant.rank <= 3
                      ? isDark
                        ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-800'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : isDark
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        participant.badge === 'gold'
                          ? 'bg-yellow-400 text-yellow-900'
                          : participant.badge === 'silver'
                          ? 'bg-gray-300 text-gray-800'
                          : participant.badge === 'bronze'
                          ? 'bg-orange-400 text-orange-900'
                          : isDark
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {participant.rank}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {participant.name}
                        </div>
                        {participant.badge && (
                          <div className="flex items-center space-x-1">
                            {getBadgeIcon(participant.badge)}
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {participant.badge === 'gold' && 'Gold Medal'}
                              {participant.badge === 'silver' && 'Silver Medal'}
                              {participant.badge === 'bronze' && 'Bronze Medal'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center space-x-4 mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(participant.timeSpent)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(participant.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {participant.score}/{leaderboardData.challenge.points}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Math.round((participant.score / leaderboardData.challenge.points) * 100)}% accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;