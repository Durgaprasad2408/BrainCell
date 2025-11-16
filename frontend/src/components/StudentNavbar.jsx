import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const StudentNavbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Learn', path: '/student/learning' },
    { name: 'Playground', path: '/student/playgrounds' },
    { name: 'Library', path: '/student/library' },
    { name: 'Challenges', path: '/student/challenges' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
      isScrolled && !isDark
        ? 'bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4'
        : isDark
          ? 'bg-gray-900/80 backdrop-blur-lg text-white py-3 md:py-4'
          : 'bg-transparent text-gray-900 py-3 md:py-4'
    }`}>
      <Link to={'/student/learning'} className="flex items-center gap-2">
        {isScrolled && !isDark ? (
          <img src="/logo.png" alt="logo" className="h-15 opacity-80" />
        ) : (
          <img src={isDark ? "/logo2.png" : "/logo.png"} alt="logo" className="h-12" />
        )}
      </Link>

      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link key={i} to={link.path} className="group flex flex-col gap-0.5">
            {link.name}
            <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300" />
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
              : isScrolled
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                : 'bg-white/20 hover:bg-white/30 text-gray-700'
          }`}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
              : isScrolled
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                : 'bg-white/20 hover:bg-white/30 text-gray-700'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isDark
                  ? 'hover:bg-gray-700'
                  : isScrolled
                    ? 'hover:bg-gray-200'
                    : 'hover:bg-white/20'
              }`}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.email)}`;
                }}
              />
              <span className="text-sm hidden lg:block">{user.name}</span>
            </button>
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Link
                  to="/student/profile"
                  onClick={() => setShowUserMenu(false)}
                  className={`block px-4 py-2 text-sm ${
                    isDark
                      ? 'text-gray-200 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/student/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className={`block px-4 py-2 text-sm ${
                    isDark
                      ? 'text-gray-200 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    isDark
                      ? 'text-red-400 hover:bg-gray-700'
                      : 'text-red-600 hover:bg-gray-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden fixed top-16 left-0 w-full shadow-lg z-40 border-t ${
          isDark
            ? 'bg-gray-900 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col py-4">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-gray-200 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default StudentNavbar;
