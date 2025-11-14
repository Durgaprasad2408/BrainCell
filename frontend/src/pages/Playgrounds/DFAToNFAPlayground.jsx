import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet, parseTransitions } from '../../utils/automataUtils';
import { renderDFA, renderNFA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const DFAToNFAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // DFA Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [alphabetInput, setAlphabetInput] = useState('0,1');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1\nq0,1,q0\nq1,0,q2\nq1,1,q0\nq2,0,q2\nq2,1,q2');
  const [startState, setStartState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');

  // Conversion states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showNFA, setShowNFA] = useState(false);

  // DFA to NFA conversion (trivial - every DFA is already an NFA)
  const dfaToNFA = useCallback((dfaStates, alphabet, dfaTransitions, dfaStartState, dfaFinalStates) => {
    const steps = [];

    steps.push({
      title: 'Initialize Conversion',
      description: 'Converting DFA to equivalent NFA',
      details: 'Every DFA is already a valid NFA by definition'
    });

    steps.push({
      title: 'Copy States',
      description: `Copying ${dfaStates.length} states from DFA`,
      details: `States: {${dfaStates.join(', ')}}`
    });

    steps.push({
      title: 'Copy Alphabet',
      description: `Copying alphabet symbols`,
      details: `Alphabet: {${alphabet.join(', ')}}`
    });

    steps.push({
      title: 'Copy Transitions',
      description: `Copying ${dfaTransitions.length} transitions`,
      details: 'All DFA transitions are deterministic, so they remain valid in NFA',
      highlightTransitions: dfaTransitions.slice(0, Math.min(3, dfaTransitions.length))
    });

    steps.push({
      title: 'Set Start State',
      description: `Start state: ${dfaStartState}`,
      details: 'Same start state as original DFA'
    });

    steps.push({
      title: 'Set Final States',
      description: `Final states: {${dfaFinalStates.join(', ')}}`,
      details: 'Same final states as original DFA'
    });

    steps.push({
      title: 'Conversion Complete',
      description: 'DFA successfully converted to NFA',
      details: 'The resulting NFA is deterministic and equivalent to the original DFA',
      final: true,
      success: true
    });

    return {
      dfa: {
        states: dfaStates,
        alphabet,
        transitions: dfaTransitions,
        startState: dfaStartState,
        finalStates: dfaFinalStates
      },
      nfa: {
        states: dfaStates, // Same states
        alphabet,
        transitions: dfaTransitions, // Same transitions
        startState: dfaStartState, // Same start state
        finalStates: dfaFinalStates // Same final states
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
    setShowNFA(false);

    const result = dfaToNFA(states, alphabet, transitions, startState, finalStatesList);
    setConversionResult(result);

    // Animate through steps
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < result.steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(animateStep, 800);
      } else {
        setIsRunning(false);
        setShowNFA(true);
      }
    };

    animateStep();
  }, [statesInput, alphabetInput, transitionsInput, startState, finalStates, dfaToNFA]);

  const handleStep = useCallback(() => {
    if (!conversionResult) {
      const states = parseStates(statesInput);
      const alphabet = parseAlphabet(alphabetInput);
      const transitions = parseTransitions(transitionsInput);
      const finalStatesList = parseStates(finalStates);

      const result = dfaToNFA(states, alphabet, transitions, startState, finalStatesList);
      setConversionResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < conversionResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowNFA(true);
    }
  }, [conversionResult, currentStep, statesInput, alphabetInput, transitionsInput, startState, finalStates, dfaToNFA]);

  const handleClear = useCallback(() => {
    setConversionResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
    setShowNFA(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    const currentStepData = data.steps[currentStep];

    if (showNFA) {
      renderNFA(svg, {
        ...data.nfa,
        highlightTransitions: currentStepData?.highlightTransitions,
        highlightTransition: currentStepData?.highlightTransition
      });
    } else {
      renderDFA(svg, {
        ...data.dfa,
        highlightTransitions: currentStepData?.highlightTransitions,
        highlightTransition: currentStepData?.highlightTransition
      });
    }
  }, [showNFA, currentStep] // Rely on showNFA and currentStep from state
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

            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-pink-900/20 border-pink-800'
                : 'bg-pink-50 border-pink-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-pink-200' : 'text-pink-800'}`}>
                DFA to NFA Conversion:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                <li>• Every DFA is already a valid NFA</li>
                <li>• No structural changes needed</li>
                <li>• Resulting NFA is deterministic</li>
                <li>• Same language recognition capability</li>
              </ul>
            </div>

            {conversionResult && (
              <div className="mt-4 flex space-x-2">
                {/* 3. Apply isDark logic to toggle buttons */}
                <button
                  onClick={() => setShowNFA(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    !showNFA
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show DFA
                </button>
                <button
                  onClick={() => setShowNFA(true)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    showNFA
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show NFA
                </button>
              </div>
            )}
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title={showNFA ? "Generated NFA" : "Original DFA"}
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
            <div className="mt-4 space-y-4">
              {/* 3. Apply isDark logic to note panel */}
              <div className={`p-4 rounded-lg shadow-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Theoretical Note
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  This conversion is trivial because every DFA is already a valid NFA by definition.
                  The key difference is that NFAs allow non-deterministic transitions and epsilon moves,
                  but DFAs are a special case of NFAs where these features are not used.
                </p>
              </div>

              {/* 3. Apply isDark logic to comparison panel */}
              <div className={`p-4 rounded-lg shadow-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Properties Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Original DFA</h4>
                    <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex justify-between">
                        <span>Deterministic:</span>
                        <span className="font-mono text-green-600">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>States:</span>
                        <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.dfa.states.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transitions:</span>
                        <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.dfa.transitions.length}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Generated NFA</h4>
                    <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex justify-between">
                        <span>Deterministic:</span>
                        <span className="font-mono text-green-600">Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>States:</span>
                        <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.nfa.states.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transitions:</span>
                        <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.nfa.transitions.length}</span>
                      </div>
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

export default DFAToNFAPlayground;