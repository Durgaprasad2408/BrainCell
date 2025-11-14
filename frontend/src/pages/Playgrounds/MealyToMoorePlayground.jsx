import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet } from '../../utils/automataUtils';
import { renderMealyMachine, renderMooreMachine } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const MealyToMoorePlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Input states
  const [statesInput, setStatesInput] = useState('q0,q1');
  const [inputAlphabetInput, setInputAlphabetInput] = useState('0,1');
  const [outputAlphabetInput, setOutputAlphabetInput] = useState('a,b');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1,a\nq0,1,q0,b\nq1,0,q0,b\nq1,1,q1,a');
  const [startState, setStartState] = useState('q0');

  // Conversion states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showConverted, setShowConverted] = useState(false);

  const parseMealyTransitions = useCallback((transitionsString) => {
    if (!transitionsString.trim()) return [];

    const transitions = [];
    const lines = transitionsString.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s*,\s*/);
      if (parts.length === 4) {
        const [from, input, to, output] = parts;
        transitions.push({
          from: from.trim(),
          input: input.trim(),
          to: to.trim(),
          output: output.trim()
        });
      }
    }

    return transitions;
  }, []);

  const mealyToMoore = useCallback((mealyStates, inputAlphabet, mealyTransitions, mealyStartState) => {
    const steps = [];
    const mooreStates = [];
    const mooreTransitions = [];
    const mooreOutputFunction = {};
    let mooreStartState = '';

    steps.push({
      title: 'Initialize Conversion',
      description: 'Converting Mealy Machine to Moore Machine',
      details: 'Each Moore state will represent (Mealy state, output) pairs'
    });

    // Create state mapping: (state, output) -> new_state
    const stateMapping = new Map();
    let stateCounter = 0;

    // Step 1: Find all possible outputs for each state
    const stateOutputs = new Map();

    for (const state of mealyStates) {
      const outputs = new Set();
      for (const transition of mealyTransitions) {
        // Find outputs produced *leading into* this state
        if (transition.to === state) {
            outputs.add(transition.output);
        }
      }
      // Special handling for start state - needs an initial output.
      // We'll pick one arbitrarily or based on incoming transitions if any.
      // If no transitions lead to start state, need a default rule.
      if (state === mealyStartState && outputs.size === 0) {
          // Find any output produced FROM the start state as a guess
          const outgoingTransition = mealyTransitions.find(t => t.from === state);
          if (outgoingTransition) {
              outputs.add(outgoingTransition.output);
          } else {
              // Add a default output if none found, e.g., the first in the output alphabet
              const firstOutput = outputAlphabetInput.split(',')[0]?.trim() || '?';
              outputs.add(firstOutput);
          }
      }
      stateOutputs.set(state, Array.from(outputs));
    }


    steps.push({
      title: 'Analyze State Outputs',
      description: 'Finding all possible outputs associated with arriving at each state',
      details: `Analyzing ${mealyStates.length} states for output patterns`
    });

    // Step 2: Create Moore states for each (state, output) combination
    const stateOutputPairs = new Set();
    // Add pairs based on transitions' target state and output
    for (const transition of mealyTransitions) {
        stateOutputPairs.add(`${transition.to},${transition.output}`);
    }
    // Ensure the start state has at least one pair
    const startStateOutputs = stateOutputs.get(mealyStartState) || [];
    if (startStateOutputs.length > 0) {
        stateOutputPairs.add(`${mealyStartState},${startStateOutputs[0]}`); // Use the first found/default output
    } else {
        // Fallback if start state had no incoming/outgoing transitions to infer output
        const firstOutput = outputAlphabetInput.split(',')[0]?.trim() || '?';
        stateOutputPairs.add(`${mealyStartState},${firstOutput}`);
    }


    steps.push({
      title: 'Identify State-Output Pairs',
      description: `Found ${stateOutputPairs.size} unique (state, output) combinations`,
      details: `Pairs: ${Array.from(stateOutputPairs).join('; ')}` // Use semicolon for clarity
    });

    // Create Moore states
    for (const pair of stateOutputPairs) {
      const [state, output] = pair.split(',');
      const newStateName = `(${state},${output})`; // Use a clearer naming convention
      mooreStates.push(newStateName);
      stateMapping.set(pair, newStateName);
      mooreOutputFunction[newStateName] = output;

      // Set start state (use the pair derived for the Mealy start state)
       if (state === mealyStartState && !mooreStartState) {
            // Find the pair corresponding to the start state
            const startPairKey = `${state},${startStateOutputs[0] || (outputAlphabetInput.split(',')[0]?.trim() || '?')}`;
            mooreStartState = stateMapping.get(startPairKey);
        }
    }
     // If mooreStartState is still empty (edge case), assign the first created state
    if (!mooreStartState && mooreStates.length > 0) {
        mooreStartState = mooreStates[0];
    }


    steps.push({
      title: 'Create Moore States',
      description: `Created ${mooreStates.length} Moore states`,
      details: `States: {${mooreStates.join(', ')}}`
    });

    // Step 3: Create Moore transitions
     for (const [sourcePair, sourceMooreState] of stateMapping.entries()) {
        const [sourceMealyState] = sourcePair.split(',');

        for (const inputSymbol of inputAlphabet) {
            const mealyTransition = mealyTransitions.find(t => t.from === sourceMealyState && t.input === inputSymbol);

            if (mealyTransition) {
                const targetPair = `${mealyTransition.to},${mealyTransition.output}`;
                const targetMooreState = stateMapping.get(targetPair);

                if (targetMooreState) {
                    mooreTransitions.push({
                        from: sourceMooreState,
                        symbol: inputSymbol,
                        to: targetMooreState
                    });
                }
            }
        }
    }


    // Remove duplicate transitions (shouldn't be strictly necessary with this logic but good practice)
    const uniqueTransitions = [];
    const transitionSet = new Set();

    for (const transition of mooreTransitions) {
      const key = `${transition.from},${transition.symbol},${transition.to}`;
      if (!transitionSet.has(key)) {
        transitionSet.add(key);
        uniqueTransitions.push(transition);
      }
    }

    mooreTransitions.length = 0;
    mooreTransitions.push(...uniqueTransitions);

    steps.push({
      title: 'Create Moore Transitions',
      description: `Created ${mooreTransitions.length} Moore transitions`,
      details: 'Each transition preserves input symbols but removes outputs',
      highlightTransitions: mooreTransitions.slice(0, Math.min(5, mooreTransitions.length))
    });

    steps.push({
      title: 'Conversion Complete',
      description: 'Mealy machine successfully converted to Moore machine',
      details: `Moore machine has ${mooreStates.length} states`,
      final: true,
      success: true
    });

    return {
      original: {
        type: 'mealy',
        states: mealyStates,
        transitions: mealyTransitions,
        startState: mealyStartState
      },
      converted: {
        type: 'moore',
        states: mooreStates,
        transitions: mooreTransitions,
        startState: mooreStartState,
        outputFunction: mooreOutputFunction
      },
      steps
    };
  }, [outputAlphabetInput]); // Added outputAlphabetInput dependency


  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const inputAlphabet = parseAlphabet(inputAlphabetInput);
    const mealyTransitions = parseMealyTransitions(transitionsInput);

    setIsRunning(true);
    setIsStepping(false);
    setShowConverted(false);

    const result = mealyToMoore(states, inputAlphabet, mealyTransitions, startState);
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
        setShowConverted(true);
      }
    };

    animateStep();
  }, [statesInput, inputAlphabetInput, transitionsInput, startState, parseMealyTransitions, mealyToMoore]);

  const handleStep = useCallback(() => {
    if (!conversionResult) {
      const states = parseStates(statesInput);
      const inputAlphabet = parseAlphabet(inputAlphabetInput);
      const mealyTransitions = parseMealyTransitions(transitionsInput);

      const result = mealyToMoore(states, inputAlphabet, mealyTransitions, startState);
      setConversionResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < conversionResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConverted(true);
    }
  }, [conversionResult, currentStep, statesInput, inputAlphabetInput, transitionsInput, startState, parseMealyTransitions, mealyToMoore]);

  const handleClear = useCallback(() => {
    setConversionResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
    setShowConverted(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    const machineData = showConverted ? data.converted : data.original;
    const currentStepData = data.steps[currentStep];

    if (machineData.type === 'mealy') {
      renderMealyMachine(svg, {
        states: machineData.states,
        transitions: machineData.transitions,
        startState: machineData.startState,
        highlightTransitions: currentStepData?.highlightTransitions,
        highlightTransition: currentStepData?.highlightTransition
      });
    } else {
      renderMooreMachine(svg, {
        states: machineData.states,
        transitions: machineData.transitions,
        startState: machineData.startState,
        outputFunction: machineData.outputFunction,
        highlightTransitions: currentStepData?.highlightTransitions,
        highlightTransition: currentStepData?.highlightTransition
      });
    }
  }, [showConverted, currentStep] // Rely on state
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
          <InputPanel title="Mealy Machine Input">
            <InputField
              label="States (comma-separated)"
              value={statesInput}
              onChange={setStatesInput}
              placeholder="q0,q1"
            />
            <InputField
              label="Input Alphabet (comma-separated)"
              value={inputAlphabetInput}
              onChange={setInputAlphabetInput}
              placeholder="0,1"
            />
            <InputField
              label="Output Alphabet (comma-separated)"
              value={outputAlphabetInput}
              onChange={setOutputAlphabetInput}
              placeholder="a,b"
            />

            <TextAreaField
              label="Mealy Transitions (from,input,to,output per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q1,a\n q0,1,q0,b\n q1,0,q0,b"
              rows={6}
            />

            <InputField
              label="Start State"
              value={startState}
              onChange={setStartState}
              placeholder="q0"
            />

            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                Mealy → Moore Conversion:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Create states for (Mealy state, output) pairs</li>
                <li>• Each Moore state has a fixed output</li>
                <li>• May increase the number of states</li>
                <li>• Output depends only on current state in Moore</li>
              </ul>
            </div>

            {conversionResult && (
              <div className="mt-4 flex space-x-2">
                {/* 3. Apply isDark logic to toggle buttons */}
                <button
                  onClick={() => setShowConverted(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    !showConverted
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show Mealy
                </button>
                <button
                  onClick={() => setShowConverted(true)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    showConverted
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Show Moore
                </button>
              </div>
            )}
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title={showConverted ? "Generated Moore Machine" : "Original Mealy Machine"}
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
                Conversion Results
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Original Mealy Machine
                  </h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.original.states.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transitions:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.original.transitions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output on:</span>
                      <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Transitions</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Generated Moore Machine
                  </h4>
                  <div className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between">
                      <span>States:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.converted.states.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transitions:</span>
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{conversionResult.converted.transitions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output on:</span>
                      <span className={`font-mono ${isDark ? 'text-green-400' : 'text-green-600'}`}>States</span>
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

export default MealyToMoorePlayground;