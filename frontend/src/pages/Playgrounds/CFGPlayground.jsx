import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { renderParseTree } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const CFGPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  // CFG Input states
  const [grammarInput, setGrammarInput] = useState('S -> A B\nA -> a A | a\nB -> b B | b');
  const [startSymbol, setStartSymbol] = useState('S');
  const [inputString, setInputString] = useState('aabb');

  // Parsing states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  // Simple recursive descent parser for demonstration
  const parseGrammar = useCallback((grammar) => {
    const rules = {};
    const lines = grammar.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (!line.includes('->')) continue;
      const [left, right] = line.split('->').map(s => s.trim());
      if (!left || !right) continue;

      if (!rules[left]) rules[left] = [];

      const productions = right.split('|').map(p => p.trim().split(/\s+/));
      rules[left].push(...productions);
    }

    return rules;
  }, []);

  const parseString = useCallback((rules, startSymbol, input) => {
    const steps = [];
    let parseTree = null;

    steps.push({
      title: 'Initialize Parser',
      description: `Starting to parse "${input}" with start symbol ${startSymbol}`,
      details: `Grammar rules: ${Object.keys(rules).length} non-terminals`
    });

    // Simple top-down parsing simulation
    const parse = (symbol, position, depth = 0) => {
      if (depth > 20) { // Prevent infinite recursion
        return { success: false, position, tree: null };
      }

      if (position >= input.length && symbol === '') {
        return { success: true, position, tree: null };
      }

      if (position >= input.length && symbol !== '') {
        return { success: false, position, tree: null };
      }

      // Terminal symbol
      if (!rules[symbol]) {
        if (position >= input.length) {
          return { success: false, position, tree: null };
        }
        if (input[position] === symbol) {
          steps.push({
            title: 'Match Terminal',
            description: `Matched terminal '${symbol}' at position ${position}`,
            details: `Terminal symbol matches input character`,
            highlightProduction: `Terminal: ${symbol}`,
            position
          });
          return {
            success: true,
            position: position + 1,
            tree: { value: symbol, children: [] }
          };
        } else {
          return { success: false, position, tree: null };
        }
      }

      // Non-terminal symbol - try each production
      for (const production of rules[symbol]) {
        let currentPos = position;
        const children = [];
        let success = true;

        // Handle epsilon production
        if (production.length === 1 && production[0] === 'ε') {
          steps.push({
            title: 'Apply Production',
            description: `Applied production: ${symbol} → ε`,
            details: `Epsilon production - no input consumed`,
            highlightProduction: `${symbol} → ε`,
            position: currentPos
          });
          return {
            success: true,
            position: currentPos,
            tree: { value: symbol, children: [{ value: 'ε', children: [] }] }
          };
        }

        steps.push({
          title: 'Try Production',
          description: `Trying production: ${symbol} → ${production.join(' ')}`,
          details: `Attempting to derive from position ${position}`,
          highlightProduction: `${symbol} → ${production.join(' ')}`,
          position: currentPos
        });

        for (const prodSymbol of production) {
          if (prodSymbol === 'ε') continue; // Skip epsilon symbols
          const result = parse(prodSymbol, currentPos, depth + 1);
          if (!result.success) {
            success = false;
            break;
          }
          currentPos = result.position;
          if (result.tree) children.push(result.tree);
        }

        if (success) {
          steps.push({
            title: 'Production Success',
            description: `Successfully applied: ${symbol} → ${production.join(' ')}`,
            details: `Derived symbols from position ${position} to ${currentPos}`,
            highlightProduction: `${symbol} → ${production.join(' ')}`,
            position: currentPos
          });
          return {
            success: true,
            position: currentPos,
            tree: { value: symbol, children }
          };
        }
      }

      return { success: false, position, tree: null };
    };

    steps.push({
      title: 'Begin Parsing',
      description: `Attempting to derive "${input}" from ${startSymbol}`,
      details: 'Using top-down recursive descent approach'
    });

    const result = parse(startSymbol, 0);

    if (result.success && result.position === input.length) {
      parseTree = result.tree;
      steps.push({
        title: 'Parse Successful',
        description: `Successfully parsed "${input}"`,
        details: 'String belongs to the language defined by the grammar'
      });
    } else {
      steps.push({
        title: 'Parse Failed',
        description: `Failed to parse "${input}"`,
        details: `String does not belong to the language defined by the grammar. Stopped at position ${result.position}`
      });
    }

    steps.push({
      title: 'Generate Parse Tree',
      description: parseTree ? 'Parse tree generated' : 'No parse tree (parsing failed)',
      details: parseTree ? 'Tree shows derivation structure' : 'Invalid input string',
      final: true,
      success: !!parseTree
    });

    return {
      success: result.success && result.position === input.length,
      parseTree,
      steps
    };
  }, []);

  const handleRun = useCallback(() => {
    const rules = parseGrammar(grammarInput);

    setIsRunning(true);
    setIsStepping(false);

    const result = parseString(rules, startSymbol, inputString);
    setParseResult(result);

    // Animate through steps
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
  }, [grammarInput, startSymbol, inputString, parseGrammar, parseString]);

  const handleStep = useCallback(() => {
    if (!parseResult) {
      const rules = parseGrammar(grammarInput);
      const result = parseString(rules, startSymbol, inputString);
      setParseResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < parseResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [parseResult, currentStep, grammarInput, startSymbol, inputString, parseGrammar, parseString]);

  const handleClear = useCallback(() => {
    setParseResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data || !data.parseTree) return;

    const currentStepData = data.steps[currentStep];
    renderParseTree(svg, {
      tree: data.parseTree,
      highlightProduction: currentStepData?.highlightProduction
    });
  }, [currentStep] // Depend only on currentStep
  );

  return (
    <PlaygroundThemeWrapper>
      <PlaygroundLayout
        onRun={handleRun}
        onClear={handleClear}
        onStep={handleStep}
        isRunning={isRunning}
        canStep={!isRunning && (!parseResult || currentStep < parseResult.steps.length - 1)}
        hasResults={!!parseResult}
      >
        {/* Input Section */}
        <div className="lg:col-span-1">
          <InputPanel title="Context-Free Grammar">
            <TextAreaField
              label="Grammar Rules (one per line)"
              value={grammarInput}
              onChange={setGrammarInput}
              placeholder="S -> A B\nA -> a A | a\nB -> b B | b"
              rows={6}
            />
            <InputField
              label="Start Symbol"
              value={startSymbol}
              onChange={setStartSymbol}
              placeholder="S"
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
                Grammar Format:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <li>• Use <code>{'->'}</code> to separate left and right sides</li>
                <li>• Use <code>|</code> to separate alternative productions</li>
                <li>• Terminals are lowercase, non-terminals uppercase</li>
                <li>• Example: <code>{'S -> a S b | ε'}</code></li>
              </ul>
            </div>

            {/* 3. Apply isDark logic to info box 2 */}
            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Parser Features:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                <li>• Top-down recursive descent parsing</li>
                <li>• Parse tree visualization</li>
                <li>• Step-by-step derivation</li>
                <li>• Grammar validation</li>
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Parse Tree"
            data={parseResult}
            renderFunction={renderVisualization}
          />
        </div>

        {/* Workflow Section */}
        <div className="lg:col-span-1">
          <WorkflowPanel
            title="Parsing Steps"
            steps={parseResult?.steps || []}
            currentStep={currentStep}
          />

          {parseResult && (
            // 3. Apply isDark logic to result panel
            <div className={`mt-4 p-4 rounded-lg shadow-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Parse Result
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Input String:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>"{inputString}"</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Start Symbol:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{startSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Result:</span>
                  <span className={`font-bold ${
                    parseResult.success
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {parseResult.success ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Parse Tree:</span>
                  <span className={`font-bold ${
                    parseResult.parseTree
                      ? isDark ? 'text-green-400' : 'text-green-600'
                      : isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {parseResult.parseTree ? 'Generated' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </PlaygroundLayout>
    </PlaygroundThemeWrapper>
  );
};

export default CFGPlayground;