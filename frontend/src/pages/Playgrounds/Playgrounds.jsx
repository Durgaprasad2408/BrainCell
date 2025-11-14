import React from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Shuffle,
  ArrowRightLeft,
  FileText,
  Cpu,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Playground = () => {
  const { isDark } = useTheme();

  const topics = [
    // ... (your topics array is unchanged)
    {
      id: 'dfa-simulator',
      title: 'DFA Simulator',
      description: 'Simulate Deterministic Finite Automata with step-by-step visualization',
      icon: GitBranch,
      color: 'bg-blue-500',
      path: '/student/playgrounds/dfa-simulator'
    },
    {
      id: 'nfa-simulator',
      title: 'NFA Simulator',
      description: 'Simulate Non-deterministic Finite Automata with parallel state tracking',
      icon: Shuffle,
      color: 'bg-purple-500',
      path: '/student/playgrounds/nfa-simulator'
    },
    {
      id: 'regex-to-dfa',
      title: 'Regex → DFA Converter',
      description: 'Convert regular expressions to DFA using Thompson\'s construction',
      icon: ArrowRightLeft,
      color: 'bg-green-500',
      path: '/student/playgrounds/regex-to-dfa'
    },
    {
      id: 'nfa-to-dfa',
      title: 'NFA to DFA',
      description: 'Convert NFA to DFA using subset construction algorithm',
      icon: ArrowRight,
      color: 'bg-orange-500',
      path: '/student/playgrounds/nfa-to-dfa'
    },
    {
      id: 'dfa-to-nfa',
      title: 'DFA to NFA',
      description: 'Convert DFA to equivalent NFA representation',
      icon: Zap,
      color: 'bg-pink-500',
      path: '/student/playgrounds/dfa-to-nfa'
    },
    {
      id: 'cfg-parser',
      title: 'CFG Parser',
      description: 'Parse Context-Free Grammars and generate parse trees',
      icon: FileText,
      color: 'bg-indigo-500',
      path: '/student/playgrounds/cfg-parser'
    },
    {
      id: 'turing-machine',
      title: 'Turing Machine Simulator',
      description: 'Simulate Turing Machines with tape visualization and step execution',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/turing-machine'
    },
    {
      id: 'chomsky-hierarchy',
      title: 'Chomsky Hierarchy',
      description: 'Simulate Turing Machines with tape visualization and step execution',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/chomsky-hierarchy'
    },
    {
      id: 'pda-simulator',
      title: '(Push Down Automata)PDA Simulator',
      description: 'Simulate Turing Machines with tape visualization and step execution',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/pda-simulator'
    },
    {
      id: 'moore-machine',
      title: 'Moore Machine Simulator',
      description: 'Simulate Turing Machines with tape visualization and step execution',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/moore-machine'
    },
    {
      id: 'mealy-machine',
      title: 'Mealy Machine Simulator',
      description: 'Simulate Turing Machines with tape visualization and step execution',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/mealy-machine'
    },
    {
      id: 'mealy-to-moore',
      title: 'Mealy → Moore Converter',
      description: 'Convert Mealy machines to equivalent Moore machines',
      icon: Cpu,
      color: 'bg-red-500',
      path: '/student/playgrounds/mealy-to-moore'
    },
    {
      id: 'moore-to-mealy',
      title: 'Moore → Mealy Converter',
      description: 'Convert Moore machines to equivalent Mealy machines',
      icon: Cpu,
      color: 'bg-orange-500',
      path: '/student/playgrounds/moore-to-mealy'
    },
    {
      id: 'pumping-lemma',
      title: 'Pumping Lemma Visualizer',
      description: 'Interactive tool for testing and visualizing pumping lemmas for regular and context-free languages',
      icon: Zap,
      color: 'bg-teal-500',
      path: '/student/playgrounds/pumping-lemma'
    },
  ];

  return (
    <div className={`animate-fade-in pt-20 px-4 sm:px-8 md:px-16 lg:px-36 transition-colors duration-200 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Hero Section */}
        <div className="text-center m-4 sm:m-6 md:m-8 lg:m-12">
          <h1 className={`text-4xl font-bold mb-4 transition-colors duration-200 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Theory of Computation Playground
          </h1>
          <p className={`text-xl max-w-3xl mx-auto transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Interactive tools for learning and visualizing fundamental concepts in theoretical computer science.
            Explore automata, grammars, and computational models with step-by-step animations.
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {topics.map((topic, index) => {
            const IconComponent = topic.icon;
            return (
              <Link
                key={topic.id}
                to={topic.path}
                className="group block animate-slide-up h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2 border h-full flex flex-col ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className={`${topic.color} p-3 rounded-lg mr-4 flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className={`text-xl font-semibold transition-colors flex-grow ${
                        isDark
                          ? 'text-white group-hover:text-blue-400'
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {topic.title}
                      </h3>
                    </div>
                    <p className={`leading-relaxed flex-grow ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {topic.description}
                    </p>
                    <div className={`mt-4 flex items-center font-medium flex-shrink-0 ${
                      isDark
                        ? 'text-blue-400'
                        : 'text-blue-600'
                    }`}>
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
    </div>
  );
};

export default Playground;