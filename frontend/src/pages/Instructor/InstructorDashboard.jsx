import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  BarChart3,
  Loader,
  Target,
  File
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Import services
import * as lessonService from '../../api/lessonService';
import * as challengeService from '../../api/challengeService';
import * as resourceService from '../../api/resourceService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart Display Component
const ChartDisplay = ({ chartData, isDark }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: false, // Hide title since we have it above the chart
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Lessons Created',
        data: chartData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
};

const InstructorDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalLessons: 0,
    publishedLessons: 0,
    draftLessons: 0,
    totalChallenges: 0,
    publishedChallenges: 0,
    draftChallenges: 0,
    totalResources: 0,
    publishedResources: 0,
    draftResources: 0,
    lessonChart: { labels: [], data: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('all');

  // Get API URL from .env
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        // Fetch instructor stats for lessons, challenges, and resources
        const [lessonStatsResponse, challengeStatsResponse, resourceStatsResponse] = await Promise.all([
          lessonService.getInstructorStats(chartPeriod),
          challengeService.getInstructorChallengeStats(),
          resourceService.getInstructorResourceStats()
        ]);

        setStats({
          ...lessonStatsResponse.data,
          ...challengeStatsResponse.data,
          ...resourceStatsResponse.data
        });

        // Fetch recent lessons created by instructor
        const lessonsResponse = await lessonService.getAllLessons();
        const instructorLessons = lessonsResponse.data.filter(lesson =>
          lesson.createdBy && lesson.createdBy._id === JSON.parse(atob(token.split('.')[1])).id
        );
        setRecentLessons(instructorLessons.slice(0, 5)); // Get last 5 lessons

      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [API_URL, chartPeriod]);

  const statsConfig = [
    {
      id: 'totalLessons',
      label: 'Total Lessons',
      value: stats.totalLessons,
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'totalChallenges',
      label: 'Total Challenges',
      value: stats.totalChallenges,
      icon: Target,
      color: 'purple'
    },
    {
      id: 'totalResources',
      label: 'Total Resources',
      value: stats.totalResources,
      icon: File,
      color: 'blue'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
      yellow: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
      purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className={`mt-3 text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading your instructor dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-8 rounded-xl shadow-xl max-w-lg text-center ${isDark ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'}`}>
          <BarChart3 className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-20 pb-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Instructor Dashboard
          </h1>
          <p className={`mt-1 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your teaching progress and lesson statistics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } rounded-xl p-6 border shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {loading ? <Loader className="w-6 h-6 animate-spin" /> : stat.value}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div
            className={`${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-xl p-6 border shadow-sm min-h-[400px]`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Lessons Created
              </h2>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="1w">Last Week</option>
                <option value="1m">Last Month</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <ChartDisplay chartData={stats.lessonChart} isDark={isDark} />
          </div>

          {/* Recent Lessons */}
          <div
            className={`${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-xl p-6 border shadow-sm`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Lessons
              </h2>
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>

            {recentLessons.length > 0 ? (
              <div className="space-y-4">
                {recentLessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'} mb-1`}>
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          lesson.status === 'Published'
                            ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                            : (isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                        }`}>
                          {lesson.status}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {lesson.subject} • {lesson.module}
                        </span>
                      </div>
                    </div>
                    <div className={`text-right ml-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="text-sm">
                        {formatDate(lesson.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No lessons created yet. Start creating your first lesson!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;