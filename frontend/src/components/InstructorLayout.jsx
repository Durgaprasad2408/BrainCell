import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Library,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  MessageCircle,
  UserCircle
} from 'lucide-react';

const InstructorLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/instructor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/instructor/challenges', label: 'Challenges', icon: Target },
    { path: '/instructor/library', label: 'Library Resources', icon: Library },
    { path: '/instructor/learning', label: 'Learning Content', icon: BookOpen },
    { path: '/instructor/queries', label: 'Queries', icon: MessageCircle },
    { path: '/instructor/profile', label: 'Profile', icon: UserCircle }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Mobile Menu Button (Open Sidebar) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-4 left-4 z-60 lg:hidden p-2 rounded-lg ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } shadow-lg`}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'Instructor Panel'}
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`lg:hidden p-2 rounded-lg ${
                  isDark ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Content Management
            </p>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                      active
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="flex-1 font-medium text-left">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isDark
                  ? 'text-red-400 hover:bg-red-900/20'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 font-medium text-left">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 pb-4 pt-16 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;
