import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const isPlaygrounds = location.pathname === '/playgrounds';
  const showBackLink = location.pathname.startsWith('/playgrounds/') && location.pathname !== '/playgrounds';

  // Get the current playground title based on the path
  const getPlaygroundTitle = useMemo(() => {
    const playgroundTitles = {
      '/playgrounds/dfa-simulator': 'DFA Simulator',
      '/playgrounds/nfa-simulator': 'NFA Simulator',
      '/playgrounds/regex-to-dfa': 'Regex → DFA Converter',
      '/playgrounds/nfa-to-dfa': 'NFA to DFA Converter',
      '/playgrounds/dfa-to-nfa': 'DFA to NFA Converter',
      '/playgrounds/cfg-parser': 'CFG Parser',
      '/playgrounds/turing-machine': 'Turing Machine Simulator',
      '/playgrounds/mealy-machine': 'Mealy Machine Simulator',
      '/playgrounds/moore-machine': 'Moore Machine Simulator',
      '/playgrounds/mealy-to-moore': 'Mealy → Moore Converter',
      '/playgrounds/moore-to-mealy': 'Moore → Mealy Converter',
      '/playgrounds/pda-simulator': 'Pushdown Automata (PDA) Simulator',
      '/playgrounds/chomsky-hierarchy': 'Chomsky Hierarchy Explorer',
      '/playgrounds/pumping-lemma': 'Pumping Lemma Visualizer'
    };
    return playgroundTitles[location.pathname] || '';
  }, [location.pathname]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isPlaygrounds ? "pt-14" : ""} `}>
      {/* Header */}
      {!isPlaygrounds ? 
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0  border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {showBackLink && (
                <Link
                  to="/playgrounds"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Playgrounds Dashboard</span>
                </Link>
              )}
              
              {/* Show playground title in header */}
              {getPlaygroundTitle && (
                <div className="flex items-center">
                  {showBackLink && <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-4" />}
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getPlaygroundTitle}
                  </h1>
                </div>
              )}
            </div>
          </div>
        </div>
      </header> : ""}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-3">
        {children}
      </main>
    </div>
  );
};

export default Layout;