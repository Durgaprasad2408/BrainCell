import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet } from '../../utils/automataUtils';
import { renderMooreMachine } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const MooreMachinePlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // Moore Machine Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [inputAlphabetInput, setInputAlphabetInput] = useState('0,1');
  const [outputAlphabetInput, setOutputAlphabetInput] = useState('a,b');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1\nq0,1,q0\nq1,0,q2\nq1,1,q0\nq2,0,q2\nq2,1,q1');
  const [outputFunctionInput, setOutputFunctionInput] = useState('q0,a\nq1,b\nq2,a');
  const [startState, setStartState] = useState('q0');
  const [inputString, setInputString] = useState('101');
  
  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

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

  const simulateMooreMachine = useCallback((states, inputAlphabet, outputAlphabet, transitions, outputFunction, startState, inputString) => {
    const steps = [];
    let currentState = startState;
    let outputString = outputFunction[currentState] || '';
    
    steps.push({
      title: 'Initialize',
      description: `Starting Moore Machine simulation`,
      details: `Input: "${inputString}", Start state: ${startState}, Initial output: "${outputFunction[currentState] || ''}"`, 
      state: currentState,
      remainingInput: inputString,
      outputSoFar: outputString,
      position: 0
    });
    
    for (let i = 0; i < inputString.length; i++) {
      const inputSymbol = inputString[i];
      const transition = transitions.find(t => t.from === currentState && t.symbol === inputSymbol);
      
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
      const newOutput = outputFunction[currentState] || '';
      outputString += newOutput;
      
      steps.push({
        title: 'Transition',
        description: `${transition.from} --${transition.symbol}--> ${transition.to}`,
        details: `Input: '${inputSymbol}', New state output: '${newOutput}'`,
        state: currentState,
        remainingInput: inputString.slice(i + 1),
        outputSoFar: outputString,
        position: i + 1,
        transition,
        highlightTransition: transition
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
    const transitions = statesInput.split(',').map(s => s.trim()).filter(s => s).length > 0 ? 
      transitionsInput.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.trim().split(/\s*,\s*/);
        if (parts.length === 3) {
          return { from: parts[0].trim(), symbol: parts[1].trim(), to: parts[2].trim() };
        }
        return null;
      }).filter(t => t) : [];
    const outputFunction = parseOutputFunction(outputFunctionInput);
    
    setIsRunning(true);
    setIsStepping(false);
    
    const result = simulateMooreMachine(states, inputAlphabet, outputAlphabet, transitions, outputFunction, startState, inputString);
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
  }, [statesInput, inputAlphabetInput, outputAlphabetInput, transitionsInput, outputFunctionInput, startState, inputString, parseOutputFunction, simulateMooreMachine]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = parseStates(statesInput);
      const inputAlphabet = parseAlphabet(inputAlphabetInput);
      const outputAlphabet = parseAlphabet(outputAlphabetInput);
      const transitions = statesInput.split(',').map(s => s.trim()).filter(s => s).length > 0 ? 
        transitionsInput.split('\n').filter(line => line.trim()).map(line => {
          const parts = line.trim().split(/\s*,\s*/);
          if (parts.length === 3) {
            return { from: parts[0].trim(), symbol: parts[1].trim(), to: parts[2].trim() };
          }
          return null;
        }).filter(t => t) : [];
      const outputFunction = parseOutputFunction(outputFunctionInput);
      
      const result = simulateMooreMachine(states, inputAlphabet, outputAlphabet, transitions, outputFunction, startState, inputString);
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, inputAlphabetInput, outputAlphabetInput, transitionsInput, outputFunctionInput, startState, inputString, parseOutputFunction, simulateMooreMachine]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;
    
    const states = parseStates(statesInput);
    const transitions = statesInput.split(',').map(s => s.trim()).filter(s => s).length > 0 ? 
      transitionsInput.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.trim().split(/\s*,\s*/);
        if (parts.length === 3) {
          return { from: parts[0].trim(), symbol: parts[1].trim(), to: parts[2].trim() };
        }
        return null;
      }).filter(t => t) : [];
    const outputFunction = parseOutputFunction(outputFunctionInput);
    
    const currentStepData = data.steps[currentStep];
    const visualizationData = {
      states,
      transitions,
      startState,
      outputFunction,
      currentState: currentStepData?.state,
      highlightTransition: currentStepData?.highlightTransition || currentStepData?.transition
    };
    
    renderMooreMachine(svg, visualizationData);
  }, [statesInput, transitionsInput, outputFunctionInput, startState, currentStep, parseOutputFunction]); // Added parseOutputFunction dependency

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
          <InputPanel title="Moore Machine Definition">
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
              label="Transitions (from,input,to per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q1&#10;q0,1,q0&#10;q1,0,q2"
              rows={6}
            />
            <TextAreaField
              label="Output Function (state,output per line)"
              value={outputFunctionInput}
              onChange={setOutputFunctionInput}
              placeholder="q0,a&#10;q1,b&#10;q2,a"
              rows={4}
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
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Moore Machine Features:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <li>• Output depends ONLY on current state</li>
                <li>• Output function: state → output</li>
                <li>• Output produced when entering states</li>
                <li>• Generally requires more states than Mealy</li>
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Moore Machine Visualization"
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

export default MooreMachinePlayground;