import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet, parseTransitions } from '../../utils/automataUtils';
import { renderDFA, renderNFA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const NFAToDFAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // NFA Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [alphabetInput, setAlphabetInput] = useState('0,1');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q0\nq0,0,q1\nq0,1,q0\nq1,1,q2\nq2,0,q2\nq2,1,q2');
  const [startState, setStartState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');

  // Conversion states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showDFA, setShowDFA] = useState(false);

  // Subset construction algorithm
  const nfaToDFA = useCallback((nfaStates, alphabet, nfaTransitions, nfaStartState, nfaFinalStates) => {
    const steps = [];
    const dfaStates = [];
    const dfaTransitions = [];
    const dfaFinalStates = [];
    const stateMapping = new Map();

    // Helper function to get epsilon closure (simplified - no epsilon in this example)
    const getEpsilonClosure = (stateSet) => {
      const closure = new Set(stateSet);
      const stack = [...stateSet];

      while (stack.length > 0) {
        const state = stack.pop();
        const epsilonTransitions = nfaTransitions.filter(t => t.from === state && t.symbol === 'ε');

        for (const transition of epsilonTransitions) {
          if (!closure.has(transition.to)) {
            closure.add(transition.to);
            stack.push(transition.to);
          }
        }
      }

      return Array.from(closure).sort();
    };

    // Helper function to get state name for a set of states
    const getStateName = (stateSet) => {
      const sortedStates = [...stateSet].sort();
      const key = sortedStates.join(',');
      if (!stateMapping.has(key)) {
        const newName = `{${sortedStates.join(',')}}`;
        stateMapping.set(key, newName);
        dfaStates.push(newName);

        // Check if this is a final state
        if (sortedStates.some(state => nfaFinalStates.includes(state))) {
          dfaFinalStates.push(newName);
        }
      }
      return stateMapping.get(key);
    };

    steps.push({
      title: 'Initialize',
      description: 'Starting subset construction algorithm',
      details: `NFA has ${nfaStates.length} states, alphabet: {${alphabet.join(', ')}}`
    });

    // Start with epsilon closure of start state
    const startClosure = getEpsilonClosure([nfaStartState]);
    const dfaStartState = getStateName(startClosure);

    steps.push({
      title: 'Create Start State',
      description: `DFA start state: ${dfaStartState}`,
      details: `Epsilon closure of {${nfaStartState}} = {${startClosure.join(', ')}}`
    });

    // Queue for processing states
    const queue = [startClosure];
    const processed = new Set();

    while (queue.length > 0) {
      const currentStateSet = queue.shift();
      const currentStateName = getStateName(currentStateSet);
      const stateKey = currentStateSet.join(',');

      if (processed.has(stateKey)) continue;
      processed.add(stateKey);

      steps.push({
        title: 'Process State',
        description: `Processing state ${currentStateName}`,
        details: `Contains NFA states: {${currentStateSet.join(', ')}}`
      });

      // For each symbol in alphabet
      for (const symbol of alphabet) {
        if (symbol === 'ε') continue; // Skip epsilon in DFA alphabet

        const nextStates = new Set();

        // Find all states reachable by this symbol
        for (const state of currentStateSet) {
          const transitions = nfaTransitions.filter(t => t.from === state && t.symbol === symbol);
          for (const transition of transitions) {
            nextStates.add(transition.to);
          }
        }

        if (nextStates.size > 0) {
          const nextStateArray = getEpsilonClosure(Array.from(nextStates));
          const nextStateName = getStateName(nextStateArray);

          dfaTransitions.push({
            from: currentStateName,
            symbol: symbol,
            to: nextStateName
          });

          steps.push({
            title: 'Add Transition',
            description: `${currentStateName} --${symbol}--> ${nextStateName}`,
            details: `On symbol '${symbol}': {${currentStateSet.join(', ')}} → {${nextStateArray.join(', ')}}`,
            highlightTransition: {
              from: currentStateName,
              symbol: symbol,
              to: nextStateName
            }
          });

          // Add to queue if not processed
          const nextStateKey = nextStateArray.join(',');
          if (!processed.has(nextStateKey)) {
            queue.push(nextStateArray);
          }
        }
      }
    }

    steps.push({
      title: 'Conversion Complete',
      description: `Generated DFA with ${dfaStates.length} states`,
      details: `Final states: {${dfaFinalStates.join(', ')}}`,
      final: true,
      success: true
    });

    return {
      nfa: {
        states: nfaStates,
        alphabet,
        transitions: nfaTransitions,
        startState: nfaStartState,
        finalStates: nfaFinalStates
      },
      dfa: {
        states: dfaStates,
        alphabet: alphabet.filter(s => s !== 'ε'), // Remove epsilon from DFA alphabet
        transitions: dfaTransitions,
        startState: dfaStartState,
        finalStates: dfaFinalStates
      },
      steps
    };
  }, []);

  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const alphabet = parseAlphabet(alphabetInput);
    const transitions = parseTransitions(transitionsInput);
    const finalStatesList = parseStates(finalStates);

    setIsRunning(true);
    setIsStepping(false);
    setShowDFA(false);

    const result = nfaToDFA(states, alphabet, transitions, startState, finalStatesList);
    setConversionResult(result);

    // Animate through steps
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < result.steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(animateStep, 1200);
      } else {
        setIsRunning(false);
        setShowDFA(true);
      }
    };

    animateStep();
  }, [statesInput, alphabetInput, transitionsInput, startState, finalStates, nfaToDFA]);

  const handleStep = useCallback(() => {
    if (!conversionResult) {
      const states = parseStates(statesInput);
      const alphabet = parseAlphabet(alphabetInput);
      const transitions = parseTransitions(transitionsInput);
      const finalStatesList = parseStates(finalStates);

      const result = nfaToDFA(states, alphabet, transitions, startState, finalStatesList);
      setConversionResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < conversionResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowDFA(true);
    }
  }, [conversionResult, currentStep, statesInput, alphabetInput, transitionsInput, startState, finalStates, nfaToDFA]);

  const handleClear = useCallback(() => {
    setConversionResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
    setShowDFA(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    const currentStepData = data.steps[currentStep];

    if (showDFA) {
      renderDFA(svg, {
        ...data.dfa,
        highlightTransition: currentStepData?.highlightTransition,
        highlightTransitions: currentStepData?.highlightTransitions
      });
    } else {
      renderNFA(svg, {
        ...data.nfa,
        highlightTransition: currentStepData?.highlightTransition,
        highlightTransitions: currentStepData?.highlightTransitions
      });
    }
  }, [showDFA, currentStep] // Rely on showDFA and currentStep from state
  );

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
          <InputPanel title="NFA Definition">
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
              placeholder="q0,0,q0&#10;q0,0,q1&#10;q1,1,q2"
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

            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-purple-900/20 border-purple-800'
                : 'bg-purple-50 border-purple-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                Subset Construction:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                <li>• Each DFA state represents a set of NFA states</li>
                <li>• Eliminates non-determinism</li>
                <li>• May increase number of states exponentially</li>
                <li>• Resulting DFA accepts same language as NFA</li>
              </ul>
            </div>

            {conversionResult && (
              <div className="mt-4 flex space-x-2">
                {/* 3. Apply isDark logic to toggle buttons */}
                <button
                  onClick={() => setShowDFA(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    !showDFA
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show NFA
                </button>
                <button
                  onClick={() => setShowDFA(true)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    showDFA
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show DFA
                </button>
              </div>
            )}
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title={showDFA ? "Generated DFA" : "Original NFA"}
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
            // 3. Apply isDark logic to comparison panel
            <div className={`mt-4 p-4 rounded-lg shadow-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Comparison
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>NFA</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.nfa.states.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transitions:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.nfa.transitions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.nfa.finalStates.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>DFA</h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.dfa.states.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transitions:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.dfa.transitions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.dfa.finalStates.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PlaygroundLayout>
    </PlaygroundThemeWrapper>
  );
};

export default NFAToDFAPlayground;