// src/pages/Students/Challenges.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, Users, ChevronRight, Award } from 'lucide-react';
import * as challengeService from '../../api/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Challenges = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme(); 
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [isAuthenticated]);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const determineStatus = (challenge) => {
    const now = new Date();
    const startDateTime = new Date(challenge.startDateTime);
    const endDateTime = new Date(challenge.endDateTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error("Invalid date found in challenge:", challenge);
        return 'unknown';
    }

    if (now < startDateTime) {
      return 'upcoming';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'live';
    } else {
      return 'completed';
    }
  };


  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getPublishedChallenges();
      const fetchedChallenges = response.data || [];

      const mappedChallenges = fetchedChallenges.map(challenge => {
        const startTime = new Date(challenge.startDateTime);
        const endTime = new Date(challenge.endDateTime);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

        return {
          ...challenge,
          id: challenge._id,
          subtitle: challenge.description,
          date: formatDate(challenge.startDateTime),
          time: `${formatTime(challenge.startDateTime)} - ${formatTime(challenge.endDateTime)}`,
          status: determineStatus(challenge),
          participants: challenge.attempts || 0,
          questionsCount: challenge.numberOfQuestions || challenge.questions?.length || 0,
          duration: durationMinutes,
          toppers: [],
          // We only need to know if questions exist, not the full array here
          hasQuestions: (challenge.questions?.length || 0) > 0,
          numberOfQuestions: challenge.numberOfQuestions || challenge.questions?.length || 0
        };
      });

      setChallenges(mappedChallenges);

      if (isAuthenticated) {
        await fetchUserSubmissions(mappedChallenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async (challengeList) => {
    if (!isAuthenticated) return;
    const submissions = {};
    for (const challenge of challengeList) {
      try {
        const response = await challengeService.checkUserSubmission(challenge.id);
        if (response.success && response.hasSubmitted) {
          submissions[challenge.id] = response.submission;
        }
      } catch (error) {
        console.error(`Error checking submission for challenge ${challenge.id}:`, error);
      }
    }
    setCompletedChallenges(submissions);
  };

  useEffect(() => {
    let timer = null; 
    const liveChallenge = challenges.find(c => c.status === 'live');
    if (liveChallenge && liveChallenge.endDateTime) {
      const endDateTime = new Date(liveChallenge.endDateTime);
      if (!isNaN(endDateTime.getTime())) {
         timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endDateTime.getTime() - now;
            if (distance > 0) {
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              const formattedMinutes = String(minutes).padStart(2, '0');
              const formattedSeconds = String(seconds).padStart(2, '0');
              setTimeRemaining(`${hours}h ${formattedMinutes}m ${formattedSeconds}s`);
            } else {
              setTimeRemaining('Challenge Ended');
              clearInterval(timer);
            }
          }, 1000);
      } else {
        console.error("Invalid endDateTime for live challenge:", liveChallenge);
        setTimeRemaining('Invalid end time');
      }
    } else {
      setTimeRemaining(null);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [challenges]);

  const getStatusColor = (status) => {
    if (isDark) {
      switch (status) {
        case 'live': return 'bg-green-900/30 text-green-400 border-green-700';
        case 'completed': return 'bg-blue-900/30 text-blue-400 border-blue-700';
        case 'upcoming': return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
        default: return 'bg-gray-700 text-gray-300 border-gray-600';
      }
    } else {
      switch (status) {
        case 'live': return 'bg-green-100 text-green-800 border-green-200';
        case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'gold': return 'bg-yellow-400 text-yellow-900';
      case 'silver': return 'bg-gray-300 text-gray-800';
      case 'bronze': return 'bg-orange-400 text-orange-900';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const renderChallengeCard = (challenge) => {
    const userHasCompleted = !!completedChallenges[challenge.id];

    return (
      <div
        key={challenge.id}
        className={`rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)} capitalize`}>
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

        {/* --- UPDATED ACTION BUTTONS --- */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Leaderboard Button (No change) */}
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

          {/* Results Button (MODIFIED) */}
          {userHasCompleted && (
            <button
              className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // KEY CHANGE: Navigate to the results page
                navigate(`/student/challenges/results/${challenge.id}`); 
              }}
            >
              <Award className="w-4 h-4" />
              <span>Review Answers</span>
            </button>
          )}

          {!userHasCompleted && challenge.status !== 'upcoming' && <div className="flex-grow"></div>}

          {/* View/Join/Submitted Button Group (MODIFIED) */}
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
                  // KEY CHANGE: Navigate to the take challenge page
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

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Challenges' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' }
  ];

  const filteredChallenges = challenges.filter(challenge => challenge.status === activeTab);

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-200 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Weekly Challenge Schedule</h2>
              <p className="text-blue-100">Every Monday • 7:00 PM - 10:00 PM IST</p>
              <p className="text-blue-100 text-sm mt-1">Top 3 performers get Gold, Silver, and Bronze badges! 🏅</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-bold">3 Hours</div>
              <div className="text-blue-100">Duration</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`mb-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="-mb-px flex flex-wrap justify-center space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 font-medium text-sm border-b-2 transition-colors focus:outline-none ${
                  activeTab === tab.id
                    ? (isDark ? 'border-blue-400 text-blue-400' : 'border-blue-500 text-blue-600')
                    : (isDark ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Challenges Grid / Loading / Empty State */}
        {loading ? (
          <div className="text-center py-12">
            <div role="status" className="flex justify-center items-center">
               <svg aria-hidden="true" className={`w-10 h-10 mr-2 ${isDark ? 'text-gray-600' : 'text-gray-200'} animate-spin ${isDark ? 'dark:text-gray-500' : ''} fill-blue-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.189T5 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
               </svg>
               <span className="sr-only">Loading...</span>
            </div>
            <p className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading challenges...
            </p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} strokeWidth={1.5} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No {activeTab} challenges available right now.
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Check back later or explore other sections!
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
            activeTab === 'upcoming' ? 'lg:grid-cols-3' : ''
          }`}>
            {filteredChallenges.map(renderChallengeCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;