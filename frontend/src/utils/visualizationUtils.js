import * as d3 from 'd3';

// Common visualization utilities for automata

export const renderDFA = (svg, data) => {
  const { states, transitions, startState, finalStates, currentState, highlightTransition } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  // Clear previous content
  svg.selectAll('*').remove();
  
  // Create main group with proper centering
  const g = svg.append('g');
  
  // Calculate optimal positioning with better spacing
  const padding = 80;
  const availableWidth = width - (2 * padding);
  const availableHeight = height - (2 * padding);
  const radius = Math.min(availableWidth, availableHeight) * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const statePositions = {};
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Define gradients and filters
  const defs = svg.append('defs');
  
  // Normal state gradient
  const normalGradient = defs.append('linearGradient')
    .attr('id', 'normalStateGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  normalGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#f8fafc');
  
  normalGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#e2e8f0');
  
  // Current state gradient
  const currentGradient = defs.append('linearGradient')
    .attr('id', 'currentStateGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  currentGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#3b82f6');
  
  currentGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#1e40af');
  
  // Start state gradient
  const startGradient = defs.append('linearGradient')
    .attr('id', 'startStateGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  startGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#10b981');
  
  startGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#047857');
  
  // Final state gradient
  const finalGradient = defs.append('linearGradient')
    .attr('id', 'finalStateGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  finalGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#f59e0b');
  
  finalGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#d97706');
  
  // Smooth glow filter
  const glowFilter = defs.append('filter')
    .attr('id', 'smoothGlow')
    .attr('x', '-50%').attr('y', '-50%')
    .attr('width', '200%').attr('height', '200%');
  
  glowFilter.append('feGaussianBlur')
    .attr('stdDeviation', '4')
    .attr('result', 'coloredBlur');
  
  const feMerge = glowFilter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  
  // Draw transitions with improved curves
  const links = g.selectAll('.transition-link')
    .data(transitions)
    .enter()
    .append('g')
    .attr('class', 'transition-link');
  
  links.append('path')
    .attr('d', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        // Self-loop with better positioning
        return `M ${source.x - 8} ${source.y - 40} 
                A 30 30 0 1 1 ${source.x + 8} ${source.y - 40}`;
      } else {
        // Calculate proper curve for better visibility
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = 0.2;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        return `M ${source.x} ${source.y} 
                Q ${midX + offsetX} ${midY + offsetY} ${target.x} ${target.y}`;
      }
    })
    .attr('stroke', d => {
      if (highlightTransition && 
          highlightTransition.from === d.from && 
          highlightTransition.symbol === d.symbol) {
        return '#ef4444';
      }
      return '#64748b';
    })
    .attr('stroke-width', d => {
      if (highlightTransition && 
          highlightTransition.from === d.from && 
          highlightTransition.symbol === d.symbol) {
        return 3;
      }
      return 2;
    })
    .attr('fill', 'none')
    .attr('marker-end', 'url(#arrowhead)')
    .style('opacity', 0.8);
  
  // Add transition labels with better positioning
  links.append('text')
    .attr('class', 'transition-label')
    .attr('x', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.x;
      } else {
        const midX = (source.x + target.x) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetX = -dy * 0.1;
        return midX + offsetX;
      }
    })
    .attr('y', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.y - 55;
      } else {
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetY = dx * 0.1;
        return midY + offsetY - 5;
      }
    })
    .text(d => d.symbol)
    .attr('fill', '#1f2937')
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none')
    .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)');
  
  // Define arrowhead marker
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 35)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b');
  
  // Draw states with perfect hover effects
  const nodes = g.selectAll('.state-node')
    .data(states)
    .enter()
    .append('g')
    .attr('class', 'state-node')
    .attr('transform', d => `translate(${statePositions[d].x}, ${statePositions[d].y})`)
    .style('cursor', 'pointer');
  
  // State circles with smooth animations
  const circles = nodes.append('circle')
    .attr('r', 32)
    .attr('fill', d => {
      if (d === currentState) {
        return 'url(#currentStateGradient)';
      } else if (d === startState) {
        return 'url(#startStateGradient)';
      } else if (finalStates.includes(d)) {
        return 'url(#finalStateGradient)';
      } else {
        return 'url(#normalStateGradient)';
      }
    })
    .attr('stroke', d => {
      if (d === currentState) {
        return '#1e40af';
      } else if (d === startState) {
        return '#047857';
      } else if (finalStates.includes(d)) {
        return '#d97706';
      }
      return '#94a3b8';
    })
    .attr('stroke-width', d => {
      if (d === currentState) {
        return 4;
      } else if (finalStates.includes(d) || d === startState) {
        return 3;
      }
      return 2;
    })
    .style('transition', 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
  
  // Perfect hover effects - no vibration
  nodes
    .on('mouseenter', function(event, d) {
      const circle = d3.select(this).select('circle');
      const text = d3.select(this).select('text');
      
      circle
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', 38)
        .attr('filter', 'url(#smoothGlow)')
        .style('transform', 'scale(1.1)');
      
      text
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('font-size', '18px');
    })
    .on('mouseleave', function(event, d) {
      const circle = d3.select(this).select('circle');
      const text = d3.select(this).select('text');
      
      circle
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', 32)
        .attr('filter', null)
        .style('transform', 'scale(1)');
      
      text
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('font-size', '16px');
    });
  
  // Double circle for final states
  nodes.filter(d => finalStates.includes(d))
    .append('circle')
    .attr('r', 26)
    .attr('fill', 'none')
    .attr('stroke', '#d97706')
    .attr('stroke-width', 2)
    .style('pointer-events', 'none');
  
  // State labels with better typography
  nodes.append('text')
    .attr('class', 'state-label')
    .text(d => d)
    .attr('fill', d => {
      if (d === currentState || d === startState) {
        return 'white';
      }
      return '#1f2937';
    })
    .attr('font-size', '16px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none')
    .style('text-shadow', d => {
      if (d === currentState || d === startState) {
        return '0 1px 3px rgba(0,0,0,0.4)';
      }
      return '0 1px 2px rgba(255,255,255,0.8)';
    });
  
  // Start state indicator
  if (startState) {
    const startPos = statePositions[startState];
    
    // Start arrow
    g.append('path')
      .attr('d', `M ${startPos.x - 70} ${startPos.y} L ${startPos.x - 35} ${startPos.y}`)
      .attr('stroke', '#047857')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#start-arrow)')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
    
    // Start arrow marker
    defs.append('marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#047857');
    
    // Start label
    g.append('text')
      .attr('x', startPos.x - 85)
      .attr('y', startPos.y - 20)
      .text('START')
      .attr('fill', '#047857')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
  }
  
  // Current state pulse animation
  if (currentState) {
    const currentNode = nodes.filter(d => d === currentState);
    currentNode.select('circle')
      .style('animation', 'currentStatePulse 2s ease-in-out infinite');
  }
};

export const renderNFA = (svg, data) => {
  const { states, transitions, startState, finalStates, currentStates } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Better positioning with proper spacing
  const padding = 80;
  const availableWidth = width - (2 * padding);
  const availableHeight = height - (2 * padding);
  const radius = Math.min(availableWidth, availableHeight) * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const statePositions = {};
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Add gradients and filters (similar to DFA but with multi-state support)
  const defs = svg.append('defs');
  
  // Active states gradient
  const activeGradient = defs.append('linearGradient')
    .attr('id', 'activeStateGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  activeGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#3b82f6');
  
  activeGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#1e40af');

  // Smooth glow filter (added for consistency with DFA)
  const glowFilter = defs.append('filter')
    .attr('id', 'smoothGlow')
    .attr('x', '-50%').attr('y', '-50%')
    .attr('width', '200%').attr('height', '200%');
  
  glowFilter.append('feGaussianBlur')
    .attr('stdDeviation', '4')
    .attr('result', 'coloredBlur');
  
  const feMerge = glowFilter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  
  // Group transitions by from-to pair
  const transitionGroups = {};
  transitions.forEach(t => {
    const key = `${t.from}-${t.to}`;
    if (!transitionGroups[key]) {
      transitionGroups[key] = {
        from: t.from,
        to: t.to,
        symbols: []
      };
    }
    transitionGroups[key].symbols.push(t.symbol);
  });
  
  // Draw transitions with better curves
  const links = g.selectAll('.nfa-link')
    .data(Object.values(transitionGroups))
    .enter()
    .append('g')
    .attr('class', 'nfa-link');
  
  links.append('path')
    .attr('d', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return `M ${source.x - 8} ${source.y - 40} 
                A 30 30 0 1 1 ${source.x + 8} ${source.y - 40}`;
      } else {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = 0.2;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        return `M ${source.x} ${source.y} 
                Q ${midX + offsetX} ${midY + offsetY} ${target.x} ${target.y}`;
      }
    })
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#nfa-arrowhead)')
    .style('opacity', 0.8);
  
  // Transition labels
  links.append('text')
    .attr('class', 'nfa-transition-label')
    .attr('x', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.x;
      } else {
        const midX = (source.x + target.x) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetX = -dy * 0.1;
        return midX + offsetX;
      }
    })
    .attr('y', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.y - 55;
      } else {
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetY = dx * 0.1;
        return midY + offsetY - 5;
      }
    })
    .text(d => d.symbols.join(', '))
    .attr('fill', '#1f2937')
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)');
  
  // Define arrowhead
  defs.append('marker')
    .attr('id', 'nfa-arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 35)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b');
  
  // Draw states (similar to DFA but with multi-state highlighting)
  const nodes = g.selectAll('.nfa-node')
    .data(states)
    .enter()
    .append('g')
    .attr('class', 'nfa-node')
    .attr('transform', d => `translate(${statePositions[d].x}, ${statePositions[d].y})`)
    .style('cursor', 'pointer');
  
  nodes.append('circle')
    .attr('r', 32)
    .attr('fill', d => {
      if (currentStates && currentStates.includes(d)) {
        return 'url(#activeStateGradient)';
      } else if (d === startState) {
        return '#10b981';
      } else if (finalStates.includes(d)) {
        return '#f59e0b';
      } else {
        return '#f3f4f6';
      }
    })
    .attr('stroke', d => {
      if (currentStates && currentStates.includes(d)) {
        return '#1e40af';
      } else if (finalStates.includes(d)) {
        return '#d97706';
      }
      return '#94a3b8';
    })
    .attr('stroke-width', d => {
      if (currentStates && currentStates.includes(d)) {
        return 4;
      } else if (finalStates.includes(d)) {
        return 3;
      }
      return 2;
    });
  
  // Double circle for final states
  nodes.filter(d => finalStates.includes(d))
    .append('circle')
    .attr('r', 26)
    .attr('fill', 'none')
    .attr('stroke', d => {
      if (currentStates && currentStates.includes(d)) {
        return '#1e40af';
      }
      return '#d97706';
    })
    .attr('stroke-width', 2)
    .style('pointer-events', 'none');
  
  // State labels with better typography
  nodes.append('text')
    .attr('class', 'nfa-state-label')
    .text(d => d)
    .attr('fill', d => {
      if (currentStates && currentStates.includes(d)) {
        return 'white';
      } else if (d === startState) {
        return 'white';
      } else if (finalStates.includes(d)) {
        return '#1f2937';
      }
      return '#1f2937';
    })
    .attr('font-size', '16px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none')
    .style('text-shadow', d => {
      if (currentStates && currentStates.includes(d)) {
        return '0 1px 3px rgba(0,0,0,0.4)';
      } else if (d === startState) {
        return '0 1px 3px rgba(0,0,0,0.4)';
      }
      return '0 1px 2px rgba(255,255,255,0.8)';
    });
  
  // Perfect hover effects - no vibration
  nodes
    .on('mouseenter', function(event, d) {
      const circle = d3.select(this).select('circle');
      const text = d3.select(this).select('text');
      
      circle
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', 38)
        .attr('filter', 'url(#smoothGlow)')
        .style('transform', 'scale(1.1)');
      
      text
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('font-size', '18px');
    })
    .on('mouseleave', function(event, d) {
      const circle = d3.select(this).select('circle');
      const text = d3.select(this).select('text');
      
      circle
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', 32)
        .attr('filter', null)
        .style('transform', 'scale(1)');
      
      text
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('font-size', '16px');
    });
  
  // Start state indicator
  if (startState) {
    const startPos = statePositions[startState];
    
    // Start arrow
    g.append('path')
      .attr('d', `M ${startPos.x - 70} ${startPos.y} L ${startPos.x - 35} ${startPos.y}`)
      .attr('stroke', '#047857')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#nfa-start-arrow)')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
    
    // Start arrow marker
    defs.append('marker')
      .attr('id', 'nfa-start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#047857');
    
    // Start label
    g.append('text')
      .attr('x', startPos.x - 85)
      .attr('y', startPos.y - 20)
      .text('START')
      .attr('fill', '#047857')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
  }
  
  // Active states pulse animation
  if (currentStates && currentStates.length > 0) {
    const activeNodes = nodes.filter(d => currentStates.includes(d));
    activeNodes.select('circle')
      .style('animation', 'currentStatePulse 2s ease-in-out infinite');
  }
};

export const renderParseTree = (svg, data) => {
  const { tree } = data;
  
  if (!tree) return;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Create tree layout with proper spacing
  const treeLayout = d3.tree().size([width - 120, height - 120]);
  const root = d3.hierarchy(tree);
  treeLayout(root);
  
  // Center the tree
  const bounds = root.descendants().reduce((acc, d) => {
    return {
      minX: Math.min(acc.minX, d.x),
      maxX: Math.max(acc.maxX, d.x),
      minY: Math.min(acc.minY, d.y),
      maxY: Math.max(acc.maxY, d.y)
    };
  }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  
  const offsetX = (width - (bounds.maxX - bounds.minX)) / 2 - bounds.minX;
  const offsetY = 60;
  
  // Draw links
  g.selectAll('.tree-link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'tree-link')
    .attr('d', d3.linkVertical()
      .x(d => d.x + offsetX)
      .y(d => d.y + offsetY))
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .style('opacity', 0.8);
  
  // Draw nodes
  const nodes = g.selectAll('.tree-node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'tree-node')
    .attr('transform', d => `translate(${d.x + offsetX}, ${d.y + offsetY})`);
  
  nodes.append('circle')
    .attr('r', 25)
    .attr('fill', d => d.children ? '#3b82f6' : '#10b981')
    .attr('stroke', '#1f2937')
    .attr('stroke-width', 2);
  
  nodes.append('text')
    .text(d => d.data.value)
    .attr('fill', 'white')
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none');
};

export const renderMealyMachine = (svg, data) => {
  // Similar to DFA but with input/output labels on transitions
  const { states, transitions, startState, currentState, highlightTransition } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Position states in a circle
  const padding = 80;
  const radius = Math.min(width - 2 * padding, height - 2 * padding) * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const statePositions = {};
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw transitions with input/output labels
  const links = g.selectAll('.mealy-link')
    .data(transitions)
    .enter()
    .append('g')
    .attr('class', 'mealy-link');
  
  links.append('path')
    .attr('d', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return `M ${source.x - 8} ${source.y - 40} 
                A 30 30 0 1 1 ${source.x + 8} ${source.y - 40}`;
      } else {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const curvature = 0.2;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        return `M ${source.x} ${source.y} 
                Q ${midX + offsetX} ${midY + offsetY} ${target.x} ${target.y}`;
      }
    })
    .attr('stroke', d => {
      if (highlightTransition && 
          highlightTransition.from === d.from && 
          highlightTransition.input === d.input) {
        return '#ef4444';
      }
      return '#64748b';
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#mealy-arrowhead)');
  
  // Transition labels with input/output
  links.append('text')
    .attr('x', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.x;
      } else {
        const midX = (source.x + target.x) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetX = -dy * 0.1;
        return midX + offsetX;
      }
    })
    .attr('y', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.y - 55;
      } else {
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetY = dx * 0.1;
        return midY + offsetY - 5;
      }
    })
    .text(d => `${d.input}/${d.output}`)
    .attr('fill', '#1f2937')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .style('pointer-events', 'none');
  
  // Add arrowhead marker
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'mealy-arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 35)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b');
  
  // Draw states
  const nodes = g.selectAll('.mealy-node')
    .data(states)
    .enter()
    .append('g')
    .attr('class', 'mealy-node')
    .attr('transform', d => `translate(${statePositions[d].x}, ${statePositions[d].y})`);
  
  nodes.append('circle')
    .attr('r', 32)
    .attr('fill', d => {
      if (d === currentState) {
        return '#3b82f6';
      } else if (d === startState) {
        return '#10b981';
      }
      return '#f3f4f6';
    })
    .attr('stroke', d => {
      if (d === currentState) {
        return '#1e40af';
      } else if (d === startState) {
        return '#047857';
      }
      return '#94a3b8';
    })
    .attr('stroke-width', 2);
  
  nodes.append('text')
    .text(d => d)
    .attr('fill', d => {
      if (d === currentState || d === startState) {
        return 'white';
      }
      return '#1f2937';
    })
    .attr('font-size', '16px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none');
  
  // Start state indicator
  if (startState) {
    const startPos = statePositions[startState];
    g.append('path')
      .attr('d', `M ${startPos.x - 70} ${startPos.y} L ${startPos.x - 35} ${startPos.y}`)
      .attr('stroke', '#047857')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#mealy-start-arrow)');
    
    defs.append('marker')
      .attr('id', 'mealy-start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#047857');
  }
};

export const renderMooreMachine = (svg, data) => {
  // Similar to DFA but with output labels on states
  const { states, transitions, startState, outputFunction, currentState, highlightTransition } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Position states in a circle
  const padding = 80;
  const radius = Math.min(width - 2 * padding, height - 2 * padding) * 0.3;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const statePositions = {};
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw transitions
  const links = g.selectAll('.moore-link')
    .data(transitions)
    .enter()
    .append('g')
    .attr('class', 'moore-link');
  
  links.append('path')
    .attr('d', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return `M ${source.x - 8} ${source.y - 40} 
                A 30 30 0 1 1 ${source.x + 8} ${source.y - 40}`;
      } else {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const curvature = 0.2;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        return `M ${source.x} ${source.y} 
                Q ${midX + offsetX} ${midY + offsetY} ${target.x} ${target.y}`;
      }
    })
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#moore-arrowhead)');
  
  // Transition labels (input only)
  links.append('text')
    .attr('x', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.x;
      } else {
        const midX = (source.x + target.x) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetX = -dy * 0.1;
        return midX + offsetX;
      }
    })
    .attr('y', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.y - 55;
      } else {
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetY = dx * 0.1;
        return midY + offsetY - 5;
      }
    })
    .text(d => d.symbol)
    .attr('fill', '#1f2937')
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .style('pointer-events', 'none');
  
  // Add arrowhead marker
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'moore-arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 35)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b');
  
  // Draw states with output labels
  const nodes = g.selectAll('.moore-node')
    .data(states)
    .enter()
    .append('g')
    .attr('class', 'moore-node')
    .attr('transform', d => `translate(${statePositions[d].x}, ${statePositions[d].y})`);
  
  nodes.append('circle')
    .attr('r', 32)
    .attr('fill', d => {
      if (d === currentState) {
        return '#3b82f6';
      } else if (d === startState) {
        return '#10b981';
      }
      return '#f3f4f6';
    })
    .attr('stroke', d => {
      if (d === currentState) {
        return '#1e40af';
      } else if (d === startState) {
        return '#047857';
      }
      return '#94a3b8';
    })
    .attr('stroke-width', 2);
  
  // State labels
  nodes.append('text')
    .text(d => d)
    .attr('y', -8)
    .attr('fill', d => {
      if (d === currentState || d === startState) {
        return 'white';
      }
      return '#1f2937';
    })
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none');
  
  // Output labels
  nodes.append('text')
    .text(d => outputFunction[d] || '')
    .attr('y', 8)
    .attr('fill', d => {
      if (d === currentState || d === startState) {
        return 'white';
      }
      return '#1f2937';
    })
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none');
};

export const renderPDA = (svg, data) => {
  const { states, transitions, startState, finalStates, currentState, stack, highlightTransition } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Position states
  const padding = 80;
  const radius = Math.min(width - 2 * padding, height - 2 * padding) * 0.25;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const statePositions = {};
  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / states.length - Math.PI / 2;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw stack visualization
  const stackX = width - 120;
  const stackY = 50;
  const stackWidth = 60;
  const stackCellHeight = 30;
  
  // Stack container
  g.append('rect')
    .attr('x', stackX - 5)
    .attr('y', stackY - 5)
    .attr('width', stackWidth + 10)
    .attr('height', Math.max(stack.length * stackCellHeight + 10, 100))
    .attr('fill', 'none')
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('rx', 5);
  
  // Stack label
  g.append('text')
    .attr('x', stackX + stackWidth / 2)
    .attr('y', stackY - 15)
    .text('Stack')
    .attr('fill', '#1f2937')
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle');
  
  // Stack elements
  stack.forEach((symbol, i) => {
    const y = stackY + (stack.length - 1 - i) * stackCellHeight;
    
    g.append('rect')
      .attr('x', stackX)
      .attr('y', y)
      .attr('width', stackWidth)
      .attr('height', stackCellHeight)
      .attr('fill', i === stack.length - 1 ? '#3b82f6' : '#f3f4f6')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1);
    
    g.append('text')
      .attr('x', stackX + stackWidth / 2)
      .attr('y', y + stackCellHeight / 2)
      .text(symbol)
      .attr('fill', i === stack.length - 1 ? 'white' : '#1f2937')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle');
  });
  
  // Draw transitions
  const links = g.selectAll('.pda-link')
    .data(transitions)
    .enter()
    .append('g')
    .attr('class', 'pda-link');
  
  links.append('path')
    .attr('d', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return `M ${source.x - 8} ${source.y - 40} 
                A 30 30 0 1 1 ${source.x + 8} ${source.y - 40}`;
      } else {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const curvature = 0.2;
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const offsetX = -dy * curvature;
        const offsetY = dx * curvature;
        
        return `M ${source.x} ${source.y} 
                Q ${midX + offsetX} ${midY + offsetY} ${target.x} ${target.y}`;
      }
    })
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('marker-end', 'url(#pda-arrowhead)');
  
  // Transition labels
  links.append('text')
    .attr('x', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.x;
      } else {
        const midX = (source.x + target.x) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetX = -dy * 0.1;
        return midX + offsetX;
      }
    })
    .attr('y', d => {
      const source = statePositions[d.from];
      const target = statePositions[d.to];
      
      if (d.from === d.to) {
        return source.y - 55;
      } else {
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const offsetY = dx * 0.1;
        return midY + offsetY - 5;
      }
    })
    .text(d => `${d.input},${d.stackTop}/${d.stackPush}`)
    .attr('fill', '#1f2937')
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .style('pointer-events', 'none');
  
  // Add arrowhead marker
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'pda-arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 35)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b');
  
  // Draw states
  const nodes = g.selectAll('.pda-node')
    .data(states)
    .enter()
    .append('g')
    .attr('class', 'pda-node')
    .attr('transform', d => `translate(${statePositions[d].x}, ${statePositions[d].y})`);
  
  nodes.append('circle')
    .attr('r', 32)
    .attr('fill', d => {
      if (d === currentState) {
        return '#3b82f6';
      } else if (d === startState) {
        return '#10b981';
      } else if (finalStates.includes(d)) {
        return '#f59e0b';
      }
      return '#f3f4f6';
    })
    .attr('stroke', d => {
      if (d === currentState) {
        return '#1e40af';
      } else if (finalStates.includes(d)) {
        return '#d97706';
      }
      return '#94a3b8';
    })
    .attr('stroke-width', 2);
  
  // Double circle for final states
  nodes.filter(d => finalStates.includes(d))
    .append('circle')
    .attr('r', 26)
    .attr('fill', 'none')
    .attr('stroke', '#d97706')
    .attr('stroke-width', 2);
  
  nodes.append('text')
    .text(d => d)
    .attr('fill', d => {
      if (d === currentState || d === startState) {
        return 'white';
      }
      return '#1f2937';
    })
    .attr('font-size', '16px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none');
};

export const renderPumpingLemma = (svg, data) => {
  const { languageType, string, decomposition, pumpingLength, pumpingValue, pumpedString, step, totalSteps } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Title
  g.append('text')
    .attr('x', width / 2)
    .attr('y', 30)
    .text(`${languageType === 'regular' ? 'Regular' : 'Context-Free'} Pumping Lemma`)
    .attr('fill', '#1f2937')
    .attr('font-size', '20px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle');
  
  // Original string visualization
  const stringY = 80;
  const charWidth = 30;
  const startX = (width - string.length * charWidth) / 2;
  
  g.append('text')
    .attr('x', 50)
    .attr('y', stringY - 10)
    .text('Original String:')
    .attr('fill', '#374151')
    .attr('font-size', '14px')
    .attr('font-weight', '600');
  
  // Draw string characters
  string.split('').forEach((char, i) => {
    g.append('rect')
      .attr('x', startX + i * charWidth)
      .attr('y', stringY - 20)
      .attr('width', charWidth - 2)
      .attr('height', 30)
      .attr('fill', '#f3f4f6')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1);
    
    g.append('text')
      .attr('x', startX + i * charWidth + charWidth / 2)
      .attr('y', stringY - 5)
      .text(char)
      .attr('fill', '#1f2937')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle');
  });
  
  // Decomposition visualization
  if (decomposition && Object.keys(decomposition).some(key => decomposition[key])) {
    const decompY = stringY + 60;
    
    g.append('text')
      .attr('x', 50)
      .attr('y', decompY - 10)
      .text('Decomposition:')
      .attr('fill', '#374151')
      .attr('font-size', '14px')
      .attr('font-weight', '600');
    
    let currentX = startX;
    const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    
    if (languageType === 'regular') {
      const parts = [
        { name: 'x', value: decomposition.x || '', color: colors[0] },
        { name: 'y', value: decomposition.y || '', color: colors[1] },
        { name: 'z', value: decomposition.z || '', color: colors[2] }
      ];
      
      parts.forEach((part, partIndex) => {
        if (part.value) {
          part.value.split('').forEach((char, i) => {
            g.append('rect')
              .attr('x', currentX)
              .attr('y', decompY - 20)
              .attr('width', charWidth - 2)
              .attr('height', 30)
              .attr('fill', part.color)
              .attr('fill-opacity', 0.3)
              .attr('stroke', part.color)
              .attr('stroke-width', 2);
            
            g.append('text')
              .attr('x', currentX + charWidth / 2)
              .attr('y', decompY - 5)
              .text(char)
              .attr('fill', '#1f2937')
              .attr('font-size', '16px')
              .attr('font-weight', '700')
              .attr('text-anchor', 'middle');
            
            currentX += charWidth;
          });
          
          // Add label
          g.append('text')
            .attr('x', currentX - (part.value.length * charWidth) / 2)
            .attr('y', decompY + 25)
            .text(part.name)
            .attr('fill', part.color)
            .attr('font-size', '14px')
            .attr('font-weight', '700')
            .attr('text-anchor', 'middle');
        }
      });
    } else {
      // Context-free decomposition
      const parts = [
        { name: 'u', value: decomposition.u || '', color: colors[0] },
        { name: 'v', value: decomposition.v || '', color: colors[1] },
        { name: 'x', value: decomposition.x || '', color: colors[2] },
        { name: 'w', value: decomposition.w || '', color: colors[3] },
        { name: 'y', value: decomposition.y || '', color: colors[4] }
      ];
      
      parts.forEach((part, partIndex) => {
        if (part.value) {
          part.value.split('').forEach((char, i) => {
            g.append('rect')
              .attr('x', currentX)
              .attr('y', decompY - 20)
              .attr('width', charWidth - 2)
              .attr('height', 30)
              .attr('fill', part.color)
              .attr('fill-opacity', 0.3)
              .attr('stroke', part.color)
              .attr('stroke-width', 2);
            
            g.append('text')
              .attr('x', currentX + charWidth / 2)
              .attr('y', decompY - 5)
              .text(char)
              .attr('fill', '#1f2937')
              .attr('font-size', '16px')
              .attr('font-weight', '700')
              .attr('text-anchor', 'middle');
            
            currentX += charWidth;
          });
          
          // Add label
          g.append('text')
            .attr('x', currentX - (part.value.length * charWidth) / 2)
            .attr('y', decompY + 25)
            .text(part.name)
            .attr('fill', part.color)
            .attr('font-size', '14px')
            .attr('font-weight', '700')
            .attr('text-anchor', 'middle');
        }
      });
    }
  }
  
  // Pumped string visualization
  if (pumpedString) {
    const pumpedY = stringY + 160;
    const pumpedStartX = (width - pumpedString.length * charWidth) / 2;
    
    g.append('text')
      .attr('x', 50)
      .attr('y', pumpedY - 10)
      .text(`Pumped String (i=${pumpingValue}):`)
      .attr('fill', '#374151')
      .attr('font-size', '14px')
      .attr('font-weight', '600');
    
    pumpedString.split('').forEach((char, i) => {
      g.append('rect')
        .attr('x', pumpedStartX + i * charWidth)
        .attr('y', pumpedY - 20)
        .attr('width', charWidth - 2)
        .attr('height', 30)
        .attr('fill', '#dcfce7')
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 1);
      
      g.append('text')
        .attr('x', pumpedStartX + i * charWidth + charWidth / 2)
        .attr('y', pumpedY - 5)
        .text(char)
        .attr('fill', '#1f2937')
        .attr('font-size', '16px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'middle');
    });
  }
  
  // Pumping length indicator
  if (pumpingLength && string) {
    const indicatorY = stringY + 40;
    const indicatorWidth = Math.min(pumpingLength, string.length) * charWidth;
    
    g.append('rect')
      .attr('x', startX)
      .attr('y', indicatorY)
      .attr('width', indicatorWidth)
      .attr('height', 4)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.7);
    
    g.append('text')
      .attr('x', startX + indicatorWidth / 2)
      .attr('y', indicatorY + 20)
      .text(`p = ${pumpingLength}`)
      .attr('fill', '#3b82f6')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle');
  }
  
  // Progress indicator
  const progressY = height - 40;
  const progressWidth = 200;
  const progressX = (width - progressWidth) / 2;
  
  g.append('rect')
    .attr('x', progressX)
    .attr('y', progressY)
    .attr('width', progressWidth)
    .attr('height', 8)
    .attr('fill', '#e5e7eb')
    .attr('rx', 4);
  
  g.append('rect')
    .attr('x', progressX)
    .attr('y', progressY)
    .attr('width', (step / Math.max(totalSteps - 1, 1)) * progressWidth)
    .attr('height', 8)
    .attr('fill', '#3b82f6')
    .attr('rx', 4);
  
  g.append('text')
    .attr('x', progressX + progressWidth / 2)
    .attr('y', progressY + 25)
    .text(`Step ${step + 1} of ${totalSteps}`)
    .attr('fill', '#6b7280')
    .attr('font-size', '12px')
    .attr('text-anchor', 'middle');
};

export const renderChomskyHierarchy = (svg, data) => {
  const { selectedType, currentType, allTypes } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Draw nested rectangles representing the hierarchy
  const centerX = width / 2;
  const centerY = height / 2;
  const maxWidth = 350;
  const maxHeight = 300;
  
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const labels = ['Type 0: Unrestricted', 'Type 1: Context-Sensitive', 'Type 2: Context-Free', 'Type 3: Regular'];
  
  // Draw hierarchy levels
  allTypes.reverse().forEach((type, i) => {
    const scale = (i + 1) / allTypes.length;
    const rectWidth = maxWidth * scale;
    const rectHeight = maxHeight * scale;
    
    const isSelected = type.value === selectedType;
    
    g.append('rect')
      .attr('x', centerX - rectWidth / 2)
      .attr('y', centerY - rectHeight / 2)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', colors[i])
      .attr('fill-opacity', isSelected ? 0.8 : 0.3)
      .attr('stroke', colors[i])
      .attr('stroke-width', isSelected ? 4 : 2)
      .attr('rx', 10);
    
    // Add labels
    g.append('text')
      .attr('x', centerX - rectWidth / 2 + 10)
      .attr('y', centerY - rectHeight / 2 + 25)
      .text(labels[i])
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.5)');
    
    // Add machine type
    g.append('text')
      .attr('x', centerX - rectWidth / 2 + 10)
      .attr('y', centerY - rectHeight / 2 + 45)
      .text(type.machine)
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.5)');
  });
  
  // Add title
  g.append('text')
    .attr('x', centerX)
    .attr('y', 40)
    .text('Chomsky Hierarchy')
    .attr('fill', '#1f2937')
    .attr('font-size', '24px')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle');
  
  // Add subset symbols
  const symbolY = height - 60;
  g.append('text')
    .attr('x', centerX)
    .attr('y', symbolY)
    .text('Type 3 ⊆ Type 2 ⊆ Type 1 ⊆ Type 0')
    .attr('fill', '#1f2937')
    .attr('font-size', '16px')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle');
  
  // Highlight selected type
  if (currentType) {
    const typeIndex = allTypes.findIndex(t => t.value === selectedType);
    if (typeIndex !== -1) {
      const scale = (allTypes.length - typeIndex) / allTypes.length;
      const rectWidth = maxWidth * scale;
      const rectHeight = maxHeight * scale;
      
      // Add pulsing effect
      g.append('rect')
        .attr('x', centerX - rectWidth / 2)
        .attr('y', centerY - rectHeight / 2)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '10,5')
        .attr('rx', 10)
        .style('animation', 'dash 2s linear infinite');
    }
  }
};

export const renderTuringMachine = (svg, data) => {
  const { tape, headPosition, currentState } = data;
  
  const width = parseInt(svg.attr('width')) || 800;
  const height = parseInt(svg.attr('height')) || 500;
  
  svg.selectAll('*').remove();
  
  const g = svg.append('g');
  
  // Calculate tape positioning
  const cellWidth = 60;
  const cellHeight = 60;
  const visibleCells = Math.min(tape.length, Math.floor((width - 100) / cellWidth));
  const startX = (width - (visibleCells * cellWidth)) / 2;
  const tapeY = height / 2 - cellHeight / 2;
  
  // Add gradients
  const defs = svg.append('defs');
  
  const cellGradient = defs.append('linearGradient')
    .attr('id', 'tmCellGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  cellGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#f8fafc');
  
  cellGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#e2e8f0');
  
  const activeCellGradient = defs.append('linearGradient')
    .attr('id', 'tmActiveCellGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '100%');
  
  activeCellGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#3b82f6');
  
  activeCellGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#1e40af');
  
  // Draw tape cells
  const cells = g.selectAll('.tm-cell')
    .data(tape.slice(0, visibleCells))
    .enter()
    .append('g')
    .attr('class', 'tm-cell')
    .attr('transform', (d, i) => `translate(${startX + i * cellWidth}, ${tapeY})`);
  
  cells.append('rect')
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .attr('fill', (d, i) => i === headPosition ? 'url(#tmActiveCellGradient)' : 'url(#tmCellGradient)')
    .attr('stroke', (d, i) => i === headPosition ? '#1e40af' : '#94a3b8')
    .attr('stroke-width', (d, i) => i === headPosition ? 3 : 2)
    .attr('rx', 8)
    .attr('ry', 8);
  
  cells.append('text')
    .attr('x', cellWidth / 2)
    .attr('y', cellHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', (d, i) => i === headPosition ? 'white' : '#1f2937')
    .attr('font-size', '20px')
    .attr('font-weight', '700')
    .text(d => d || 'ε')
    .style('text-shadow', (d, i) => i === headPosition ? '0 1px 3px rgba(0,0,0,0.4)' : 'none');

  // Draw head indicator
  if (headPosition >= 0 && headPosition < visibleCells) {
    const headX = startX + headPosition * cellWidth + cellWidth / 2;
    g.append('path')
      .attr('d', `M ${headX} ${tapeY - 20} L ${headX - 10} ${tapeY - 5} L ${headX + 10} ${tapeY - 5} Z`)
      .attr('fill', '#ef4444')
      .attr('stroke', '#b91c1c')
      .attr('stroke-width', 2);
  }

  // Draw current state
  if (currentState) {
    g.append('text')
      .attr('x', width / 2)
      .attr('y', tapeY - 50)
      .text(`Current State: ${currentState}`)
      .attr('fill', '#1f2937')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle');
  }
};