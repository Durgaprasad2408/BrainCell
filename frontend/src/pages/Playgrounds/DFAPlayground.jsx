import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet, parseTransitions, validateDFA, simulateDFA } from '../../utils/automataUtils';
import { renderDFA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const DFAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [alphabetInput, setAlphabetInput] = useState('0,1');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1\nq0,1,q0\nq1,0,q2\nq1,1,q0\nq2,0,q2\nq2,1,q2');
  const [startState, setStartState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');
  const [inputString, setInputString] = useState('101');
  
  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [errors, setErrors] = useState([]);

  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const alphabet = parseAlphabet(alphabetInput);
    const transitions = parseTransitions(transitionsInput);
    
    const validationErrors = validateDFA(states, alphabet, transitions, startState, finalStates);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    setIsRunning(true);
    setIsStepping(false);
    
    const result = simulateDFA(states, alphabet, transitions, startState, finalStates, inputString);
    setSimulationResult(result);
    
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
  }, [statesInput, alphabetInput, transitionsInput, startState, finalStates, inputString]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = parseStates(statesInput);
      const alphabet = parseAlphabet(alphabetInput);
      const transitions = parseTransitions(transitionsInput);

      const validationErrors = validateDFA(states, alphabet, transitions, startState, finalStates);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors([]);
      const result = simulateDFA(states, alphabet, transitions, startState, finalStates, inputString);
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, alphabetInput, transitionsInput, startState, finalStates, inputString]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
    setErrors([]);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;
    
    const states = parseStates(statesInput);
    const transitions = parseTransitions(transitionsInput);
    const finalStatesList = parseStates(finalStates);
    
    const currentStepData = data.steps[currentStep];
    const visualizationData = {
      states,
      transitions,
      startState,
      finalStates: finalStatesList,
      currentState: currentStepData?.state,
      highlightTransition: currentStepData?.highlightTransition || currentStepData?.transition
    };
    
    renderDFA(svg, visualizationData);
  }, [statesInput, transitionsInput, startState, finalStates, currentStep]);

  return (
    <PlaygroundThemeWrapper>
      <PlaygroundLayout
        onRun={handleRun}
        onClear={handleClear}
        onStep={handleStep}
        isRunning={isRunning}
        canStep={!isRunning && (!simulationResult || currentStep < simulationResult.steps.length - 1)}
        hasResults={!!simulationResult}
      >
      {/* Input Section */}
      <div>
        <InputPanel title="DFA Definition">
          <InputField
            label="States (comma-separated)"
            value={statesInput}
            onChange={setStatesInput}
            placeholder="q0,q1,q2"
          />
          <InputField
            label="Alphabet (comma-separated)"
            value={alphabetInput}
            onChange={setAlphabetInput}
            placeholder="0,1"
          />
          <TextAreaField
            label="Transitions (from,symbol,to per line)"
            value={transitionsInput}
            onChange={setTransitionsInput}
            placeholder="q0,0,q1&#10;q0,1,q0&#10;q1,0,q2"
            rows={6}
          />
          <InputField
            label="Start State"
            value={startState}
            onChange={setStartState}
            placeholder="q0"
          />
          <InputField
            label="Final States (comma-separated)"
            value={finalStates}
            onChange={setFinalStates}
            placeholder="q2"
          />
          <InputField
            label="Input String"
            value={inputString}
            onChange={setInputString}
            placeholder="101"
          />
          
          {errors.length > 0 && (
            // 3. Apply isDark logic to error block
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                Validation Errors:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </InputPanel>
      </div>

      {/* Visualization Section */}
      <div>
        <VisualizationPanel
          title="DFA Visualization"
          data={simulationResult}
          renderFunction={renderVisualization}
        />
      </div>

      {/* Workflow Section */}
      <div className="space-y-4">
        <WorkflowPanel
          title="Execution Steps"
          steps={simulationResult?.steps || []}
          currentStep={currentStep}
        />
        
        {simulationResult && currentStep >= 0 && (
          // 3. Apply isDark logic to status block
          <div className={`p-4 rounded-lg shadow-lg border ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Current Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current State:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {simulationResult.steps[currentStep]?.state || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Position:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {simulationResult.steps[currentStep]?.position || 0} / {inputString.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Remaining Input:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  "{simulationResult.steps[currentStep]?.remainingInput || ''}"
                </span>
              </div>
              {currentStep === simulationResult.steps.length - 1 && (
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Result:</span>
                  <span className={`font-bold ${
                    simulationResult.accepted
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {simulationResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </PlaygroundLayout>
    </PlaygroundThemeWrapper>
  );
};

export default DFAPlayground;