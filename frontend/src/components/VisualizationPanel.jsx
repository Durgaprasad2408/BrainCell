import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { useTheme } from '../contexts/ThemeContext'; // <-- 1. Import useTheme

const VisualizationPanel = ({ 
  title, 
  data, 
  renderFunction, 
  className = "",
  onExport 
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const { isDark } = useTheme(); // <-- 2. Get isDark state

  useEffect(() => {
    if (data && renderFunction) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous render
      renderFunction(svg, data);
    }
  }, [data, renderFunction]);

  const handleExport = async (format = 'png') => {
    if (!containerRef.current) return;

    try {
      if (format === 'svg') {
        const svg = svgRef.current;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
        link.click();
        
        URL.revokeObjectURL(url);
      } else {
        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: null,
          scale: 2
        });
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      }
      
      if (onExport) onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    // 3. Apply isDark logic to main panel
    <div className={`rounded-lg shadow-lg border h-full flex flex-col ${className} ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-3 border-b flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        {data && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('png')}
              // 4. Replace custom colors
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              PNG
            </button>
            <button
              onClick={() => handleExport('svg')}
              // 4. Replace custom colors
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              SVG
            </button>
          </div>
        )}
      </div>
      <div ref={containerRef} className="p-4 visualization-container flex-1 flex items-center justify-center">
        <svg
          ref={svgRef}
          width="1200"
          height="720"
          viewBox="0 0 1200 720"
          preserveAspectRatio="xMidYMid meet"
          // 3. Apply isDark logic to SVG background
          className={`border rounded-lg shadow-inner ${
            isDark
              ? 'border-gray-600 bg-gray-900'
              : 'border-gray-200 bg-white'
          }`}
          style={{ maxWidth: '92%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default VisualizationPanel;