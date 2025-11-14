import React, { useState } from 'react';
import { Play, SkipForward, Download, RotateCcw, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext'; // <-- 1. Import useTheme

const PlaygroundLayout = ({ 
  children, 
  onRun, 
  onClear, 
  onStep, 
  onExport,
  isRunning = false,
  canStep = false,
  hasResults = false 
}) => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state
  const [isStepMode, setIsStepMode] = useState(false);
  const [showInput, setShowInput] = useState(true);

  const handleRun = () => {
    setIsStepMode(false);
    setShowInput(false); // Close input panel when run is clicked
    onRun();
  };

  const handleStep = () => {
    setIsStepMode(true);
    setShowInput(false); // Close input panel when step is clicked
    onStep();
  };

  const toggleInput = () => {
    setShowInput(!showInput);
  };

  const handleClear = () => {
    setShowInput(true); // Show input panel when clear is clicked
    onClear();
  };

  return (
    <div className="animate-fade-in w-full h-full mt-20 flex flex-col">
      {/* Control Panel */}
      {/* 3. Apply isDark logic to the panel */}
      <div className={`rounded-lg shadow-lg p-2 mb-3 border ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleInput}
            // 4. Fix button colors
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium text-white ${
              showInput 
                ? 'bg-blue-600 hover:bg-blue-700' // Active state (blue)
                : isDark
                  ? 'bg-gray-600 hover:bg-gray-700' // Inactive state (dark)
                  : 'bg-gray-500 hover:bg-gray-600' // Inactive state (light)
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Input</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            // 4. Fix button colors (primary -> blue)
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>

          <button
            onClick={handleStep}
            disabled={isRunning || !canStep}
            // 4. Fix button colors (secondary -> green)
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            title="Execute one step at a time to see detailed progression"
          >
            <SkipForward className="w-4 h-4" />
            <span>{isStepMode ? 'Next Step' : 'Step'}</span>
          </button>

          <button
            onClick={handleClear}
            disabled={isRunning}
            // 4. Fix button colors (gray with light/dark variants)
            className={`flex items-center space-x-2 px-4 py-2 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium ${
              isDark
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>

          {hasResults && onExport && (
            <button
              onClick={onExport}
              // (Orange is fine in both modes)
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium ml-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}

          {isRunning && (
            <div className="flex items-center space-x-2 ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {/* 3. Apply isDark logic to text */}
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {isStepMode ? 'Step Mode' : 'Running...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Input Panel - Only show when toggled */}
        {showInput && (
          <div className="lg:w-80 flex-shrink-0 overflow-y-auto">
            {React.Children.toArray(children)[0]}
          </div>
        )}
        
        {/* Visualization Panel - 60% on medium+ screens */}
        <div className={`flex-1 ${showInput ? 'lg:w-4/5' : 'lg:w-4/5'}`}>
          {React.Children.toArray(children)[1]}
        </div>
        
        {/* Workflow Panel - 35% on medium+ screens */}
        <div className={`${showInput ? 'lg:w-1/5' : 'lg:w-1/5'} flex-shrink-0 overflow-y-auto`}>
          {React.Children.toArray(children)[2]}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundLayout;