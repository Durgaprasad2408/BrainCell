import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet } from '../../utils/automataUtils';
import { renderMealyMachine } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const MealyMachinePlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Mealy Machine Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [inputAlphabetInput, setInputAlphabetInput] = useState('0,1');
  const [outputAlphabetInput, setOutputAlphabetInput] = useState('a,b');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1,a\nq0,1,q0,b\nq1,0,q2,b\nq1,1,q0,a\nq2,0,q2,a\nq2,1,q1,b');
  const [startState, setStartState] = useState('q0');
  const [inputString, setInputString] = useState('101');
  
  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

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

  const simulateMealyMachine = useCallback((states, inputAlphabet, outputAlphabet, transitions, startState, inputString) => {
    const steps = [];
    let currentState = startState;
    let outputString = '';
    
    steps.push({
      title: 'Initialize',
      description: `Starting Mealy Machine simulation`,
      details: `Input: "${inputString}", Start state: ${startState}`,
      state: currentState,
      remainingInput: inputString,
      outputSoFar: '',
      position: 0
    });
    
    for (let i = 0; i < inputString.length; i++) {
      const inputSymbol = inputString[i];
      const transition = transitions.find(t => t.from === currentState && t.input === inputSymbol);
      
      if (!transition) {
        steps.push({
          title: 'Transition Failed',
          description: `No transition from '${currentState}' on input '${inputSymbol}'`,
          details: `Machine halts at position ${i}`,
          state: currentState,
          remainingInput: inputString.slice(i),
          outputSoFar: outputString,
          position: i,
          error: true
        });
        return { outputString, steps, success: false };
      }
      
      currentState = transition.to;
      outputString += transition.output;
      
      steps.push({
        title: 'Transition',
        description: `${transition.from} --${transition.input}/${transition.output}--> ${transition.to}`,
        details: `Input: '${inputSymbol}', Output: '${transition.output}'`,
        state: currentState,
        remainingInput: inputString.slice(i + 1),
        outputSoFar: outputString,
        position: i + 1,
        transition
      });
    }
    
    steps.push({
      title: 'Complete',
      description: `Input processed successfully`,
      details: `Final output: "${outputString}"`,
      state: currentState,
      remainingInput: '',
      outputSoFar: outputString,
      position: inputString.length,
      final: true,
      success: true
    });
    
    return { outputString, steps, success: true };
  }, []);

  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const inputAlphabet = parseAlphabet(inputAlphabetInput);
    const outputAlphabet = parseAlphabet(outputAlphabetInput);
    const transitions = parseMealyTransitions(transitionsInput);
    
    setIsRunning(true);
    setIsStepping(false);
    
    const result = simulateMealyMachine(states, inputAlphabet, outputAlphabet, transitions, startState, inputString);
    setSimulationResult(result);
    
    // Animate through steps
    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex < result.steps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        setTimeout(animateStep, 1200);
      } else {
        setIsRunning(false);
      }
    };
    
    animateStep();
  }, [statesInput, inputAlphabetInput, outputAlphabetInput, transitionsInput, startState, inputString, parseMealyTransitions, simulateMealyMachine]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = parseStates(statesInput);
      const inputAlphabet = parseAlphabet(inputAlphabetInput);
      const outputAlphabet = parseAlphabet(outputAlphabetInput);
      const transitions = parseMealyTransitions(transitionsInput);
      
      const result = simulateMealyMachine(states, inputAlphabet, outputAlphabet, transitions, startState, inputString);
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, inputAlphabetInput, outputAlphabetInput, transitionsInput, startState, inputString, parseMealyTransitions, simulateMealyMachine]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;
    
    const states = parseStates(statesInput);
    const transitions = parseMealyTransitions(transitionsInput);
    
    const currentStepData = data.steps[currentStep];
    const visualizationData = {
      states,
      transitions,
      startState,
      currentState: currentStepData?.state,
      highlightTransition: currentStepData?.highlightTransition || currentStepData?.transition
    };
    
    renderMealyMachine(svg, visualizationData);
  }, [statesInput, transitionsInput, startState, currentStep, parseMealyTransitions]); // Added parseMealyTransitions dependency

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
          <InputPanel title="Mealy Machine Definition">
            <InputField
              label="States (comma-separated)"
              value={statesInput}
              onChange={setStatesInput}
              placeholder="q0,q1,q2"
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
              label="Transitions (from,input,to,output per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q1,a&#10;q0,1,q0,b&#10;q1,0,q2,b"
              rows={6}
            />
            <InputField
              label="Start State"
              value={startState}
              onChange={setStartState}
              placeholder="q0"
            />
            <InputField
              label="Input String"
              value={inputString}
              onChange={setInputString}
              placeholder="101"
            />
            
            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                Mealy Machine Features:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Output depends on current state AND input</li>
                <li>• Transitions: (state, input) → (state, output)</li>
                <li>• Output produced during transitions</li>
                <li>• Generally more compact than Moore machines</li>
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Mealy Machine Visualization"
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
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Output So Far:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    "{simulationResult.steps[currentStep]?.outputSoFar || ''}"
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
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Final Output:</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      "{simulationResult.outputString}"
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

export default MealyMachinePlayground;