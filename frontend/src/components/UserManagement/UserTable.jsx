import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const UserTable = ({ users, selectedRole, onEditUser, onDeleteUser, isDark }) => {
  const filteredUsers = users.filter(user => {
    const matchesRole =
      (selectedRole === 'student' && user.role === 'user') ||
      (selectedRole === 'faculty' && user.role === 'instructor');
    return matchesRole;
  });

  const getRoleBadge = (role) => {
    if (role === 'instructor') return isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
    if (role === 'admin') return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
  };

  const getRoleDisplay = (role) => {
    if (role === 'instructor') return 'Faculty';
    if (role === 'admin') return 'Admin';
    return 'Student';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                User
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Role
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Joined
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                {selectedRole === 'faculty' ? 'Subjects' : 'Progress'}
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.email)}`;
                      }}
                    />
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                    {getRoleDisplay(user.role)}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  {user.role === 'instructor' ? (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="font-medium">{user.subjects?.length || 0} subjects</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        {user.subjects?.slice(0, 2).join(', ')}
                        {user.subjects?.length > 2 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>-</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className={`p-2 rounded-lg ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      } transition-colors`}
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user)}
                      className={`p-2 rounded-lg ${
                        isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                      } transition-colors`}
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredUsers.length} {selectedRole === 'student' ? 'students' : 'faculty'}
        </p>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } transition-colors`}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } transition-colors`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;