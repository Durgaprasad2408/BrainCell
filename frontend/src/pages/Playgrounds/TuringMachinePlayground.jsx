import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField, SelectField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { renderTuringMachine } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const TuringMachinePlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // TM Input states
  const [statesInput, setStatesInput] = useState('q0,q1,q2,qaccept,qreject');
  const [alphabetInput, setAlphabetInput] = useState('0,1');
  const [tapeAlphabetInput, setTapeAlphabetInput] = useState('0,1,_');
  const [transitionsInput, setTransitionsInput] = useState('q0,0,q1,1,R\nq0,1,q0,1,R\nq0,_,qaccept,_,R\nq1,0,q2,0,R\nq1,1,q0,1,R\nq1,_,qreject,_,R\nq2,0,q1,1,R\nq2,1,q2,0,R\nq2,_,qaccept,_,R');
  const [startState, setStartState] = useState('q0');
  const [acceptState, setAcceptState] = useState('qaccept');
  const [rejectState, setRejectState] = useState('qreject');
  const [inputString, setInputString] = useState('110');
  const [blankSymbol, setBlankSymbol] = useState('_');

  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const parseTransitions = useCallback((transitionsString) => {
    if (!transitionsString.trim()) return [];

    const transitions = [];
    const lines = transitionsString.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s*,\s*/);
      if (parts.length === 5) {
        const [from, read, to, write, move] = parts;
        transitions.push({
          from: from.trim(),
          read: read.trim(),
          to: to.trim(),
          write: write.trim(),
          move: move.trim()
        });
      }
    }

    return transitions;
  }, []);

  const simulateTuringMachine = useCallback((states, alphabet, tapeAlphabet, transitions, startState, acceptState, rejectState, input, blankSymbol) => {
    const steps = [];

    // Initialize tape with input and blanks
    const tape = [];
    // Add some blanks to the left
    for (let i = 0; i < 5; i++) tape.push(blankSymbol);
    // Add input
    for (const char of input) tape.push(char);
    // Add blanks to the right
    for (let i = 0; i < 15; i++) tape.push(blankSymbol);

    let currentState = startState;
    let headPosition = 5; // Start at beginning of input
    let stepCount = 0;
    const maxSteps = 100; // Prevent infinite loops

    steps.push({
      title: 'Initialize',
      description: `Starting Turing Machine simulation`,
      details: `Input: "${input}", Start state: ${startState}`,
      state: currentState,
      tape: [...tape],
      headPosition,
      stepCount
    });

    while (stepCount < maxSteps) {
      // Check for accept/reject states
      if (currentState === acceptState) {
        steps.push({
          title: 'Accept',
          description: `Reached accept state: ${acceptState}`,
          details: `Input accepted after ${stepCount} steps`,
          state: currentState,
          tape: [...tape],
          headPosition,
          stepCount,
          final: true,
          accepted: true
        });
        return { accepted: true, steps };
      }

      if (currentState === rejectState) {
        steps.push({
          title: 'Reject',
          description: `Reached reject state: ${rejectState}`,
          details: `Input rejected after ${stepCount} steps`,
          state: currentState,
          tape: [...tape],
          headPosition,
          stepCount,
          final: true,
          accepted: false
        });
        return { accepted: false, steps };
      }

      // Read current symbol
      const currentSymbol = tape[headPosition] || blankSymbol;

      // Find applicable transition
      const transition = transitions.find(t =>
        t.from === currentState && t.read === currentSymbol
      );

      if (!transition) {
        steps.push({
          title: 'No Transition',
          description: `No transition from ${currentState} on symbol '${currentSymbol}'`,
          details: `Machine halts - input rejected`,
          state: currentState,
          tape: [...tape],
          headPosition,
          stepCount,
          final: true,
          accepted: false,
          error: true
        });
        return { accepted: false, steps };
      }

      // Apply transition
      tape[headPosition] = transition.write;
      currentState = transition.to;

      // Move head
      if (transition.move === 'R') {
        headPosition++;
        if (headPosition >= tape.length) {
          tape.push(blankSymbol);
        }
      } else if (transition.move === 'L') {
        headPosition--;
        if (headPosition < 0) {
          tape.unshift(blankSymbol);
          headPosition = 0;
        }
      }

      stepCount++;

      steps.push({
        title: 'Transition',
        description: `${transition.from} → ${transition.to}`,
        details: `Read '${transition.read}', Write '${transition.write}', Move ${transition.move}`,
        state: currentState,
        tape: [...tape],
        headPosition,
        stepCount,
        transition,
        highlightTransition: transition
      });
    }

    // Max steps reached
    steps.push({
      title: 'Timeout',
      description: `Maximum steps (${maxSteps}) reached`,
      details: `Machine may be in infinite loop - simulation stopped`,
      state: currentState,
      tape: [...tape],
      headPosition,
      stepCount,
      final: true,
      accepted: false,
      timeout: true
    });

    return { accepted: false, steps };
  }, []);

  const handleRun = useCallback(() => {
    const states = statesInput.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = alphabetInput.split(',').map(s => s.trim()).filter(s => s);
    const tapeAlphabet = tapeAlphabetInput.split(',').map(s => s.trim()).filter(s => s);
    const transitions = parseTransitions(transitionsInput);

    setIsRunning(true);
    setIsStepping(false);

    const result = simulateTuringMachine(
      states, alphabet, tapeAlphabet, transitions,
      startState, acceptState, rejectState, inputString, blankSymbol
    );
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
  }, [statesInput, alphabetInput, tapeAlphabetInput, transitionsInput, startState, acceptState, rejectState, inputString, blankSymbol, parseTransitions, simulateTuringMachine]);

  const handleStep = useCallback(() => {
    if (!simulationResult) {
      const states = statesInput.split(',').map(s => s.trim()).filter(s => s);
      const alphabet = alphabetInput.split(',').map(s => s.trim()).filter(s => s);
      const tapeAlphabet = tapeAlphabetInput.split(',').map(s => s.trim()).filter(s => s);
      const transitions = parseTransitions(transitionsInput);

      const result = simulateTuringMachine(
        states, alphabet, tapeAlphabet, transitions,
        startState, acceptState, rejectState, inputString, blankSymbol
      );
      setSimulationResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < simulationResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResult, currentStep, statesInput, alphabetInput, tapeAlphabetInput, transitionsInput, startState, acceptState, rejectState, inputString, blankSymbol, parseTransitions, simulateTuringMachine]);

  const handleClear = useCallback(() => {
    setSimulationResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    const currentStepData = data.steps[currentStep];
    if (!currentStepData) return;

    const visualizationData = {
      tape: currentStepData.tape,
      headPosition: currentStepData.headPosition,
      currentState: currentStepData.state,
      states: statesInput.split(',').map(s => s.trim()).filter(s => s),
      highlightTransition: currentStepData.highlightTransition || currentStepData.transition
    };

    renderTuringMachine(svg, visualizationData);
  }, [statesInput, currentStep]);

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
          <InputPanel title="Turing Machine Definition">
            <InputField
              label="States (comma-separated)"
              value={statesInput}
              onChange={setStatesInput}
              placeholder="q0,q1,q2,qaccept,qreject"
            />
            <InputField
              label="Input Alphabet (comma-separated)"
              value={alphabetInput}
              onChange={setAlphabetInput}
              placeholder="0,1"
            />
            <InputField
              label="Tape Alphabet (comma-separated)"
              value={tapeAlphabetInput}
              onChange={setTapeAlphabetInput}
              placeholder="0,1,_"
            />
            <TextAreaField
              label="Transitions (from,read,to,write,move per line)"
              value={transitionsInput}
              onChange={setTransitionsInput}
              placeholder="q0,0,q1,1,R&#10;q0,1,q0,1,R&#10;q0,_,qaccept,_,R"
              rows={8}
            />
            <InputField
              label="Start State"
              value={startState}
              onChange={setStartState}
              placeholder="q0"
            />
            <InputField
              label="Accept State"
              value={acceptState}
              onChange={setAcceptState}
              placeholder="qaccept"
            />
            <InputField
              label="Reject State"
              value={rejectState}
              onChange={setRejectState}
              placeholder="qreject"
            />
            <InputField
              label="Input String"
              value={inputString}
              onChange={setInputString}
              placeholder="110"
            />
            <InputField
              label="Blank Symbol"
              value={blankSymbol}
              onChange={setBlankSymbol}
              placeholder="_"
            />

            {/* 3. Apply isDark logic to info box */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                Turing Machine Components:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                <li>• <strong>Tape:</strong> Infinite in both directions</li>
                <li>• <strong>Head:</strong> Reads/writes and moves L/R</li>
                <li>• <strong>States:</strong> Control the machine's behavior</li>
                <li>• <strong>Transitions:</strong> (state,read) → (state,write,move)</li>
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Turing Machine Tape"
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
                Machine Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current State:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {simulationResult.steps[currentStep]?.state || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Head Position:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {simulationResult.steps[currentStep]?.headPosition || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Steps Executed:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {simulationResult.steps[currentStep]?.stepCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Symbol:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {simulationResult.steps[currentStep]?.tape?.[simulationResult.steps[currentStep]?.headPosition] || blankSymbol}
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

export default TuringMachinePlayground;