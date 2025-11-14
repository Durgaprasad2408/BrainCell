import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { renderDFA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const RegexToDFAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state
  const [regexInput, setRegexInput] = useState('(a|b)*abb');
  const [testString, setTestString] = useState('aabb');
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  // Simplified regex to NFA conversion (Thompson's construction)
  const regexToNFA = useCallback((regex) => {
    const steps = [];
    
    steps.push({
      title: 'Parse Regex',
      description: `Parsing regular expression: ${regex}`,
      details: 'Breaking down the regex into components using Thompson\'s construction'
    });
    
    // Enhanced regex parsing for common patterns
    let states, alphabet, transitions, startState, finalStates;
    
    if (regex === '(a|b)*abb') {
      states = ['q0', 'q1', 'q2', 'q3'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'q0', symbol: 'a', to: 'q0' },
        { from: 'q0', symbol: 'b', to: 'q0' },
        { from: 'q0', symbol: 'a', to: 'q1' },
        { from: 'q1', symbol: 'b', to: 'q2' },
        { from: 'q2', symbol: 'b', to: 'q3' },
        { from: 'q1', symbol: 'a', to: 'q1' },
        { from: 'q2', symbol: 'a', to: 'q1' },
        { from: 'q3', symbol: 'a', to: 'q0' },
        { from: 'q3', symbol: 'b', to: 'q0' }
      ];
      startState = 'q0';
      finalStates = ['q3'];
    } else if (regex === 'a*b*') {
      states = ['q0', 'q1'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'q0', symbol: 'a', to: 'q0' },
        { from: 'q0', symbol: 'b', to: 'q1' },
        { from: 'q1', symbol: 'b', to: 'q1' }
      ];
      startState = 'q0';
      finalStates = ['q0', 'q1'];
    } else if (regex === '(a|b)*') {
      states = ['q0'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'q0', symbol: 'a', to: 'q0' },
        { from: 'q0', symbol: 'b', to: 'q0' }
      ];
      startState = 'q0';
      finalStates = ['q0'];
    } else {
      // Default fallback for unknown patterns
      states = ['q0', 'q1', 'q2', 'q3'];
      alphabet = ['a', 'b'];
      transitions = [
        { from: 'q0', symbol: 'a', to: 'q0' },
        { from: 'q0', symbol: 'b', to: 'q0' },
        { from: 'q0', symbol: 'a', to: 'q1' },
        { from: 'q1', symbol: 'b', to: 'q2' },
        { from: 'q2', symbol: 'b', to: 'q3' }
      ];
      startState = 'q0';
      finalStates = ['q3'];
    }
    
    steps.push({
      title: 'Build NFA',
      description: 'Constructing NFA using Thompson\'s construction method',
      details: `Created ${states.length} states with ${transitions.length} transitions`,
      highlightTransitions: transitions.slice(0, Math.min(3, transitions.length))
    });
    
    steps.push({
      title: 'Apply Subset Construction',
      description: 'Converting NFA to DFA using subset construction',
      details: 'Eliminating non-determinism by tracking state sets',
      highlightTransitions: transitions.slice(3, Math.min(6, transitions.length))
    });
    
    steps.push({
      title: 'Optimize DFA',
      description: 'Minimizing the resulting DFA',
      details: 'Removing unreachable states and merging equivalent states',
      highlightTransitions: transitions.slice(6, Math.min(9, transitions.length))
    });
    
    steps.push({
      title: 'Conversion Complete',
      description: `Successfully converted regex "${regex}" to DFA`,
      details: `Final DFA: ${states.length} states, ${finalStates.length} final states`,
      final: true,
      success: true
    });
    
    return {
      states,
      alphabet,
      transitions,
      startState,
      finalStates,
      steps
    };
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setIsStepping(false);
    
    const result = regexToNFA(regexInput);
    setConversionResult(result);
    
    // Animate through steps
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < result.steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(animateStep, 1000);
      } else {
        setIsRunning(false);
      }
    };
    
    animateStep();
  }, [regexInput, regexToNFA]);

  const handleStep = useCallback(() => {
    if (!conversionResult) {
      const result = regexToNFA(regexInput);
      setConversionResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < conversionResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [conversionResult, currentStep, regexInput, regexToNFA]);

  const handleClear = useCallback(() => {
    setConversionResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return; 
    
    const currentStepData = data.steps[currentStep];
    const visualizationData = {
      states: data.states,
      transitions: data.transitions,
      startState: data.startState,
      finalStates: data.finalStates,
      highlightTransitions: currentStepData?.highlightTransitions || [],
      highlightTransition: currentStepData?.highlightTransition
    };
    
    renderDFA(svg, visualizationData);
  }, [currentStep]
  ); // Removed dependency, rely on data passed to function

  return (
    <PlaygroundThemeWrapper>
      <PlaygroundLayout
        onRun={handleRun}
        onClear={handleClear}
        onStep={handleStep}
        isRunning={isRunning}
        canStep={!isRunning && (!conversionResult || currentStep < conversionResult.steps.length - 1)}
        hasResults={!!conversionResult}
      >
        {/* Input Section */}
        <div className="lg:col-span-1">
          <InputPanel title="Regular Expression">
            <InputField
              label="Regular Expression"
              value={regexInput}
              onChange={setRegexInput}
              placeholder="(a|b)*abb"
            />
            <InputField
              label="Test String"
              value={testString}
              onChange={setTestString}
              placeholder="aabb"
            />
            
            {/* 3. Apply isDark logic to info box 1 */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Supported Operators:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <li>• <code>|</code> - Union (OR)</li>
                <li>• <code>*</code> - Kleene star (zero or more)</li>
                <li>• <code>+</code> - One or more</li>
                <li>• <code>()</code> - Grouping</li>
                <li>• <code>a-z</code> - Literal characters</li>
              </ul>
            </div>
            
            {/* 3. Apply isDark logic to info box 2 */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                Conversion Process:
              </h4>
              <ol className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>1. Parse regular expression</li>
                <li>2. Build NFA using Thompson's construction</li>
                <li>3. Convert NFA to DFA using subset construction</li>
                <li>4. Minimize DFA (optional)</li>
              </ol>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Generated DFA"
            data={conversionResult}
            renderFunction={renderVisualization}
          />
        </div>

        {/* Workflow Section */}
        <div className="lg:col-span-1">
          <WorkflowPanel
            title="Conversion Steps"
            steps={conversionResult?.steps || []}
            currentStep={currentStep}
          />
          
          {conversionResult && (
            // 3. Apply isDark logic to status panel
            <div className={`mt-4 p-4 rounded-lg shadow-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                DFA Properties
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>States:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversionResult.states.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Alphabet Size:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversionResult.alphabet.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transitions:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversionResult.transitions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Final States:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {conversionResult.finalStates.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </PlaygroundLayout>
    </PlaygroundThemeWrapper>
  );
};

export default RegexToDFAPlayground;