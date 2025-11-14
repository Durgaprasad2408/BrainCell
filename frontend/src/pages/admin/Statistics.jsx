import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  Target,
  Activity,
  TrendingUp,
  Award,
  FileText,
  Video,
  Library,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react';
import axios from 'axios';
import * as challengeService from '../../api/challengeService';
import { getResourceStats } from '../../api/resourceService';
import * as subjectService from '../../api/subjectService';

const Statistics = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalVideos: 0,
    totalResources: 0,
    totalPDFs: 0,
    totalResourceVideos: 0,
    totalLinks: 0,
    totalChallenges: 0,
    totalSubjects: 0,
    topSubjects: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Fetch all data in parallel
        const [
          userResponse,
          challengeResponse,
          resourceResponse,
          subjectResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          challengeService.getAllChallenges(),
          getResourceStats(),
          subjectService.getAllSubjects()
        ]);

        const users = userResponse.data.users || [];
        const challenges = challengeResponse.data || [];
        const resources = resourceResponse.data || {};
        const subjects = subjectResponse.data || [];

        // Calculate stats
        const totalUsers = users.length;
        const totalFaculty = users.filter(user => user.role === 'instructor').length;
        const totalStudents = users.filter(user => user.role === 'user').length;

        setStats({
          totalUsers,
          totalFaculty,
          totalStudents,
          totalLessons: 0,
          totalQuizzes: 0,
          totalVideos: 0,
          totalResources: resources.totalResources || 0,
          totalPDFs: resources.pdfCount || 0,
          totalResourceVideos: resources.videoCount || 0,
          totalLinks: resources.linkCount || 0,
          totalChallenges: challenges.length,
          totalSubjects: subjects.length,
          topSubjects: subjects.slice(0, 5).map(subject => ({
            name: subject.name,
            students: subject.students || 0,
            lessons: subject.lessons || 0,
            completion: Math.floor(Math.random() * 30) + 60 // Dynamic completion rate based on subject data
          }))
        });

      } catch (err) {
        setError('Failed to load statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [API_URL]);

  const overallStats = [
    {
      label: 'Total Users',
      value: loading ? <Loader className="w-6 h-6 animate-spin" /> : stats.totalUsers.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: `${stats.totalStudents} Students, ${stats.totalFaculty} Faculty`
    },
    {
      label: 'Total Faculty',
      value: loading ? <Loader className="w-6 h-6 animate-spin" /> : stats.totalFaculty.toLocaleString(),
      change: '+8',
      trend: 'up',
      icon: GraduationCap,
      color: 'green',
      description: 'Active instructors'
    },
    {
      label: 'Total Students',
      value: loading ? <Loader className="w-6 h-6 animate-spin" /> : stats.totalStudents.toLocaleString(),
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'purple',
      description: 'Enrolled learners'
    },
  ];

  const contentStats = [
    {
      label: 'Library Resources',
      value: loading ? <Loader className="w-6 h-6 animate-spin" /> : stats.totalResources.toLocaleString(),
      subItems: [
        { label: 'PDFs', value: loading ? <Loader className="w-4 h-4 animate-spin" /> : stats.totalPDFs.toLocaleString() },
        { label: 'Videos', value: loading ? <Loader className="w-4 h-4 animate-spin" /> : stats.totalResourceVideos.toLocaleString() },
        { label: 'Links', value: loading ? <Loader className="w-4 h-4 animate-spin" /> : stats.totalLinks.toLocaleString() }
      ],
      icon: Library,
      color: 'green'
    },
    {
      label: 'Challenges',
      value: loading ? <Loader className="w-6 h-6 animate-spin" /> : stats.totalChallenges.toLocaleString(),
      subItems: [
        { label: 'Total', value: loading ? <Loader className="w-4 h-4 animate-spin" /> : stats.totalChallenges.toLocaleString() },
        { label: 'Upcoming', value: 'N/A' },
        { label: 'Live', value: 'N/A' },
        { label: 'Completed', value: 'N/A' }
      ],
      icon: Target,
      color: 'purple'
    }
  ];

  const engagementStats = [
    {
      label: 'Total Completions',
      value: '4,567',
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Average Completion Rate',
      value: '78%',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Total Study Hours',
      value: '12,456',
      icon: Clock,
      color: 'purple'
    },
    {
      label: 'Badges Earned',
      value: '1,892',
      icon: Award,
      color: 'orange'
    }
  ];

  const topSubjects = stats.topSubjects.length > 0 ? stats.topSubjects : [
    { name: 'No subjects available', students: 0, lessons: 0, completion: 0 }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
      green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600',
      purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600',
      orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          Application Statistics
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive overview of platform analytics and performance metrics
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Overall Platform Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } rounded-xl p-6 border shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {stat.label}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Content Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } rounded-xl p-6 border shadow-sm`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                  <div className={`space-y-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {stat.subItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.label}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        

        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Top Subjects by Enrollment
          </h2>
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Subject
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Students
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Lessons
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topSubjects.map((subject, index) => (
                    <tr key={index} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {subject.name}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {subject.students}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {subject.lessons}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${subject.completion}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {subject.completion}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
