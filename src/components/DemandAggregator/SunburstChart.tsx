import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { AlertTriangle } from 'lucide-react';

interface RootCauseData {
  title?: string;
  percent?: number;
  children?: Array<{
    title?: string;
    percent?: number;
  }>;
}

interface SunburstChartProps {
  data: RootCauseData[];
}

interface HierarchyNode extends d3.HierarchyRectangularNode<any> {
  current?: any;
  target?: any;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [currentFocusNode, setCurrentFocusNode] = useState<HierarchyNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rootNode, setRootNode] = useState<HierarchyNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const chartData = data && data.length > 0 ? data : null;

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 600,
          height: rect.height || 500
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateDimensions();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const renderChart = useCallback(() => {
    if (!chartData || chartData.length === 0 || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Responsive sizing
    const containerWidth = dimensions.width || 600;
    const containerHeight = dimensions.height || 500;
    const size = Math.min(containerWidth, containerHeight, 600);
    const width = containerWidth;
    const height = containerHeight;
    const radius = Math.min(width, height) / 6;

    // Transform data for D3 hierarchy
    const hierarchyData = {
      name: 'Root Causes',
      children: chartData.map(item => ({
        name: item.title || 'Unknown',
        value: Math.max(item.percent || 0, 0.1),
        originalData: item,
        children: item.children?.map(child => ({
          name: child.title || 'Unknown',
          value: Math.max(child.percent || 0, 0.1),
          originalData: child,
        })) || []
      }))
    };

    // Enhanced color palette
    const colorScale = d3.scaleOrdinal()
      .domain(hierarchyData.children.map(d => d.name))
      .range([
        '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
        '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
      ]);

    // Compute the layout
    const hierarchy = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const root = d3.partition<any>()
      .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy) as HierarchyNode;

    // Store root node reference
    if (!rootNode) {
      setRootNode(root);
      setCurrentFocusNode(root);
    }

    // Get the current focus node (default to root)
    const focusNode = currentFocusNode || root;

    // Initialize current state for each node
    root.each((d: HierarchyNode) => {
      d.current = d;
    });

    // Recalculate positions relative to focus node for zooming effect
    root.each((d: HierarchyNode) => {
      const x0 = Math.max(0, Math.min(1, (d.x0! - focusNode.x0!) / (focusNode.x1! - focusNode.x0!))) * 2 * Math.PI;
      const x1 = Math.max(0, Math.min(1, (d.x1! - focusNode.x0!) / (focusNode.x1! - focusNode.x0!))) * 2 * Math.PI;
      const y0 = Math.max(0, d.y0! - focusNode.depth!);
      const y1 = Math.max(0, d.y1! - focusNode.depth!);
      
      d.current = { x0, x1, y0, y1 };
    });

    // Arc generator
    const arc = d3.arc<HierarchyNode>()
      .startAngle(d => d.current.x0)
      .endAngle(d => d.current.x1)
      .padAngle(d => Math.min((d.current.x1 - d.current.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.current.y0 * radius)
      .outerRadius(d => Math.max(d.current.y0 * radius, d.current.y1 * radius - 1));

    // Create SVG container with proper viewBox
    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('font-size', '12px')
      .style('max-width', '100%')
      .style('height', 'auto');

    const g = svg.append('g');

    // Filter nodes to show only visible levels
    const visibleNodes = root.descendants().slice(1).filter(d => {
      return arcVisible(d.current) && d.current.y1 <= 3;
    });

    // Create arcs with improved styling
    const path = g.append('g')
      .attr('class', 'arcs')
      .selectAll('path')
      .data(visibleNodes)
      .join('path')
      .attr('fill', (d: HierarchyNode) => {
        // Find the root-level ancestor to maintain consistent coloring
        let node = d;
        while (node.depth! > 1 && node.parent) {
          node = node.parent;
        }
        const baseColor = colorScale(node.data.name) as string;
        // Slightly darken child segments
        return d.depth! > 1 ? d3.color(baseColor)?.darker(0.3)?.toString() || baseColor : baseColor;
      })
      .attr('fill-opacity', (d: HierarchyNode) => d.children ? 0.8 : 0.7)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('d', (d: HierarchyNode) => arc(d))
      .style('cursor', (d: HierarchyNode) => {
        return d.children && d.children.length > 0 ? 'pointer' : 'default';
      })
      .style('transition', 'all 0.2s ease-in-out')
      .on('mouseover', function(event: MouseEvent, d: HierarchyNode) {
        if (isTransitioning) return;
        
        const hasChildren = d.children && d.children.length > 0;
        d3.select(this)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 3)
          .style('filter', 'brightness(1.1)');

        showTooltip(event, d);
      })
      .on('mousemove', function(event: MouseEvent) {
        if (isTransitioning) return;
        updateTooltipPosition(event);
      })
      .on('mouseout', function(event: MouseEvent, d: HierarchyNode) {
        if (isTransitioning) return;
        
        d3.select(this)
          .attr('fill-opacity', d.children ? 0.8 : 0.7)
          .attr('stroke-width', 2)
          .style('filter', 'none');

        hideTooltip();
      })
      .on('click', function(event: MouseEvent, d: HierarchyNode) {
        event.preventDefault();
        event.stopPropagation();
        
        if (d.children && d.children.length > 0) {
          handleSectionClick(d);
        }
      });

    // Add labels with better positioning
    const label = g.append('g')
      .attr('class', 'labels')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(visibleNodes.filter(d => labelVisible(d.current)))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', 1)
      .attr('transform', (d: HierarchyNode) => labelTransform(d.current))
      .style('font-weight', '600')
      .style('font-size', (d: HierarchyNode) => `${Math.max(10, Math.min(14, (d.current.y1 - d.current.y0) * radius / 3))}px`)
      .style('fill', '#ffffff')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      .each(function(d: HierarchyNode) {
        wrapText(d3.select(this), d.data.name, d);
      });

    // Improved center circle with better styling
    const centerRadius = radius * 0.85;
    const centerGroup = g.append('g').attr('class', 'center');
    
    // Add gradient for center circle
    const defs = svg.append('defs');
    const gradient = defs.append('radialGradient')
      .attr('id', 'centerGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:rgba(255,255,255,0.9);stop-opacity:1');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:rgba(240,240,240,0.9);stop-opacity:1');

    const centerCircle = centerGroup.append('circle')
      .attr('r', centerRadius)
      .attr('fill', 'url(#centerGradient)')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 3)
      .attr('pointer-events', 'all')
      .style('cursor', currentFocusNode && currentFocusNode !== rootNode ? 'pointer' : 'default')
      .style('transition', 'all 0.2s ease-in-out')
      .on('mouseover', function() {
        if (currentFocusNode && currentFocusNode !== rootNode) {
          d3.select(this)
            .attr('stroke', '#9ca3af')
            .attr('stroke-width', 4)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))');
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#d1d5db')
          .attr('stroke-width', 3)
          .style('filter', 'none');
      })
      .on('click', function(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        handleCenterClick();
      });

    // Center text with better styling
    const centerText = centerGroup.append('text')
      .attr('class', 'center-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text(currentFocusNode?.data.name || 'Root Causes');

    // Add instruction text
    const instructionText = centerGroup.append('text')
      .attr('class', 'instruction-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '11px')
      .style('font-weight', '400')
      .style('fill', '#6b7280')
      .style('pointer-events', 'none')
      .text(currentFocusNode && currentFocusNode !== rootNode ? 'Click to go back' : 'Click segments to drill down');

    // Event handlers
    function handleSectionClick(clickedNode: HierarchyNode) {
      if (isTransitioning || clickedNode === currentFocusNode) return;
      
      if (!clickedNode.children || clickedNode.children.length === 0) {
        return;
      }
      
      zoomToNode(clickedNode);
    }

    function handleCenterClick() {
      if (isTransitioning || !currentFocusNode) return;
      
      if (currentFocusNode.parent) {
        zoomToNode(currentFocusNode.parent);
      } else if (currentFocusNode !== rootNode && rootNode) {
        zoomToNode(rootNode);
      }
    }

    function zoomToNode(targetNode: HierarchyNode) {
      if (isTransitioning || targetNode === currentFocusNode) return;

      setIsTransitioning(true);
      setCurrentFocusNode(targetNode);

      // Calculate new positions relative to target node
      root.each((d: HierarchyNode) => {
        const x0 = Math.max(0, Math.min(1, (d.x0! - targetNode.x0!) / (targetNode.x1! - targetNode.x0!))) * 2 * Math.PI;
        const x1 = Math.max(0, Math.min(1, (d.x1! - targetNode.x0!) / (targetNode.x1! - targetNode.x0!))) * 2 * Math.PI;
        const y0 = Math.max(0, d.y0! - targetNode.depth!);
        const y1 = Math.max(0, d.y1! - targetNode.depth!);
        
        d.target = { x0, x1, y0, y1 };
      });

      // Update center text immediately
      centerText.text(targetNode.data.name);
      instructionText.text(targetNode !== rootNode ? 'Click to go back' : 'Click segments to drill down');
      centerCircle.style('cursor', targetNode !== rootNode ? 'pointer' : 'default');

      // Transition with improved easing
      const transition = svg.transition()
        .duration(600)
        .ease(d3.easeCubicInOut)
        .on('end', () => {
          setIsTransitioning(false);
          setTimeout(renderChart, 50);
        });

      // Transition arcs
      path.transition(transition)
        .tween('data', (d: HierarchyNode) => {
          const i = d3.interpolate(d.current, d.target);
          return (t: number) => d.current = i(t);
        })
        .attr('fill-opacity', (d: HierarchyNode) => {
          return arcVisible(d.target) && d.target.y1 <= 3 ? (d.children ? 0.8 : 0.7) : 0;
        })
        .attrTween('d', (d: HierarchyNode) => () => arc(d.current));

      // Transition labels
      label.transition(transition)
        .attr('fill-opacity', (d: HierarchyNode) => {
          return labelVisible(d.target) && d.target.y1 <= 3 ? 1 : 0;
        })
        .attrTween('transform', (d: HierarchyNode) => () => labelTransform(d.current));
    }

    // Utility functions
    function arcVisible(d: any): boolean {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d: any): boolean {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d: any): string {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    function wrapText(text: d3.Selection<SVGTextElement, any, any, any>, name: string, d: HierarchyNode) {
      const maxLength = Math.max(8, Math.min(20, (d.current.y1 - d.current.y0) * radius / 2));
      
      if (name.length <= maxLength) {
        text.text(name);
        return;
      }

      const words = name.split(/\s+/);
      text.text('');
      
      let line = '';
      let lineNumber = 0;
      const maxLines = 2;
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        if (testLine.length > maxLength && line) {
          if (lineNumber < maxLines - 1) {
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', lineNumber === 0 ? 0 : '1.1em')
              .text(line);
            line = word;
            lineNumber++;
          } else {
            // Truncate with ellipsis
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', lineNumber === 0 ? 0 : '1.1em')
              .text(line.length > maxLength - 3 ? line.substring(0, maxLength - 3) + '...' : line);
            break;
          }
        } else {
          line = testLine;
        }
      }
      
      if (line && lineNumber < maxLines) {
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', lineNumber === 0 ? 0 : '1.1em')
          .text(line.length > maxLength ? line.substring(0, maxLength - 3) + '...' : line);
      }
    }

    function showTooltip(event: MouseEvent, d: HierarchyNode) {
      if (!tooltipRef.current) return;

      const tooltip = d3.select(tooltipRef.current);
      
      tooltip
        .style('opacity', 1)
        .html(`
          <div class="tooltip-content">
            <div class="tooltip-title">${d.data.name}</div>
            <div class="tooltip-value">
              Failure Rate: <span class="highlight">${d.data.value?.toFixed(1)}%</span>
            </div>
            ${d.children && d.children.length > 0 ? 
              `<div class="tooltip-info">Click to explore ${d.children.length} sub-categories</div>` : 
              '<div class="tooltip-info">Leaf category</div>'
            }
          </div>
        `);

      updateTooltipPosition(event);
    }

    function updateTooltipPosition(event: MouseEvent) {
      if (!tooltipRef.current) return;

      const tooltip = d3.select(tooltipRef.current);
      const rect = tooltipRef.current.getBoundingClientRect();
      
      let left = event.pageX + 15;
      let top = event.pageY - 10;

      // Boundary checks
      if (left + rect.width > window.innerWidth - 20) {
        left = event.pageX - rect.width - 15;
      }
      if (top + rect.height > window.innerHeight - 20) {
        top = event.pageY - rect.height - 10;
      }
      if (left < 20) {
        left = 20;
      }
      if (top < 20) {
        top = event.pageY + 15;
      }

      tooltip
        .style('left', left + 'px')
        .style('top', top + 'px');
    }

    function hideTooltip() {
      if (!tooltipRef.current) return;
      d3.select(tooltipRef.current).style('opacity', 0);
    }

  }, [chartData, currentFocusNode, rootNode, isTransitioning, dimensions]);

  // Initial render and resize handling
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      renderChart();
    }
    
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).style('opacity', 0);
      }
    };
  }, [renderChart, dimensions]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-white rounded-lg border border-gray-200">
        <div className="text-center p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500 max-w-sm">
            No root cause data is available for visualization at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white rounded-lg overflow-hidden">
      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center p-4"
        style={{ minHeight: '500px' }}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full max-w-full max-h-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Enhanced Tooltip */}
      <div
        ref={tooltipRef}
        className="tooltip-container"
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 1000,
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '0px',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '280px',
          minWidth: '200px'
        }}
      />
      
      {/* Tooltip Styles */}
      <style >{`
        .tooltip-container .tooltip-content {
          padding: 16px;
        }
        
        .tooltip-container .tooltip-title {
          font-weight: 700;
          font-size: 16px;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        
        .tooltip-container .tooltip-value {
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .tooltip-container .highlight {
          color: #EF4444;
          font-weight: 700;
          font-size: 15px;
        }
        
        .tooltip-container .tooltip-info {
          color: #6B7280;
          font-size: 12px;
          font-style: italic;
          border-top: 1px solid #F3F4F6;
          padding-top: 8px;
          margin-top: 8px;
        }
      `}</style>
      
      {/* Loading overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600"></div>
            <span className="text-gray-600 font-medium">Updating view...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunburstChart;