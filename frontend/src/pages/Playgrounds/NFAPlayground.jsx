import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet, parseTransitions } from '../../utils/automataUtils';
import { renderNFA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const NFAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [alphabetInput, setAlphabetInput] = useState('0,1,ε');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q0\nq0,0,q1\nq0,ε,q2\nq1,1,q2\nq2,1,q2');
  const [startState, setStartState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');
  const [inputString, setInputString] = useState('01');

  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const simulateNFA = useCallback((states, alphabet, transitions, startState, finalStates, inputString) => {
    const finalStatesList = parseStates(finalStates);
    const steps = [];

    // Helper function to get epsilon closure
    const getEpsilonClosure = (stateSet) => {
      const closure = new Set(stateSet);
      const stack = [...stateSet];

      while (stack.length > 0) {
        const state = stack.pop();
        const epsilonTransitions = transitions.filter(t => t.from === state && t.symbol === 'ε');

        for (const transition of epsilonTransitions) {
          if (!closure.has(transition.to)) {
            closure.add(transition.to);
            stack.push(transition.to);
          }
        }
      }

      return Array.from(closure);
    };

    // Start with epsilon closure of start state
    let currentStates = getEpsilonClosure([startState]);

    steps.push({
      title: 'Initialize',
      description: `Starting states: {${currentStates.join(', ')}}`,
      details: `Input: "${inputString}"`,
      states: [...currentStates],
      remainingInput: inputString,
      position: 0
    });

    for (let i = 0; i < inputString.length; i++) {
      const symbol = inputString[i];
      const nextStates = new Set();

      // Find all possible transitions for current symbol
      for (const state of currentStates) {
        const validTransitions = transitions.filter(t => t.from === state && t.symbol === symbol);
        for (const transition of validTransitions) {
          nextStates.add(transition.to);
        }
      }

      if (nextStates.size === 0) {
        steps.push({
          title: 'No Transitions',
          description: `No transitions available for symbol '${symbol}'`,
          details: `Input rejected at position ${i}`,
          states: [],
          remainingInput: inputString.slice(i),
          position: i,
          error: true
        });
        return { accepted: false, steps };
      }

      // Track transitions taken for highlighting
      const transitionsTaken = [];
      for (const state of currentStates) {
        const validTransitions = transitions.filter(t => t.from === state && t.symbol === symbol);
        transitionsTaken.push(...validTransitions);
      }

      // Apply epsilon closure to next states
      currentStates = getEpsilonClosure(Array.from(nextStates));

      steps.push({
        title: 'Transition',
        description: `On '${symbol}' → {${currentStates.join(', ')}}`,
        details: `Remaining input: "${inputString.slice(i + 1)}"`,
        states: [...currentStates],
        remainingInput: inputString.slice(i + 1),
        position: i + 1,
        highlightTransitions: transitionsTaken,
        transition: { symbol, from: [...currentStates], to: [...currentStates] }
      });
    }

    // Check if any current state is a final state
    const accepted = currentStates.some(state => finalStatesList.includes(state));
    const acceptingStates = currentStates.filter(state => finalStatesList.includes(state));

    steps.push({
      title: 'Final Check',
      description: `Final states: {${currentStates.join(', ')}} - ${accepted ? 'ACCEPTED' : 'REJECTED'}`,
      details: accepted ? `Accepting states: {${acceptingStates.join(', ')}}` : `No accepting states found`,
      states: [...currentStates],
      remainingInput: '',
      position: inputString.length,
      final: true,
      accepted,
      success: accepted
    });

    return { accepted, steps };
  }, []);

  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const alphabet = parseAlphabet(alphabetInput);
    const transitions = parseTransitions(transitionsInput);

    setIsRunning(true);
    setIsStepping(false);

    // Run simulation
    const result = simulateNFA(states, alphabet, transitions, startState, finalStates, inputString);
    setSimulationResult(result);

    // Animate through steps
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < result.steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(animateStep, 1500);
      } else {
        setIsRunning(false);
      }
    };

    animateStep();
  }, [statesInput, alphabetInput, transitionsInput, startState, finalStates, inputString, simulateNFA]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = parseStates(statesInput);
      const alphabet = parseAlphabet(alphabetInput);
      const transitions = parseTransitions(transitionsInput);

      const result = simulateNFA(states, alphabet, transitions, startState, finalStates, inputString);
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, alphabetInput, transitionsInput, startState, finalStates, inputString, simulateNFA]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
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
      currentStates: currentStepData?.states || [],
      highlightTransitions: currentStepData?.highlightTransitions || [],
      highlightTransition: currentStepData?.transition
    };

    renderNFA(svg, visualizationData);
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
        <div className="lg:col-span-1">
          <InputPanel title="NFA Definition">
            <InputField
              label="States (comma-separated)"
              value={statesInput}
              onChange={setStatesInput}
              placeholder="q0,q1,q2"
            />
            <InputField
              label="Alphabet (comma-separated, use ε for epsilon)"
              value={alphabetInput}
              onChange={setAlphabetInput}
              placeholder="0,1,ε"
            />
            <TextAreaField
              label="Transitions (from,symbol,to per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q0&#10;q0,0,q1&#10;q0,ε,q2"
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
              placeholder="01"
            />

            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                NFA Features:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Multiple transitions from same state on same symbol</li>
                <li>• Epsilon (ε) transitions for non-consuming moves</li>
                <li>• Parallel state tracking during simulation</li>
                <li>• Automatic epsilon closure computation</li>
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="NFA Visualization"
            data={simulationResult}
            renderFunction={renderVisualization}
          />
        </div>

        {/* Workflow Section */}
        <div className="lg:col-span-1">
          <WorkflowPanel
            title="Execution Steps"
            steps={simulationResult?.steps || []}
            currentStep={currentStep}
          />

          {simulationResult && currentStep >= 0 && (
            // 3. Apply isDark logic to status panel
            <div className={`mt-4 p-4 rounded-lg shadow-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Current Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active States:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {simulationResult.steps[currentStep]?.states?.length > 0
                      ? `{${simulationResult.steps[currentStep].states.join(', ')}}`
                      : '∅'}
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

export default NFAPlayground;