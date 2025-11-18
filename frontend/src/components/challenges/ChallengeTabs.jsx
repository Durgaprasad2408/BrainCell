import React from 'react';

const ChallengeTabs = ({ activeTab, setActiveTab, isDark }) => {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className={`mb-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <nav className="-mb-px flex flex-wrap justify-center space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 font-medium text-sm border-b-2 transition-colors focus:outline-none ${
              activeTab === tab.id
                ? (isDark ? 'border-blue-400 text-blue-400' : 'border-blue-500 text-blue-600')
                : (isDark ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ChallengeTabs;