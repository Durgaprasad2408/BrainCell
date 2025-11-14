import React from 'react';
import { useTheme } from '../contexts/ThemeContext'; // <-- 1. Import useTheme (adjust path if needed)

const PlaygroundThemeWrapper = ({ children }) => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  return (
    // 3. Apply the dynamic theme logic
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {children}
    </div>
  );
};

export default PlaygroundThemeWrapper;