// src/pages/Students/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {Trophy, Target, TrendingUp, Award, CheckCircle2, Clock, Flame, BookOpen, ChevronRight, Star, Brain, Zap, Loader2, Info, User} from 'lucide-react';

// --- Use ONLY the services you provided ---
import * as subjectService from '../../api/subjectService';
import * as challengeService from '../../api/challengeService';
import * as lessonService from '../../api/lessonService';

const Dashboard = () => {
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // --- State Variables ---
  const [dynamicStats, setDynamicStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0,
    rank: 'Beginner',
    averageScore: 0,
    completedChallenges: 0
  });
  
  const [learningProgress, setLearningProgress] = useState([]);
  // Upcoming Challenges state REMOVED
  // const [upcomingChallenges, setUpcomingChallenges] = useState([]); 

const [recentScores, setRecentScores] = useState([]);
const [achievements, setAchievements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Helper Functions ---
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // --- Fetch Data (Optimized) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setError("Please log in to view your dashboard.");
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Fetch dynamic student stats
        const statsRes = await challengeService.getStudentStats();
        if (statsRes.success) {
          setDynamicStats(statsRes.data);
        }

        // Fetch recent scores
        const recentScoresRes = await challengeService.getStudentRecentScores();
        if (recentScoresRes.success) {
          setRecentScores(recentScoresRes.data);
        }

        // Fetch achievements
        const achievementsRes = await challengeService.getStudentAchievements();
        if (achievementsRes.success) {
          setAchievements(achievementsRes.data);
        }

        // Only fetching enrolled subjects now
        const enrolledSubjectsRes = await subjectService.getEnrolledSubjects();
        
        // 1. Learning Progress
        if (enrolledSubjectsRes.success && enrolledSubjectsRes.data) {
          const subjects = enrolledSubjectsRes.data;
          const savedProgress = localStorage.getItem('learning-progress');
          const completedItems = savedProgress ? JSON.parse(savedProgress) : {};

          const progressPromises = subjects.map(async (subject) => {
            try {
              const lessonsRes = await lessonService.getAllLessons({ subject: subject.name });
              const subjectLessons = lessonsRes.data || [];
              const totalLessons = subjectLessons.length;
              const completedLessons = subjectLessons.filter(lesson => completedItems[lesson._id]).length;
              return {
                ...subject,
                totalLessons,
                completedLessons,
              };
            } catch (lessonError) {
              console.error(`Failed to fetch lessons for ${subject.name}:`, lessonError);
              return { ...subject, totalLessons: 0, completedLessons: 0 };
            }
          });

          const subjectsWithProgress = await Promise.all(progressPromises);
          setLearningProgress(subjectsWithProgress);

        } else {
          console.error("Failed to fetch enrolled subjects:", enrolledSubjectsRes.message);
          setLearningProgress([]);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Check if the error is specifically an authorization error
        if (err.response && err.response.status === 403) {
             setError("You are not authorized to view some parts of the dashboard.");
        } else {
            setError(err.message || 'Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className={`mt-3 text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading your student dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-8 rounded-xl shadow-xl max-w-lg text-center ${isDark ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'}`}>
          <Zap className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Render Dashboard ---
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
<div className="mb-8">
    <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {user?.name ? `${user.name}'s Dashboard` : 'Your Dashboard'}
    </h1>
    <p className={`mt-1 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Track your learning progress and challenge stats.
    </p>
</div>

          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Challenges Completed - Dynamic */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <Target className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dynamicStats.completedChallenges}
                </span>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Challenges Completed</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Keep practicing!</p>
            </div>

            {/* Day Streak - Dynamic */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                  <Flame className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dynamicStats.currentStreak}
                </span>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Day Streak</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best: {dynamicStats.bestStreak} days</p>
            </div>

            {/* Total Points - Dynamic */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <Trophy className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dynamicStats.totalPoints}
                </span>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Total Points</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{dynamicStats.rank}</p>
            </div>

            {/* Average Score - Dynamic */}
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <TrendingUp className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dynamicStats.averageScore}%
                </span>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Avg Score</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overall</p>
            </div>
          </div>

        {/* --- Learning Progress (Dynamic) - NOW FULL WIDTH --- */}
        {/* Changed grid from lg:grid-cols-3 to lg:grid-cols-1 to be full width */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            {/* Learning Progress Section - Now spanning full width */}
            <div className="lg:col-span-1">
                 <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Subject Progress
                </h2>
                <BookOpen className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>

              {learningProgress.length > 0 ? (
                <div className="space-y-6">
                  {learningProgress.map((subject) => {
                    const progressPercent = subject.totalLessons > 0
                      ? Math.round((subject.completedLessons / subject.totalLessons) * 100)
                      : 0;
                    return (
                        <div key={subject._id}>
                             <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {subject.name}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {subject.completedLessons}/{subject.totalLessons} lessons
                                </span>
                                </div>
                                <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {progressPercent}% complete (from local)
                                </span>
                            </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enroll in subjects and start learning to see your progress!
                </p>
              )}
            </div>
          </div>
        {/* The Upcoming Challenges section is now entirely removed from the grid structure */}
        </div>

        {/* --- Recent Scores (Static) & Achievements (Static) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Scores Section */}
<div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
<div className="flex items-center justify-between mb-6">
  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
    Recent Test Scores
  </h2>
  <Brain className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
</div>

{recentScores.length > 0 ? (
    <div className="space-y-3">
    {recentScores.map((submission) => (
        <div
        key={submission._id}
        className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        >
        <div className="flex-1">
            <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'} mb-1`}>
            {submission.challenge?.title || 'Challenge Title'}
            </h3>
            <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                {submission.challenge?.category || 'Category'}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(submission.submittedAt)}
            </span>
            </div>
            </div>
        <div className="text-right ml-4">
            <div className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
            {submission.score}%
            </div>
        </div>
        </div>
    ))}
    </div>
) : (
    <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No recent scores available.</p>
)}
            </div>

{/* Achievements Section */}
<div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
<div className="flex items-center justify-between mb-6">
  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
    Achievements 🏆
  </h2>
  <Award className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
</div>

 {achievements.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {achievements.map((achievement) => (
        <div
        key={achievement._id}
        className={`p-4 rounded-lg border-2 transition-all text-center ${
            achievement.isUnlocked
            ? `${isDark ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-600/50' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'}`
            : `${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'} opacity-60`
        }`}
         title={achievement.isUnlocked ? `Unlocked: ${formatDate(achievement.unlockedDate)}` : achievement.description}
        >
            <div className="text-3xl mb-2">
                {achievement.icon || '🏅'}
            </div>
            <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                {achievement.name}
            </h3>
             {!achievement.isUnlocked && (
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                </p>
            )}
            {achievement.isUnlocked && achievement.unlockedDate && (
                <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(achievement.unlockedDate)}
                </span>
                </div>
            )}
        </div>
    ))}
    </div>
 ) : (
     <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No achievements yet.</p>
 )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;