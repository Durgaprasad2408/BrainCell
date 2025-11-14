import React from 'react';
// 1. Import useTheme
import { useTheme } from '../contexts/ThemeContext'; // <-- Adjust path if needed

const InputPanel = ({ title, children, className = "" }) => {
  // 2. Get isDark state
  const { isDark } = useTheme(); 

  return (
    // 3. Apply isDark logic
    <div className={`rounded-lg shadow-lg border ${className} ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export const InputField = ({ label, value, onChange, placeholder, type = "text", className = "" }) => {
  // 2. Get isDark state
  const { isDark } = useTheme();

  return (
    <div className={`mb-4 ${className}`}>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // 3. Apply isDark logic and fix focus ring color
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
        }`}
      />
    </div>
  );
};

export const TextAreaField = ({ label, value, onChange, placeholder, rows = 4, className = "" }) => {
  // 2. Get isDark state
  const { isDark } = useTheme();

  return (
    <div className={`mb-4 ${className}`}>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        // 3. Apply isDark logic and fix focus ring color
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
          isDark
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
        }`}
      />
    </div>
  );
};

export const SelectField = ({ label, value, onChange, options, className = "" }) => {
  // 2. Get isDark state
  const { isDark } = useTheme();

  return (
    <div className={`mb-4 ${className}`}>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // 3. Apply isDark logic and fix focus ring color
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InputPanel;