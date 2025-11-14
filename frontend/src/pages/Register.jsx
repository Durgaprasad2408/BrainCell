import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // Use isDark
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate('/student/learning');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  if (authLoading) {
    // Apply isDark logic
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
    WebkitTextFillColor: isDark ? 'white' : 'black',
  };


  return (
    // Apply isDark logic
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 to-gray-100'
    }`}>
      {/* Apply isDark logic */}
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
        {/* Apply isDark logic */}
        <div className={`rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sign up to get started</p>
          </div>

          {error && (
            // Apply isDark logic
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
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                // ***** ADDED AUTOFILL STYLE & UPDATED LIGHT THEME STYLES *****
                style={autofillOverrideStyle}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                    : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // black border, white bg, black text
                }`}
                placeholder="John Doe"
              />
            </div>

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
                // ***** ADDED AUTOFILL STYLE & UPDATED LIGHT THEME STYLES *****
                style={autofillOverrideStyle}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                    : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // black border, white bg, black text
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
                  minLength={8}
                  // ***** ADDED AUTOFILL STYLE & UPDATED LIGHT THEME STYLES *****
                  style={autofillOverrideStyle}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all pr-12 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                      : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // black border, white bg, black text
                  }`}
                  placeholder="At least 8 characters with uppercase, lowercase, number, special"
                />
                {/* Apply isDark logic */}
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

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  // ***** ADDED AUTOFILL STYLE & UPDATED LIGHT THEME STYLES *****
                  style={autofillOverrideStyle}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all pr-12 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-400'
                      : 'border-black bg-white text-black placeholder-gray-500 focus:ring-blue-500' // black border, white bg, black text
                  }`}
                  placeholder="Confirm your password"
                />
                {/* Apply isDark logic */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Apply isDark logic */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {/* Apply isDark logic */}
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className={`hover:underline font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
             {/* Apply isDark logic */}
            <Link to="/" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;