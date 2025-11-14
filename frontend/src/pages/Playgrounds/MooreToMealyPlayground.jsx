import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet } from '../../utils/automataUtils';
import { renderMealyMachine, renderMooreMachine } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const MooreToMealyPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Input states
  const [statesInput, setStatesInput] = useState('q0,q1');
  const [inputAlphabetInput, setInputAlphabetInput] = useState('0,1');
  const [outputAlphabetInput, setOutputAlphabetInput] = useState('a,b');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1\nq0,1,q0\nq1,0,q0\nq1,1,q1');
  const [outputFunctionInput, setOutputFunctionInput] = useState('q0,a\nq1,b');
  const [startState, setStartState] = useState('q0');

  // Conversion states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showConverted, setShowConverted] = useState(false);

  const parseMooreTransitions = useCallback((transitionsString) => {
    if (!transitionsString.trim()) return [];

    const transitions = [];
    const lines = transitionsString.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s*,\s*/);
      if (parts.length === 3) {
        const [from, symbol, to] = parts;
        transitions.push({
          from: from.trim(),
          symbol: symbol.trim(),
          to: to.trim()
        });
      }
    }

    return transitions;
  }, []);

  const parseOutputFunction = useCallback((outputString) => {
    if (!outputString.trim()) return {};

    const outputFunction = {};
    const lines = outputString.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s*,\s*/);
      if (parts.length === 2) {
        const [state, output] = parts;
        outputFunction[state.trim()] = output.trim();
      }
    }

    return outputFunction;
  }, []);

  const mooreToMealy = useCallback((mooreStates, inputAlphabet, mooreTransitions, mooreOutputFunction, mooreStartState) => {
    const steps = [];
    const mealyStates = [...mooreStates];
    const mealyTransitions = [];
    const mealyStartState = mooreStartState;

    steps.push({
      title: 'Initialize Conversion',
      description: 'Converting Moore Machine to Mealy Machine',
      details: 'States remain the same, but outputs move to transitions'
    });

    steps.push({
      title: 'Copy States',
      description: `Copying ${mooreStates.length} states`,
      details: `States: {${mealyStates.join(', ')}}`
    });

    // Convert transitions
    for (const mooreTransition of mooreTransitions) {
      const output = mooreOutputFunction[mooreTransition.to] || '';
      const newMealyTransition = {
        from: mooreTransition.from,
        input: mooreTransition.symbol,
        to: mooreTransition.to,
        output: output
      };
      mealyTransitions.push(newMealyTransition);
    }

    steps.push({
      title: 'Convert Transitions',
      description: `Created ${mealyTransitions.length} Mealy transitions`,
      details: 'Output of target state in Moore machine becomes transition output in Mealy machine',
      highlightTransitions: mealyTransitions.slice(0, Math.min(5, mealyTransitions.length))
    });

    steps.push({
      title: 'Remove State Outputs',
      description: 'State outputs are no longer needed',
      details: 'All outputs are now associated with transitions'
    });

    steps.push({
      title: 'Conversion Complete',
      description: 'Moore machine successfully converted to Mealy machine',
      details: `Mealy machine has ${mealyStates.length} states`,
      final: true,
      success: true
    });

    return {
      original: {
        type: 'moore',
        states: mooreStates,
        transitions: mooreTransitions,
        startState: mooreStartState,
        outputFunction: mooreOutputFunction
      },
      converted: {
        type: 'mealy',
        states: mealyStates,
        transitions: mealyTransitions,
        startState: mealyStartState
      },
      steps
    };
  }, []);

  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const inputAlphabet = parseAlphabet(inputAlphabetInput);
    const mooreTransitions = parseMooreTransitions(transitionsInput);
    const outputFunction = parseOutputFunction(outputFunctionInput);

    setIsRunning(true);
    setIsStepping(false);
    setShowConverted(false);

    const result = mooreToMealy(states, inputAlphabet, mooreTransitions, outputFunction, startState);
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
  }, [statesInput, inputAlphabetInput, transitionsInput, outputFunctionInput, startState, parseMooreTransitions, parseOutputFunction, mooreToMealy]);

  const handleStep = useCallback(() => {
    if (!conversionResult) {
      const states = parseStates(statesInput);
      const inputAlphabet = parseAlphabet(inputAlphabetInput);
      const mooreTransitions = parseMooreTransitions(transitionsInput);
      const outputFunction = parseOutputFunction(outputFunctionInput);

      const result = mooreToMealy(states, inputAlphabet, mooreTransitions, outputFunction, startState);
      setConversionResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < conversionResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConverted(true);
    }
  }, [conversionResult, currentStep, statesInput, inputAlphabetInput, transitionsInput, outputFunctionInput, startState, parseMooreTransitions, parseOutputFunction, mooreToMealy]);

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
          <InputPanel title="Moore Machine Input">
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
              label="Moore Transitions (from,input,to per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q1&#10;q0,1,q0&#10;q1,0,q0"
              rows={4}
            />

            <TextAreaField
              label="Output Function (state,output per line)"
              value={outputFunctionInput}
              onChange={setOutputFunctionInput}
              placeholder="q0,a&#10;q1,b"
              rows={3}
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
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Moore → Mealy Conversion:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <li>• Move state outputs to transitions</li>
                <li>• Same number of states</li>
                <li>• Output depends on state and input</li>
                <li>• More compact representation</li>
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
                  Show Moore
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
                  Show Mealy
                </button>
              </div>
            )}
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title={showConverted ? "Generated Mealy Machine" : "Original Moore Machine"}
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
                    Original Moore Machine
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
                      <span className={`font-mono ${isDark ? 'text-green-400' : 'text-green-600'}`}>States</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Generated Mealy Machine
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
                      <span className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Transitions</span>
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

export default MooreToMealyPlayground;