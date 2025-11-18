import React from 'react';

const ItemsPerPageSelector = ({ value, onChange, isDark, label = "Show:" }) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`px-3 py-1 text-sm border rounded-md ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
        <option value={20}>20</option>
        <option value={25}>25</option>
      </select>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        per page
      </span>
    </div>
  );
};

export default ItemsPerPageSelector;