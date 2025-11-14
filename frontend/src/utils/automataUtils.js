// Utility functions for automata operations

export const parseStates = (statesString) => {
  if (!statesString.trim()) return [];
  return statesString.split(',').map(s => s.trim()).filter(s => s);
};

export const parseAlphabet = (alphabetString) => {
  if (!alphabetString.trim()) return [];
  return alphabetString.split(',').map(s => s.trim()).filter(s => s);
};

export const parseTransitions = (transitionsString) => {
  if (!transitionsString.trim()) return [];
  
  const transitions = [];
  const lines = transitionsString.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const parts = line.trim().split(/\s*,\s*/);
    if (parts.length === 3) {
      const [from, symbol, to] = parts;
      transitions.push({ from: from.trim(), symbol: symbol.trim(), to: to.trim() });
    }
  }
  
  return transitions;
};

export const validateDFA = (states, alphabet, transitions, startState, finalStates) => {
  const errors = [];
  
  if (states.length === 0) {
    errors.push('At least one state is required');
  }
  
  if (alphabet.length === 0) {
    errors.push('At least one symbol in alphabet is required');
  }
  
  if (!startState || !states.includes(startState)) {
    errors.push('Start state must be one of the defined states');
  }
  
  const finalStatesList = parseStates(finalStates);
  for (const finalState of finalStatesList) {
    if (!states.includes(finalState)) {
      errors.push(`Final state '${finalState}' is not in the state set`);
    }
  }
  
  // Check if all transitions are valid
  for (const transition of transitions) {
    if (!states.includes(transition.from)) {
      errors.push(`Transition from state '${transition.from}' is not valid`);
    }
    if (!states.includes(transition.to)) {
      errors.push(`Transition to state '${transition.to}' is not valid`);
    }
    if (!alphabet.includes(transition.symbol)) {
      errors.push(`Transition symbol '${transition.symbol}' is not in alphabet`);
    }
  }
  
  // Check for completeness (each state should have transition for each symbol)
  for (const state of states) {
    for (const symbol of alphabet) {
      const hasTransition = transitions.some(t => t.from === state && t.symbol === symbol);
      if (!hasTransition) {
        errors.push(`Missing transition from state '${state}' on symbol '${symbol}'`);
      }
    }
  }
  
  return errors;
};

export const simulateDFA = (states, alphabet, transitions, startState, finalStates, inputString) => {
  const finalStatesList = parseStates(finalStates);
  const steps = [];
  let currentState = startState;
  
  steps.push({
    title: 'Initialize',
    description: `Starting at state '${currentState}'`,
    details: `Input: "${inputString}"`,
    state: currentState,
    remainingInput: inputString,
    position: 0,
    transition: null
  });
  
  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const transition = transitions.find(t => t.from === currentState && t.symbol === symbol);
    
    if (!transition) {
      steps.push({
        title: 'Transition Failed',
        description: `No transition from '${currentState}' on symbol '${symbol}'`,
        details: `Input rejected at position ${i}`,
        state: currentState,
        remainingInput: inputString.slice(i),
        position: i,
        error: true,
        transition: null
      });
      return { accepted: false, steps };
    }
    
    const previousState = currentState;
    currentState = transition.to;
    steps.push({
      title: 'Transition',
      description: `From '${transition.from}' to '${transition.to}' on '${symbol}'`,
      details: `Remaining input: "${inputString.slice(i + 1)}"`,
      state: currentState,
      remainingInput: inputString.slice(i + 1),
      position: i + 1,
      transition: { from: previousState, symbol, to: currentState },
      highlightTransition: { from: previousState, symbol, to: currentState }
    });
  }
  
  const accepted = finalStatesList.includes(currentState);
  steps.push({
    title: 'Final Check',
    description: `Ended in state '${currentState}' - ${accepted ? 'ACCEPTED' : 'REJECTED'}`,
    details: `Final states: {${finalStatesList.join(', ')}}`,
    state: currentState,
    remainingInput: '',
    position: inputString.length,
    final: true,
    accepted,
    transition: null
  });
  
  return { accepted, steps };
};

export const createTransitionTable = (states, alphabet, transitions) => {
  const table = {};
  
  // Initialize table
  for (const state of states) {
    table[state] = {};
    for (const symbol of alphabet) {
      table[state][symbol] = null;
    }
  }
  
  // Fill in transitions
  for (const transition of transitions) {
    table[transition.from][transition.symbol] = transition.to;
  }
  
  return table;
};