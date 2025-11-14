import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper';
import InputPanel, { InputField, SelectField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { renderChomskyHierarchy } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const ChomskyHierarchyPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state
  const [selectedType, setSelectedType] = useState('type-0');
  const [grammarExample, setGrammarExample] = useState('');
  const [languageExample, setLanguageExample] = useState('');
  const [machineType, setMachineType] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const grammarTypes = [
    {
      value: 'type-0',
      label: 'Type 0 - Unrestricted Grammar',
      description: 'No restrictions on production rules',
      machine: 'Turing Machine',
      example: 'S → aSBC | abC\nCB → BC\nbB → bb\nbC → bc\ncC → cc',
      language: 'Recursively enumerable languages',
      properties: ['Most general', 'Turing-complete', 'May not halt']
    },
    {
      value: 'type-1',
      label: 'Type 1 - Context-Sensitive Grammar',
      description: 'α → β where |α| ≤ |β| (non-contracting)',
      machine: 'Linear Bounded Automaton',
      example: 'S → aSBC | aBC\naB → ab\nbB → bb\nbC → bc\ncC → cc',
      language: 'Context-sensitive languages',
      properties: ['Non-contracting', 'Decidable', 'Exponential space']
    },
    {
      value: 'type-2',
      label: 'Type 2 - Context-Free Grammar',
      description: 'A → α where A is non-terminal',
      machine: 'Pushdown Automaton',
      example: 'S → aSb | ab\nS → SS | ε',
      language: 'Context-free languages',
      properties: ['Stack-based', 'Polynomial parsing', 'Programming languages']
    },
    {
      value: 'type-3',
      label: 'Type 3 - Regular Grammar',
      description: 'A → aB or A → a (right-linear)',
      machine: 'Finite Automaton',
      example: 'S → aS | bA\nA → aA | bS | ε',
      language: 'Regular languages',
      properties: ['Most restrictive', 'Linear time', 'Pattern matching']
    }
  ];

  const getCurrentType = useCallback(() => {
    return grammarTypes.find(type => type.value === selectedType);
  }, [selectedType]);

  const generateHierarchyVisualization = useCallback(() => {
    const steps = [];
    const currentType = getCurrentType();

    steps.push({
      title: 'Chomsky Hierarchy Overview',
      description: 'The Chomsky hierarchy classifies formal grammars into four types',
      details: 'Each type has specific restrictions and corresponding machine models'
    });

    steps.push({
      title: `Focus on ${currentType.label}`,
      description: currentType.description,
      details: `Recognized by: ${currentType.machine}`,
      highlightType: currentType.value
    });

    steps.push({
      title: 'Grammar Example',
      description: 'Example grammar for this type',
      details: currentType.example,
      highlightGrammar: currentType.example
    });

    steps.push({
      title: 'Properties',
      description: `Key properties: ${currentType.properties.join(', ')}`,
      details: `Language class: ${currentType.language}`,
      highlightProperties: currentType.properties,
      final: true,
      success: true
    });

    return {
      selectedType,
      currentType,
      allTypes: grammarTypes,
      steps
    };
  }, [selectedType, getCurrentType]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setIsStepping(false);

    const result = generateHierarchyVisualization();
    setHierarchyData(result);

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
  }, [generateHierarchyVisualization]);

  const handleStep = useCallback(() => {
    if (!hierarchyData) {
      const result = generateHierarchyVisualization();
      setHierarchyData(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < hierarchyData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [hierarchyData, currentStep, generateHierarchyVisualization]);

  const handleClear = useCallback(() => {
    setHierarchyData(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;

    renderChomskyHierarchy(svg, {
      selectedType: data.selectedType,
      currentType: data.currentType,
      allTypes: data.allTypes,
      currentStep,
      highlightType: data.steps[currentStep]?.highlightType,
      highlightGrammar: data.steps[currentStep]?.highlightGrammar,
      highlightProperties: data.steps[currentStep]?.highlightProperties
    });
  }, [currentStep]);

  // Update examples when type changes
  React.useEffect(() => {
    const currentType = getCurrentType();
    setGrammarExample(currentType.example);
    setLanguageExample(currentType.language);
    setMachineType(currentType.machine);
  }, [selectedType, getCurrentType]);

  return (
    <PlaygroundThemeWrapper>
      <PlaygroundLayout
        onRun={handleRun}
        onClear={handleClear}
        onStep={handleStep}
        isRunning={isRunning}
        canStep={!isRunning && (!hierarchyData || currentStep < hierarchyData.steps.length - 1)}
        hasResults={!!hierarchyData}
      >
        {/* Input Section */}
        <div className="lg:col-span-1">
          <InputPanel title="Grammar Classification">
            <SelectField
              label="Grammar Type"
              value={selectedType}
              onChange={setSelectedType}
              options={grammarTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />

            <InputField
              label="Corresponding Machine"
              value={machineType}
              onChange={() => {}} // Read-only
              placeholder="Machine type"
            />

            {/* 3. Apply isDark logic to panels */}
            <div className={`mt-4 p-4 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Grammar Example:
              </h4>
              <pre className={`text-xs font-mono whitespace-pre-wrap p-2 rounded ${
                isDark
                  ? 'text-gray-300 bg-gray-900'
                  : 'text-gray-700 bg-gray-50'
              }`}>
                {grammarExample}
              </pre>
            </div>

            <div className={`mt-4 p-4 rounded-lg border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Language Class:
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {languageExample}
              </p>
            </div>

            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                Hierarchy Properties:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Type 3 ⊆ Type 2 ⊆ Type 1 ⊆ Type 0</li>
                <li>• Each level is strictly more powerful</li>
                <li>• Different computational requirements</li>
                <li>• Practical applications vary by type</li>
              </ul>
            </div>

            <div className={`mt-4 p-3 border rounded-lg ${
              isDark
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Current Type Properties:
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                {getCurrentType().properties.map((prop, index) => (
                  <li key={index}>• {prop}</li>
                ))}
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          <VisualizationPanel
            title="Chomsky Hierarchy Visualization"
            data={hierarchyData}
            renderFunction={renderVisualization}
          />
        </div>

        {/* Workflow Section */}
        <div className="lg:col-span-1">
          <WorkflowPanel
            title="Hierarchy Exploration"
            steps={hierarchyData?.steps || []}
            currentStep={currentStep}
          />

          {hierarchyData && (
            <div className="mt-4 space-y-4">
              {/* 3. Apply isDark logic to comparison table panel */}
              <div className={`p-4 rounded-lg shadow-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Comparison Table
                </h3>
                <div className="overflow-x-auto">
                  <table className={`w-full text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Restriction</th>
                        <th className="text-left p-2">Machine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grammarTypes.map((type, index) => (
                        <tr
                          key={type.value}
                          className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} ${
                            type.value === selectedType ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                          }`}
                        >
                          <td className="p-2 font-medium">{index}</td>
                          <td className="p-2">{type.description}</td>
                          <td className="p-2">{type.machine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Apply isDark logic to applications panel */}
              <div className={`p-4 rounded-lg shadow-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Real-World Applications
                </h3>
                <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div><strong>Type 3 (Regular):</strong> Lexical analysis, pattern matching, network protocols</div>
                  <div><strong>Type 2 (Context-Free):</strong> Programming language syntax, XML parsing, arithmetic expressions</div>
                  <div><strong>Type 1 (Context-Sensitive):</strong> Natural language processing, type checking</div>
                  <div><strong>Type 0 (Unrestricted):</strong> General computation, artificial intelligence</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PlaygroundLayout>
    </PlaygroundThemeWrapper>
  );
};

export default ChomskyHierarchyPlayground;