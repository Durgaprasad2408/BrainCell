import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Target, Clock, Play, CheckCircle } from 'lucide-react';

const ChallengeStats = ({ challenges }) => {
  const { isDark } = useTheme();

  // Calculate dynamic stats
  const now = new Date();
  const upcoming = challenges.filter(c => new Date(c.startDateTime) > now).length;
  const live = challenges.filter(c => {
    const start = new Date(c.startDateTime);
    const end = new Date(c.endDateTime);
    return start <= now && now <= end;
  }).length;
  const completed = challenges.filter(c => new Date(c.endDateTime) < now).length;

  const stats = [
    { label: 'Total Challenges', value: challenges.length, icon: Target, color: 'blue' },
    { label: 'Upcoming', value: upcoming, icon: Clock, color: 'purple' },
    { label: 'Live', value: live, icon: Play, color: 'green' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'yellow' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <div className="flex items-center gap-3">
              <IconComponent className={`w-8 h-8 text-${stat.color}-500`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChallengeStats;