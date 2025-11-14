import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Users,
  Target,
  BookOpen,
  GraduationCap,
  Loader
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

// --- Import your existing services and axios ---
import axios from 'axios';
import * as challengeService from '../../api/challengeService';
import { getResourceStats } from '../../api/resourceService';
import * as subjectService from '../../api/subjectService';


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

// --- REAL API FOR CHARTS ---
const fetchChartData = async (type) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    // Get API URL from .env
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    let endpoint;
    switch (type) {
      case 'users':
        endpoint = '/auth/users/chart-data';
        break;
      case 'challenges':
        endpoint = '/challenges/chart-data';
        break;
      case 'resources':
        endpoint = '/resources/chart-data';
        break;
      case 'subjects':
        endpoint = '/subjects/chart-data';
        break;
      default:
        throw new Error(`Unknown chart type: ${type}`);
    }

    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${type} chart data:`, error);
    // Fallback to empty data
    return { labels: [], datasets: [] };
  }
};

// --- CHART DISPLAY COMPONENT ---
// (This component remains the same)
const ChartDisplay = ({ chartType, isDark }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchChartData(chartType);
        setChartData(data);
      } catch (err) {
        setError('Failed to load chart data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [chartType]); // Re-fetch when chartType changes

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
        display: true,
        text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Trends`,
        color: isDark ? '#ffffff' : '#111827',
        font: {
          size: 18,
        },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        {error}
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  return <Line options={options} data={chartData} />;
};


// --- MAIN DASHBOARD COMPONENT ---

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({ totalUsers: 0, totalChallenges: 0, totalResources: 0, totalSubjects: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('users'); // 'users', 'challenges', or 'resources'
  
  // Get API URL from .env
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        // --- Create all promises ---
        
        // 1. Fetch Users (from UserManagement.jsx logic)
        const userPromise = axios.get(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 2. Fetch Challenges (from ChallengeManagement.jsx logic)
        const challengePromise = challengeService.getAllChallenges();

        // 3. Fetch Resource Stats (from LibraryManagement.jsx logic)
        const resourcePromise = getResourceStats();

        // 4. Fetch Subjects
        const subjectPromise = subjectService.getAllSubjects();

        // --- Wait for all promises to resolve ---
        const [
          userResponse,
          challengeResponse,
          resourceResponse,
          subjectResponse
        ] = await Promise.all([
          userPromise,
          challengePromise,
          resourcePromise,
          subjectPromise
        ]);

        // --- Set the state with real data ---
        setStats({
          totalUsers: userResponse.data.users?.length || 0,
          totalChallenges: challengeResponse.data?.length || 0,
          totalResources: resourceResponse.data?.totalResources || 0,
          totalSubjects: subjectResponse.data?.length || 0,
        });

      } catch (err) {
        setError('Failed to load dashboard stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [API_URL]); // Rerun if API_URL changes

  const statsConfig = [
    {
      id: 'users',
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue'
    },
    {
      id: 'challenges',
      label: 'Challenges',
      value: stats.totalChallenges,
      icon: Target,
      color: 'green'
    },
    {
      id: 'resources',
      label: 'Library Resources',
      value: stats.totalResources,
      icon: BookOpen,
      color: 'purple'
    },
    {
      id: 'subjects',
      label: 'Subjects',
      value: stats.totalSubjects,
      icon: GraduationCap,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
      purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
      orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Dashboard Overview
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeChart === stat.id;
          return (
            <div
              key={stat.id}
              onClick={() => setActiveChart(stat.id)}
              className={`${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-xl p-6 border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                isActive 
                  ? (isDark ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-500') 
                  : (isDark ? 'hover:border-gray-600' : 'hover:border-gray-300')
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {/* Removed static 'change' text */}
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

      {error && (
        <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
          {error}
        </div>
      )}

      {/* --- DYNAMIC CHART AREA --- */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div
          className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-xl p-6 border shadow-sm min-h-[400px]`}
        >
          <ChartDisplay chartType={activeChart} isDark={isDark} />
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;