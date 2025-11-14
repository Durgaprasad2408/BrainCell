import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { parseStates, parseAlphabet } from '../../utils/automataUtils';
import { renderPDA } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const PDAPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // PDA Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2');
  const [inputAlphabetInput, setInputAlphabetInput] = useState('a,b');
  const [stackAlphabetInput, setStackAlphabetInput] = useState('A,Z');
  const [transitionsInput, setTransitionsInput] = useState('q0,a,Z,q0,AZ\nq0,a,A,q0,AA\nq0,b,A,q1,ε\nq1,b,A,q1,ε\nq1,ε,Z,q2,Z');
  const [startState, setStartState] = useState('q0');
  const [finalStates, setFinalStates] = useState('q2');
  const [startStackSymbol, setStartStackSymbol] = useState('Z');
  const [inputString, setInputString] = useState('aabb');

  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const parsePDATransitions = useCallback((transitionsString) => {
    if (!transitionsString.trim()) return [];

    const transitions = [];
    const lines = transitionsString.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s*,\s*/);
      if (parts.length === 5) {
        const [from, input, stackTop, to, stackPush] = parts;
        transitions.push({
          from: from.trim(),
          input: input.trim(),
          stackTop: stackTop.trim(),
          to: to.trim(),
          stackPush: stackPush.trim()
        });
      }
    }

    return transitions;
  }, []);

  const simulatePDA = useCallback((states, inputAlphabet, stackAlphabet, transitions, startState, finalStates, startStackSymbol, inputString) => {
    const steps = [];
    const finalStatesList = parseStates(finalStates);

    // Initialize configuration
    let currentState = startState;
    let stack = [startStackSymbol];
    let inputPosition = 0;

    steps.push({
      title: 'Initialize',
      description: `Starting PDA simulation`,
      details: `Input: "${inputString}", Stack: [${stack.join(', ')}]`,
      state: currentState,
      stack: [...stack],
      remainingInput: inputString,
      position: 0
    });

    const maxSteps = 100; // Prevent infinite loops
    let stepCount = 0;

    while (stepCount < maxSteps) {
      stepCount++;

      // Check for acceptance
      if (inputPosition >= inputString.length && finalStatesList.includes(currentState)) {
        steps.push({
          title: 'Accept',
          description: `Input accepted - reached final state ${currentState}`,
          details: `All input consumed, stack: [${stack.join(', ')}]`,
          state: currentState,
          stack: [...stack],
          remainingInput: '',
          position: inputPosition,
          final: true,
          accepted: true
        });
        return { accepted: true, steps };
      }

      // Get current input symbol (or epsilon)
      const currentInput = inputPosition < inputString.length ? inputString[inputPosition] : 'ε';
      const stackTop = stack.length > 0 ? stack[stack.length - 1] : '';

      // Find applicable transitions
      const applicableTransitions = transitions.filter(t =>
        t.from === currentState &&
        (t.input === currentInput || t.input === 'ε') &&
        (t.stackTop === stackTop || t.stackTop === 'ε')
      );

      if (applicableTransitions.length === 0) {
        steps.push({
          title: 'No Transition',
          description: `No applicable transition from ${currentState}`,
          details: `Input: '${currentInput}', Stack top: '${stackTop}'`,
          state: currentState,
          stack: [...stack],
          remainingInput: inputString.slice(inputPosition),
          position: inputPosition,
          final: true,
          accepted: false,
          error: true
        });
        return { accepted: false, steps };
      }

      // Take first applicable transition (non-deterministic choice)
      const transition = applicableTransitions[0];

      // Update state
      currentState = transition.to;

      // Update stack
      if (transition.stackTop !== 'ε' && stack.length > 0) {
        if (transition.stackTop === stack[stack.length - 1]) {
          stack.pop(); // Remove top element only if it matches
        } else {
          // This path might lead to rejection, but in a true non-deterministic simulation,
          // other paths might still lead to acceptance. This simplified version halts.
          steps.push({
            title: 'Stack Mismatch',
            description: `Expected '${transition.stackTop}' on stack top, found '${stack[stack.length - 1] || 'empty'}'`,
            details: `Transition cannot be applied in this path`,
            state: currentState, // Note: State has already changed based on transition rule
            stack: [...stack],
            remainingInput: inputString.slice(inputPosition),
            position: inputPosition,
            final: true,
            accepted: false,
            error: true
          });
          return { accepted: false, steps };
        }
      }

      if (transition.stackPush !== 'ε') {
        // Push new symbols (reverse order for correct stack behavior)
        const symbolsToPush = transition.stackPush.split('');
        for (let i = symbolsToPush.length - 1; i >= 0; i--) { // Push in reverse
            if (symbolsToPush[i] !== 'ε') {
                stack.push(symbolsToPush[i]);
            }
        }
      }


      // Update input position
      if (transition.input !== 'ε') {
        inputPosition++;
      }

      steps.push({
        title: 'Transition',
        description: `${transition.from} → ${transition.to}`,
        details: `Read: '${transition.input}', Pop: '${transition.stackTop}', Push: '${transition.stackPush}'`,
        state: currentState,
        stack: [...stack],
        remainingInput: inputString.slice(inputPosition),
        position: inputPosition,
        transition,
        highlightTransition: transition
      });
    }

    // Max steps reached
    steps.push({
      title: 'Timeout',
      description: `Maximum steps (${maxSteps}) reached`,
      details: `PDA may be in infinite loop - simulation stopped`,
      state: currentState,
      stack: [...stack],
      remainingInput: inputString.slice(inputPosition),
      position: inputPosition,
      final: true,
      accepted: false,
      timeout: true
    });

    return { accepted: false, steps };
  }, []);


  const handleRun = useCallback(() => {
    const states = parseStates(statesInput);
    const inputAlphabet = parseAlphabet(inputAlphabetInput);
    const stackAlphabet = parseAlphabet(stackAlphabetInput);
    const transitions = parsePDATransitions(transitionsInput);

    setIsRunning(true);
    setIsStepping(false);

    const result = simulatePDA(states, inputAlphabet, stackAlphabet, transitions, startState, finalStates, startStackSymbol, inputString);
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
  }, [statesInput, inputAlphabetInput, stackAlphabetInput, transitionsInput, startState, finalStates, startStackSymbol, inputString, parsePDATransitions, simulatePDA]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = parseStates(statesInput);
      const inputAlphabet = parseAlphabet(inputAlphabetInput);
      const stackAlphabet = parseAlphabet(stackAlphabetInput);
      const transitions = parsePDATransitions(transitionsInput);

      const result = simulatePDA(states, inputAlphabet, stackAlphabet, transitions, startState, finalStates, startStackSymbol, inputString);
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, inputAlphabetInput, stackAlphabetInput, transitionsInput, startState, finalStates, startStackSymbol, inputString, parsePDATransitions, simulatePDA]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    const states = parseStates(statesInput);
    const transitions = parsePDATransitions(transitionsInput);
    const finalStatesList = parseStates(finalStates);

    const currentStepData = data.steps[currentStep];
    const visualizationData = {
      states,
      transitions,
      startState,
      finalStates: finalStatesList,
      currentState: currentStepData?.state,
      stack: currentStepData?.stack || [],
      highlightTransition: currentStepData?.highlightTransition || currentStepData?.transition
    };

    renderPDA(svg, visualizationData);
  }, [statesInput, transitionsInput, startState, finalStates, currentStep, parsePDATransitions]); // Added parsePDATransitions dependency


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
          <InputPanel title="PDA Definition">
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
              placeholder="a,b"
            />
            <InputField
              label="Stack Alphabet (comma-separated)"
              value={stackAlphabetInput}
              onChange={setStackAlphabetInput}
              placeholder="A,Z"
            />
            <TextAreaField
              label="Transitions (from,input,stackTop,to,stackPush per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,a,Z,q0,AZ&#10;q0,a,A,q0,AA&#10;q0,b,A,q1,ε"
              rows={8}
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
              label="Start Stack Symbol"
              value={startStackSymbol}
              onChange={setStartStackSymbol}
              placeholder="Z"
            />
            <InputField
              label="Input String"
              value={inputString}
              onChange={setInputString}
              placeholder="aabb"
            />

            {/* 3. Apply isDark logic to info box 1 */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-indigo-900/20 border-indigo-800'
                : 'bg-indigo-50 border-indigo-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
                PDA Components:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <li>• <strong>Stack:</strong> LIFO memory for context-free languages</li>
                <li>• <strong>Transitions:</strong> (state,input,stackTop) → (state,stackPush)</li>
                <li>• <strong>ε-moves:</strong> Transitions without consuming input</li>
                <li>• <strong>Acceptance:</strong> Final state + empty input</li>
              </ul>
            </div>

            {/* 3. Apply isDark logic to info box 2 */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-yellow-900/20 border-yellow-800'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                Example: Balanced Parentheses
              </h4>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                The default PDA recognizes strings of the form a^n b^n (equal number of a's and b's).
                It pushes A's for each 'a' and pops them for each 'b'.
              </p>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="PDA Visualization"
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
                Current Configuration
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
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Stack:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    [{simulationResult.steps[currentStep]?.stack?.join(', ') || ''}]
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Remaining Input:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    "{simulationResult.steps[currentStep]?.remainingInput || ''}"
                  </span>
                </div>
                {currentStep === simulationResult.steps.length - 1 && simulationResult.steps[currentStep]?.final && (
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

export default PDAPlayground;