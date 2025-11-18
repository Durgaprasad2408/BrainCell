import React from 'react';
import { BookOpen } from 'lucide-react';

const WelcomeMessage = ({ subject, isDark }) => {
  return (
    <div className={`text-center py-12 transition-colors duration-200 ${
      isDark ? 'text-gray-400' : 'text-gray-600'
    }`}>
      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-semibold mb-2">Welcome to {subject?.name}</h2>
      <p>Select a lesson from the sidebar to get started</p>
    </div>
  );
};

export default WelcomeMessage;