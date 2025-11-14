import React from 'react';
import { useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext'; // <-- 1. Import useTheme

const WorkflowPanel = ({ title, steps, currentStep, className = "" }) => {
  const currentStepRef = useRef(null);
  const containerRef = useRef(null);
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Auto-scroll to keep current step at the top of the visible area
  useEffect(() => {
    if (currentStepRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentElement = currentStepRef.current;
      
      const containerPaddingTop = 16; // (16px from p-4 class)
      
      const elementTop = currentElement.offsetTop - containerPaddingTop;
      const scrollTop = Math.max(0, elementTop);
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [currentStep, steps.length]);

  const getStepIcon = (step, index) => {
    const isCurrentStep = index === currentStep;
    const isCompletedStep = index < currentStep;
    const isFutureStep = index > currentStep;
    const isFinalStep = step.final;
    
    // For final steps, check the result
    if (isFinalStep && isCurrentStep) {
      if (step.error || step.accepted === false || step.success === false) {
        return <XCircle className="w-5 h-5 text-red-500" />;
      } else if (step.accepted === true || step.success === true) {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      } else {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      }
    }
    
    if (isCompletedStep) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (isCurrentStep) {
      if (step.error) {
        return <XCircle className="w-5 h-5 text-red-500" />;
      }
      return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
    
    // 3. Apply isDark logic
    if (isFutureStep) {
      return (
        <div className={`w-5 h-5 rounded-full border-2 ${
          isDark
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-gray-50'
        }`} />
      );
    }

    return (
      <div className={`w-5 h-5 rounded-full border-2 ${
        isDark ? 'border-gray-600' : 'border-gray-300'
      }`} />
    );
  };

  const getStepStatus = (step, index) => {
    const isCurrentStep = index === currentStep;
    const isCompletedStep = index < currentStep;
    const isFutureStep = index > currentStep;
    const isFinalStep = step.final;
    
    if (isFinalStep && isCurrentStep) {
      if (step.error || step.accepted === false || step.success === false) {
        return 'rejected';
      } else if (step.accepted === true || step.success === true) {
        return 'completed';
      } else {
        return 'completed';
      }
    }
    
    if (isCompletedStep) return 'completed';
    if (isCurrentStep) {
      if (step.error) return 'rejected';
      return 'active';
    }
    if (isFutureStep) return 'future';
    return 'pending';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Done';
      case 'active': return 'Active';
      case 'rejected': return 'Failed';
      case 'future': return 'Upcoming';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  // 4. Refactor getStatusColor to use isDark
  const getStatusColor = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    if (isDark) {
      switch (status) {
        case 'completed': return `${baseClasses} text-green-400 bg-green-900/20`;
        case 'active': return `${baseClasses} text-blue-400 bg-blue-900/20`;
        case 'rejected': return `${baseClasses} text-red-400 bg-red-900/20`;
        case 'future': return `${baseClasses} text-gray-500 bg-gray-900/10`;
        default: return `${baseClasses} text-gray-400 bg-gray-900/20`;
      }
    } else {
      switch (status) {
        case 'completed': return `${baseClasses} text-green-600 bg-green-50`;
        case 'active': return `${baseClasses} text-blue-600 bg-blue-50`;
        case 'rejected': return `${baseClasses} text-red-600 bg-red-50`;
        case 'future': return `${baseClasses} text-gray-400 bg-gray-50`;
        default: return `${baseClasses} text-gray-600 bg-gray-50`;
      }
    }
  };

  return (
    // 3. Apply isDark logic to main panel
    <div className={`rounded-lg shadow-lg border h-full flex flex-col ${className} ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        {steps.length > 0 && currentStep >= 0 && (
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
          </div>
        )}
      </div>
      <div ref={containerRef} className="p-4 flex-1 overflow-y-auto workflow-panel-scroll">
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No steps to display. Run the simulation to see the workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step, index);
              const isCurrentStep = index === currentStep;
              const isFutureStep = index > currentStep;
              
              return (
                <div
                  ref={isCurrentStep ? currentStepRef : null}
                  key={index}
                  // 3. Apply isDark logic to step container
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isCurrentStep 
                      ? status === 'rejected' 
                        ? isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                        : isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                      : isFutureStep
                        ? isDark ? 'opacity-50 bg-gray-900/10' : 'opacity-50 bg-gray-50/50' // Using bg-gray-50/50 for light mode
                        : isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step, index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {/* 3. Apply isDark logic to step title */}
                      <h4 className={`text-sm font-medium ${
                        isCurrentStep 
                          ? status === 'rejected'
                            ? isDark ? 'text-red-100' : 'text-red-900'
                            : isDark ? 'text-blue-100' : 'text-blue-900'
                          : isFutureStep
                            ? isDark ? 'text-gray-500' : 'text-gray-400'
                            : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h4>
                      <span className={getStatusColor(status)}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                    {/* 3. Apply isDark logic to step description */}
                    <p className={`text-sm ${
                      isCurrentStep 
                        ? status === 'rejected'
                          ? isDark ? 'text-red-300' : 'text-red-700'
                          : isDark ? 'text-blue-300' : 'text-blue-700'
                        : isFutureStep
                          ? isDark ? 'text-gray-500' : 'text-gray-400'
                          : isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                    {step.details && (
                      // 3. Apply isDark logic to step details
                      <p className={`text-xs mt-1 ${
                        isCurrentStep 
                          ? status === 'rejected'
                            ? isDark ? 'text-red-400' : 'text-red-600'
                            : isDark ? 'text-blue-400' : 'text-blue-600'
                          : isFutureStep
                            ? isDark ? 'text-gray-500' : 'text-gray-400'
                            : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {step.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPanel;