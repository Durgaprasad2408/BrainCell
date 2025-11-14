import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // ... (useEffect remains the same)
    if (!authLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { replace: true });
      } else {
        navigate('/student/learning', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    // ... (handleSubmit remains the same)
     e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const userRole = result.user?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student/learning');
      }
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  if (authLoading) {
    // ... (loading state remains the same)
     return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Style to override browser autofill background
  const autofillOverrideStyle = {
    WebkitBoxShadow: `0 0 0 30px ${isDark ? '#374151' : 'white'} inset`, // #374151 is gray-700
    WebkitTextFillColor: isDark ? 'white' : 'black', // Ensure text color is correct on autofill
  };


  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-gray-100'
    }`}>
      {/* ... (theme toggle button remains the same) */}
       <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-full shadow-lg hover:shadow-xl transition-all ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </button>


      <div className="max-w-md w-full">
        <div className={`rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* ... (header remains the same) */}
           <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to your account</p>
          </div>


          {error && (
            // ... (error message remains the same)
             <div className={`mb-6 p-4 border rounded-lg ${
              isDark
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // ***** ADDED INLINE STYLE *****
                style={autofillOverrideStyle}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                    : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // Changed text to text-black
                }`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  // ***** ADDED INLINE STYLE *****
                  style={autofillOverrideStyle}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all pr-12 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                      : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // Changed text to text-black
                  }`}
                  placeholder="Enter your password"
                />
                {/* ... (show/hide button remains the same) */}
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* ... (submit button remains the same) */}
             <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* ... (Sign up and Back to Home links remain the same) */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;