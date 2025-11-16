import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const UserManagementStats = ({ users, selectedRole, onRoleSelect }) => {
  const { isDark } = useTheme();

  const studentCount = users.filter(u => u.role === 'user').length;
  const facultyCount = users.filter(u => u.role === 'instructor').length;

  const StatCard = ({ 
    title, 
    count, 
    icon, 
    isSelected,
    onClick,
    selectedColor,
    selectedTextColor
  }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-6 border transition-all ${
        isSelected
          ? isDark
            ? `${selectedColor} border-gray-700 ring-2 ring-white`
            : `${selectedColor} border-gray-200 ring-2 ring-black`
          : isDark
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${
            isSelected
              ? selectedTextColor
              : isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {count}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
          Total Users
        </p>
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {users.length}
        </p>
      </div>
      
      <StatCard
        title="Students"
        count={studentCount}
        icon="👨‍🎓"
        isSelected={selectedRole === 'student'}
        onClick={() => onRoleSelect('student')}
        selectedColor={isDark ? 'bg-blue-900/30' : 'bg-blue-50'}
        selectedTextColor={isDark ? 'text-blue-400' : 'text-blue-700'}
      />
      
      <StatCard
        title="Faculty"
        count={facultyCount}
        icon="👨‍🏫"
        isSelected={selectedRole === 'faculty'}
        onClick={() => onRoleSelect('faculty')}
        selectedColor={isDark ? 'bg-purple-900/30' : 'bg-purple-50'}
        selectedTextColor={isDark ? 'text-purple-400' : 'text-purple-700'}
      />
    </div>
  );
};

export default UserManagementStats;