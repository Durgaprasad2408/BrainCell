import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, User } from 'lucide-react';
import logo from '/logo2.png';

const Navbar = () => {
    const location = useLocation();
    const isLearningPage = location.pathname === '/learning' || location.pathname.startsWith('/learning');
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const publicNavLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' }
    ];

    const authenticatedNavLinks = [
        { name: 'Learn', path: '/student/learning' },
        { name: 'Playground', path: '/student/playgrounds' },
        { name: 'Library', path: '/student/library' },
        { name: 'Practice', path: '/student/practice' },
        { name: 'Dashboard', path: '/student/dashboard' }
    ];

    const navLinks = user ? authenticatedNavLinks : publicNavLinks;

    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    React.useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 0);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show navbar on learning page
    if (isLearningPage) {
        return null;
    }

    return (
        <nav
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-300 z-50 ${
                isScrolled
                    ? 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg text-white py-3 md:py-4'
                    : 'bg-transparent text-white py-3 md:py-4'
            }`}
        >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="logo" className="h-12 md:h-15" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className="group flex flex-col gap-0.5 text-white hover:text-white/80 transition-colors"
                    >
                        {link.name}
                        <div className="bg-white h-0.5 w-0 group-hover:w-full transition-all duration-300" />
                    </Link>
                ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">
                {user && (
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-all hover:bg-white/10"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                )}

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:bg-white/10"
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
                            <span className="text-sm font-medium">{user.name}</span>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                                <Link
                                    to="/student/profile"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/student/dashboard"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowUserMenu(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-2.5 rounded-full transition-all hover:opacity-80 font-medium"
                    >
                        Login
                    </Link>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                <svg
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="h-6 w-6 cursor-pointer text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium transition-all duration-500 z-40 ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    className={`absolute top-4 right-4 transition-colors ${isDark ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xl hover:text-gray-600 transition-colors"
                    >
                        {link.name}
                    </Link>
                ))}

                {user && (
                    <button
                        onClick={() => {
                            toggleTheme();
                            setIsMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                            isDark
                                ? 'border border-gray-700 hover:bg-gray-800'
                                : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {isDark ? 'Light' : 'Dark'} Mode
                    </button>
                )}

                {user ? (
                    <>
                        <Link
                            to="/student/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg hover:text-gray-600 transition-colors"
                        >
                            Profile
                        </Link>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                logout();
                            }}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-full transition-all hover:bg-red-700 font-medium"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-black text-white px-8 py-2.5 rounded-full transition-all hover:bg-gray-800 font-medium"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;