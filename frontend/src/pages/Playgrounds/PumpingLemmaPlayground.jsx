import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '../../components/PlaygroundLayout';
// import PlaygroundThemeWrapper from '../../components/PlaygroundThemeWrapper'; // No longer needed
import InputPanel, { InputField, SelectField, TextAreaField } from '../../components/InputPanel';
import VisualizationPanel from '../../components/VisualizationPanel';
import WorkflowPanel from '../../components/WorkflowPanel';
import { renderPumpingLemma } from '../../utils/visualizationUtils';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. IMPORT THEME
import { Zap, HelpCircle, ListChecks, Check } from 'lucide-react'; // <-- Import icons

const PumpingLemmaPlayground = () => {
  const { isDark } = useTheme(); // <-- 2. USE THEME

  // ... (all your existing state and logic from line 9 to 326)
  const [languageType, setLanguageType] = useState('regular');
  const [languageDescription, setLanguageDescription] = useState('L = {a^n b^n | n ≥ 1}');
  const [testString, setTestString] = useState('aaabbb');
  const [pumpingLength, setPumpingLength] = useState('3');
  const [decomposition, setDecomposition] = useState('x=aa, y=a, z=bbb');
  const [pumpingValue, setPumpingValue] = useState('2');
  
  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [pumpingResult, setPumpingResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const languageTypes = [
    {
      value: 'regular',
      label: 'Regular Language',
      description: 'Languages recognized by finite automata',
      examples: [
        { desc: 'L = {a^n | n ≥ 0}', string: 'aaa', pumping: '2' },
        { desc: 'L = {(ab)^n | n ≥ 0}', string: 'abab', pumping: '2' },
        { desc: 'L = {w | w contains "ab"}', string: 'aabb', pumping: '3' }
      ]
    },
    {
      value: 'context-free',
      label: 'Context-Free Language',
      description: 'Languages recognized by pushdown automata',
      examples: [
        { desc: 'L = {a^n b^n | n ≥ 1}', string: 'aaabbb', pumping: '3' },
        { desc: 'L = {ww^R | w ∈ {a,b}*}', string: 'abba', pumping: '2' },
        { desc: 'L = {a^i b^j c^k | i=j or j=k}', string: 'aabbcc', pumping: '3' }
      ]
    },
    {
      value: 'non-context-free',
      label: 'Non-Context-Free Language',
      description: 'Languages that fail the context-free pumping lemma',
      examples: [
        { desc: 'L = {a^n b^n c^n | n ≥ 1}', string: 'aaabbbccc', pumping: '4' },
        { desc: 'L = {ww | w ∈ {a,b}*}', string: 'abab', pumping: '2' },
        { desc: 'L = {a^(n^2) | n ≥ 1}', string: 'aaaa', pumping: '2' }
      ]
    }
  ];

  const getCurrentLanguageType = useCallback(() => {
    return languageTypes.find(type => type.value === languageType);
  }, [languageType]);

  const parseDecomposition = useCallback((decomp) => {
    const parts = decomp.split(',').map(part => part.trim());
    const result = { x: '', y: '', z: '', u: '', v: '', w: '' };
    
    for (const part of parts) {
      const [variable, value] = part.split('=').map(s => s.trim());
      if (variable && value) {
        result[variable] = value;
      }
    }
    
    return result;
  }, []);

  const applyRegularPumpingLemma = useCallback((string, p, decomp, i) => {
    const { x, y, z } = decomp;
    
    // Validate decomposition
    if (x + y + z !== string) {
      return { valid: false, error: 'Decomposition does not match original string' };
    }
    
    if (y.length === 0) {
      return { valid: false, error: 'y cannot be empty' };
    }
    
    if ((x + y).length > p) {
      return { valid: false, error: 'xy must have length ≤ p' };
    }
    
    // Generate pumped string
    const pumpedString = x + y.repeat(i) + z;
    
    return {
      valid: true,
      pumpedString,
      originalLength: string.length,
      pumpedLength: pumpedString.length,
      yRepeats: i
    };
  }, []);

  const applyContextFreePumpingLemma = useCallback((string, p, decomp, i) => {
    const { u, v, x, w, y } = decomp;
    
    // Validate decomposition
    if (u + v + x + w + y !== string) {
      return { valid: false, error: 'Decomposition does not match original string' };
    }
    
    if (v.length === 0 && w.length === 0) {
      return { valid: false, error: 'v and w cannot both be empty' };
    }
    
    if ((v + x + w).length > p) {
      return { valid: false, error: 'vxw must have length ≤ p' };
    }
    
    // Generate pumped string
    const pumpedString = u + v.repeat(i) + x + w.repeat(i) + y;
    
    return {
      valid: true,
      pumpedString,
      originalLength: string.length,
      pumpedLength: pumpedString.length,
      vRepeats: i,
      wRepeats: i
    };
  }, []);

  const simulatePumpingLemma = useCallback((langType, langDesc, string, p, decomp, i) => {
    const steps = [];
    const parsedDecomp = parseDecomposition(decomp);
    const pumpingInt = parseInt(i);
    const pumpingLengthInt = parseInt(p);
    
    steps.push({
      title: 'Initialize Pumping Lemma Test',
      description: `Testing ${langType} pumping lemma`,
      details: `Language: ${langDesc}, String: "${string}", p = ${p}`,
      string,
      decomposition: parsedDecomp,
      pumpingLength: pumpingLengthInt,
      pumpingValue: pumpingInt
    });
    
    steps.push({
      title: 'Check String Length',
      description: `String length: ${string.length}`,
      details: string.length >= pumpingLengthInt ? 
        `|s| = ${string.length} ≥ ${pumpingLengthInt} = p ✓` : 
        `|s| = ${string.length} < ${pumpingLengthInt} = p ✗`,
      string,
      decomposition: parsedDecomp,
      pumpingLength: pumpingLengthInt,
      pumpingValue: pumpingInt,
      lengthCheck: string.length >= pumpingLengthInt
    });
    
    if (string.length < pumpingLengthInt) {
      steps.push({
        title: 'String Too Short',
        description: 'String is shorter than pumping length',
        details: 'Pumping lemma does not apply to strings shorter than p',
        string,
        decomposition: parsedDecomp,
        pumpingLength: pumpingLengthInt,
        pumpingValue: pumpingInt,
        final: true,
        success: false,
        error: true
      });
      return { success: false, steps };
    }
    
    let result;
    if (langType === 'regular') {
      result = applyRegularPumpingLemma(string, pumpingLengthInt, parsedDecomp, pumpingInt);
      
      steps.push({
        title: 'Apply Regular Pumping Lemma',
        description: `Decomposition: s = xyz where x="${parsedDecomp.x}", y="${parsedDecomp.y}", z="${parsedDecomp.z}"`,
        details: `Conditions: |xy| ≤ p, |y| > 0`,
        string,
        decomposition: parsedDecomp,
        pumpingLength: pumpingLengthInt,
        pumpingValue: pumpingInt,
        decompositionValid: result.valid
      });
      
      if (result.valid) {
        steps.push({
          title: 'Pump the String',
          description: `Pumping y ${pumpingInt} times: xy^${pumpingInt}z`,
          details: `Result: "${result.pumpedString}" (length: ${result.pumpedLength})`,
          string,
          decomposition: parsedDecomp,
          pumpingLength: pumpingLengthInt,
          pumpingValue: pumpingInt,
          pumpedString: result.pumpedString,
          originalLength: result.originalLength,
          pumpedLength: result.pumpedLength
        });
      }
    } else if (langType === 'context-free') {
      result = applyContextFreePumpingLemma(string, pumpingLengthInt, parsedDecomp, pumpingInt);
      
      steps.push({
        title: 'Apply Context-Free Pumping Lemma',
        description: `Decomposition: s = uvxwy where u="${parsedDecomp.u}", v="${parsedDecomp.v}", x="${parsedDecomp.x}", w="${parsedDecomp.w}", y="${parsedDecomp.y}"`,
        details: `Conditions: |vxw| ≤ p, |vw| > 0`,
        string,
        decomposition: parsedDecomp,
        pumpingLength: pumpingLengthInt,
        pumpingValue: pumpingInt,
        decompositionValid: result.valid
      });
      
      if (result.valid) {
        steps.push({
          title: 'Pump the String',
          description: `Pumping v and w ${pumpingInt} times: uv^${pumpingInt}xw^${pumpingInt}y`,
          details: `Result: "${result.pumpedString}" (length: ${result.pumpedLength})`,
          string,
          decomposition: parsedDecomp,
          pumpingLength: pumpingLengthInt,
          pumpingValue: pumpingInt,
          pumpedString: result.pumpedString,
          originalLength: result.originalLength,
          pumpedLength: result.pumpedLength
        });
      }
    }
    
    if (!result.valid) {
      steps.push({
        title: 'Invalid Decomposition',
        description: result.error,
        details: 'Please check your decomposition and try again',
        string,
        decomposition: parsedDecomp,
        pumpingLength: pumpingLengthInt,
        pumpingValue: pumpingInt,
        final: true,
        success: false,
        error: true
      });
      return { success: false, steps };
    }
    
    // Check if pumped string is in language (simplified check)
    const inLanguage = checkLanguageMembership(langDesc, result.pumpedString);
    
    steps.push({
      title: 'Check Language Membership',
      description: `Is "${result.pumpedString}" in the language?`,
      details: inLanguage ? 
        'The pumped string is in the language ✓' : 
        'The pumped string is NOT in the language ✗',
      string,
      decomposition: parsedDecomp,
      pumpingLength: pumpingLengthInt,
      pumpingValue: pumpingInt,
      pumpedString: result.pumpedString,
      inLanguage,
      final: true,
      success: inLanguage
    });
    
    return { success: inLanguage, steps, pumpedString: result.pumpedString };
  }, [parseDecomposition, applyRegularPumpingLemma, applyContextFreePumpingLemma]);

  const checkLanguageMembership = useCallback((langDesc, string) => {
    // Simplified language membership checking
    if (langDesc.includes('a^n b^n')) {
      const aCount = (string.match(/a/g) || []).length;
      const bCount = (string.match(/b/g) || []).length;
      return aCount === bCount && aCount > 0 && /^a*b*$/.test(string);
    }
    
    if (langDesc.includes('a^n b^n c^n')) {
      const aCount = (string.match(/a/g) || []).length;
      const bCount = (string.match(/b/g) || []).length;
      const cCount = (string.match(/c/g) || []).length;
      return aCount === bCount && bCount === cCount && aCount > 0 && /^a*b*c*$/.test(string);
    }
    
    if (langDesc.includes('(ab)^n')) {
      return /^(ab)*$/.test(string);
    }
    
    if (langDesc.includes('ww^R')) {
      const len = string.length;
      if (len % 2 !== 0) return false;
      const w = string.substring(0, len / 2);
      const wR = string.substring(len / 2).split('').reverse().join('');
      return w === wR;
    }
    
    // Default: assume it's in the language for demonstration
    return true;
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setIsStepping(false);
    
    const result = simulatePumpingLemma(
      languageType,
      languageDescription,
      testString,
      pumpingLength,
      decomposition,
      pumpingValue
    );
    setPumpingResult(result);
    
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
  }, [languageType, languageDescription, testString, pumpingLength, decomposition, pumpingValue, simulatePumpingLemma]);

  const handleStep = useCallback(() => {
    if (!pumpingResult) {
      const result = simulatePumpingLemma(
        languageType,
        languageDescription,
        testString,
        pumpingLength,
        decomposition,
        pumpingValue
      );
      setPumpingResult(result);
      setCurrentStep(0);
      setIsStepping(true);
    } else if (currentStep < pumpingResult.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [pumpingResult, currentStep, languageType, languageDescription, testString, pumpingLength, decomposition, pumpingValue, simulatePumpingLemma]);

  const handleClear = useCallback(() => {
    setPumpingResult(null);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsStepping(false);
  }, []);

  const handleExampleSelect = useCallback((example) => {
    setLanguageDescription(example.desc);
    setTestString(example.string);
    setPumpingLength(example.pumping);
    
    // Set appropriate decomposition based on language type
    if (languageType === 'regular') {
      if (example.string === 'aaa') {
        setDecomposition('x=, y=a, z=aa');
      } else if (example.string === 'abab') {
        setDecomposition('x=, y=ab, z=ab');
      } else {
        setDecomposition('x=a, y=a, z=bb');
      }
    } else if (languageType === 'context-free') {
      if (example.string === 'aaabbb') {
        setDecomposition('u=, v=a, x=aa, w=b, y=bb');
      } else if (example.string === 'abba') {
        setDecomposition('u=, v=a, x=bb, w=a, y=');
      } else {
        setDecomposition('u=aa, v=bb, x=, w=cc, y=');
      }
    } else {
      if (example.string === 'aaabbbccc') {
        setDecomposition('u=, v=a, x=aab, w=b, y=bccc');
      } else {
        setDecomposition('u=, v=a, x=b, w=a, y=b');
      }
    }
  }, [languageType]);

  const renderVisualization = useCallback((svg, data) => {
    if (!data) return;
    
    const currentStepData = data.steps[currentStep];
    if (!currentStepData) return;
    
    renderPumpingLemma(svg, {
      languageType,
      string: currentStepData.string,
      decomposition: currentStepData.decomposition,
      pumpingLength: currentStepData.pumpingLength,
      pumpingValue: currentStepData.pumpingValue,
      pumpedString: currentStepData.pumpedString,
      step: currentStep,
      totalSteps: data.steps.length,
      highlightParts: currentStepData.highlightParts,
      highlightPumping: currentStepData.highlightPumping
    });
  }, [languageType, currentStep]);

  return (
    // 3. ADDED: Main theme wrapper from Dashboard.jsx
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    } pt-20 pb-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      
      {/* NOTE: PlaygroundLayout needs to be updated internally to use useTheme()
        to apply its own styles.
      */}
      <PlaygroundLayout
        onRun={handleRun}
        onClear={handleClear}
        onStep={handleStep}
        isRunning={isRunning}
        canStep={!isRunning && (!pumpingResult || currentStep < pumpingResult.steps.length - 1)}
        hasResults={!!pumpingResult}
      >
        {/* Input Section */}
        <div className="lg:col-span-1">
          {/* NOTE: InputPanel, SelectField, and InputField components
            MUST be updated internally to use useTheme() to style themselves.
          */}
          <InputPanel title="Pumping Lemma Configuration">
            <SelectField
              label="Language Type"
              value={languageType}
              onChange={setLanguageType}
              options={languageTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
            
            <InputField
              label="Language Description"
              value={languageDescription}
              onChange={setLanguageDescription}
              placeholder="L = {a^n b^n | n ≥ 1}"
            />
            
            <InputField
              label="Test String"
              value={testString}
              onChange={setTestString}
              placeholder="aaabbb"
            />
            
            <InputField
              label="Pumping Length (p)"
              value={pumpingLength}
              onChange={setPumpingLength}
              placeholder="3"
              type="number"
            />
            
            <InputField
              label={languageType === 'regular' ? 'Decomposition (x,y,z)' : 'Decomposition (u,v,x,w,y)'}
              value={decomposition}
              onChange={setDecomposition}
              placeholder={languageType === 'regular' ? 'x=aa, y=a, z=bbb' : 'u=, v=a, x=aa, w=b, y=bb'}
            />
            
            <InputField
              label="Pumping Value (i)"
              value={pumpingValue}
              onChange={setPumpingValue}
              placeholder="2"
              type="number"
            />
            
            {/* 4. REFACTORED: Examples Box */}
            <div className={`mt-4 p-3 rounded-lg ${
              isDark 
              ? 'bg-blue-900/20 border border-blue-800' 
              : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 flex items-center ${
                isDark ? 'text-blue-200' : 'text-blue-800'
              }`}>
                <Zap className="w-4 h-4 inline mr-1" />
                {getCurrentLanguageType().label} Examples:
              </h4>
              <div className="space-y-2">
                {getCurrentLanguageType().examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleSelect(example)}
                    className={`block w-full text-left text-xs p-2 rounded transition-colors ${
                      isDark
                      ? 'text-blue-300 hover:bg-blue-800'
                      : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <div className="font-medium">{example.desc}</div>
                    <div className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                      String: "{example.string}", p = {example.pumping}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 4. REFACTORED: Rules Box */}
            <div className={`mt-4 p-3 rounded-lg ${
              isDark
              ? 'bg-yellow-900/20 border border-yellow-800'
              : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h4 className={`text-sm font-medium mb-2 flex items-center ${
                isDark ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                <HelpCircle className="w-4 h-4 inline mr-1" />
                Pumping Lemma Rules:
              </h4>
              <ul className={`text-sm space-y-1 ${
                isDark ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                {languageType === 'regular' ? (
                  <>
                    <li>• |xy| ≤ p (xy fits within pumping length)</li>
                    <li>• |y| {'>'} 0 (y cannot be empty)</li>
                    <li>• xy^i z must be in L for all i ≥ 0</li>
                  </>
                ) : (
                  <>
                    <li>• |vxw| ≤ p (vxw fits within pumping length)</li>
                    <li>• |vw| {'>'} 0 (v and w cannot both be empty)</li>
                    <li>• uv^i xw^i y must be in L for all i ≥ 0</li>
                  </>
                )}
              </ul>
            </div>
          </InputPanel>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-1">
          {/* NOTE: This component must also be updated to use useTheme() */}
          <VisualizationPanel
            title="Pumping Lemma Visualization"
            data={pumpingResult}
            renderFunction={renderVisualization}
          />
        </div>

        {/* Workflow Section */}
        <div className="lg:col-span-1">
          {/* NOTE: This component must also be updated to use useTheme() */}
          <WorkflowPanel
            title="Pumping Process"
            steps={pumpingResult?.steps || []}
            currentStep={currentStep}
          />
          
          {/* 4. REFACTORED: Current Analysis Box */}
          {pumpingResult && currentStep >= 0 && (
            <div className={`mt-4 p-4 rounded-xl shadow-sm border ${
              isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-3 flex items-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <ListChecks className="w-5 h-5 inline mr-2" />
                Current Analysis
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Language Type:</span>
                  <span className={`font-mono font-bold ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {getCurrentLanguageType().label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Original String:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    "{pumpingResult.steps[currentStep]?.string || ''}"
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pumping Length:</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    p = {pumpingResult.steps[currentStep]?.pumpingLength || 0}
                  </span>
                </div>
                {pumpingResult.steps[currentStep]?.pumpedString && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pumped String:</span>
                    <span className={`font-mono font-bold ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      "{pumpingResult.steps[currentStep].pumpedString}"
                    </span>
                  </div>
                )}
                {currentStep === pumpingResult.steps.length - 1 && pumpingResult.steps[currentStep]?.final && (
                  <div className={`flex justify-between pt-2 mt-2 ${
                    isDark ? 'border-t border-gray-600' : 'border-t border-gray-200'
                  }`}>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Result:</span>
                    <span className={`font-bold flex items-center ${
                      pumpingResult.success 
                      ? (isDark ? 'text-green-400' : 'text-green-600')
                      : (isDark ? 'text-red-400' : 'text-red-600')
                    }`}>
                      <Check className="w-4 h-4 inline mr-1" />
                      {pumpingResult.success ? 'SATISFIES LEMMA' : 'VIOLATES LEMMA'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PlaygroundLayout>
    </div>
  );
};

export default PumpingLemmaPlayground;