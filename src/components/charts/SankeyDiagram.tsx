// Sankey Diagram Component for Product Substitution Flow Analysis
import React from 'react';

interface SankeyNode {
  id: string;
  name: string;
  category: 'source' | 'target' | 'intermediate';
  color?: string;
  value?: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  className?: string;
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width = 800,
  height = 400,
  className = ""
}) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Calculate positions and dimensions for nodes and links
  const processedData = React.useMemo(() => {
    const nodeMap = new Map<string, SankeyNode & { x: number; y: number; height: number; totalValue: number }>();
    
    // Calculate total values for each node
    nodes.forEach(node => {
      const incomingValue = links.filter(link => link.target === node.id).reduce((sum, link) => sum + link.value, 0);
      const outgoingValue = links.filter(link => link.source === node.id).reduce((sum, link) => sum + link.value, 0);
      const totalValue = Math.max(incomingValue, outgoingValue, node.value || 0);
      
      nodeMap.set(node.id, {
        ...node,
        x: 0,
        y: 0,
        height: 0,
        totalValue
      });
    });

    // Simple layout: sources on left, targets on right, intermediates in middle
    const margin = 50;
    const nodeWidth = 20;
    const availableWidth = width - 2 * margin - nodeWidth;
    const availableHeight = height - 2 * margin;

    const sourceNodes = Array.from(nodeMap.values()).filter(n => n.category === 'source');
    const targetNodes = Array.from(nodeMap.values()).filter(n => n.category === 'target');
    const intermediateNodes = Array.from(nodeMap.values()).filter(n => n.category === 'intermediate');

    // Position source nodes
    sourceNodes.forEach((node, index) => {
      node.x = margin;
      node.y = margin + (index * (availableHeight / Math.max(sourceNodes.length - 1, 1)));
      node.height = Math.max(20, (node.totalValue / Math.max(...Array.from(nodeMap.values()).map(n => n.totalValue))) * 100);
    });

    // Position target nodes
    targetNodes.forEach((node, index) => {
      node.x = width - margin - nodeWidth;
      node.y = margin + (index * (availableHeight / Math.max(targetNodes.length - 1, 1)));
      node.height = Math.max(20, (node.totalValue / Math.max(...Array.from(nodeMap.values()).map(n => n.totalValue))) * 100);
    });

    // Position intermediate nodes (if any)
    intermediateNodes.forEach((node, index) => {
      node.x = margin + availableWidth / 2;
      node.y = margin + (index * (availableHeight / Math.max(intermediateNodes.length - 1, 1)));
      node.height = Math.max(20, (node.totalValue / Math.max(...Array.from(nodeMap.values()).map(n => n.totalValue))) * 100);
    });

    return { nodeMap, processedLinks: links };
  }, [nodes, links, width, height]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const generatePath = (source: SankeyNode & { x: number; y: number; height: number }, 
                       target: SankeyNode & { x: number; y: number; height: number },
                       linkValue: number) => {
    const maxValue = Math.max(...Array.from(processedData.nodeMap.values()).map(n => n.totalValue));
    const linkHeight = Math.max(5, (linkValue / maxValue) * 30);
    
    const sourceX = source.x + 20;
    const sourceY = source.y + source.height / 2;
    const targetX = target.x;
    const targetY = target.y + target.height / 2;
    
    const midX = (sourceX + targetX) / 2;
    
    return `M ${sourceX} ${sourceY - linkHeight/2} 
            C ${midX} ${sourceY - linkHeight/2}, ${midX} ${targetY - linkHeight/2}, ${targetX} ${targetY - linkHeight/2}
            L ${targetX} ${targetY + linkHeight/2}
            C ${midX} ${targetY + linkHeight/2}, ${midX} ${sourceY + linkHeight/2}, ${sourceX} ${sourceY + linkHeight/2}
            Z`;
  };

  const getNodeColor = (node: SankeyNode) => {
    if (node.color) return node.color;
    switch (node.category) {
      case 'source': return '#3B82F6';
      case 'target': return '#10B981';
      case 'intermediate': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getLinkColor = (link: SankeyLink) => {
    if (link.color) return link.color;
    return '#94A3B8';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Substitution Flow</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Original Products</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Substitute Products</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <svg 
          ref={svgRef}
          width={width} 
          height={height}
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Links */}
          {processedData.processedLinks.map((link, index) => {
            const sourceNode = processedData.nodeMap.get(link.source);
            const targetNode = processedData.nodeMap.get(link.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <g key={`link-${index}`}>
                <path
                  d={generatePath(sourceNode, targetNode, link.value)}
                  fill={getLinkColor(link)}
                  fillOpacity={0.6}
                  stroke="none"
                  className="hover:fill-opacity-80 transition-all cursor-pointer"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {Array.from(processedData.nodeMap.values()).map((node, index) => (
            <g key={`node-${index}`} className="cursor-pointer">
              <rect
                x={node.x}
                y={node.y}
                width={20}
                height={node.height}
                fill={getNodeColor(node)}
                rx={2}
                className="hover:opacity-80 transition-opacity"
              />
              <text
                x={node.category === 'target' ? node.x - 5 : node.x + 25}
                y={node.y + node.height / 2}
                textAnchor={node.category === 'target' ? 'end' : 'start'}
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {node.name}
              </text>
              <text
                x={node.category === 'target' ? node.x - 5 : node.x + 25}
                y={node.y + node.height / 2 + 12}
                textAnchor={node.category === 'target' ? 'end' : 'start'}
                dominantBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {formatValue(node.totalValue)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Flow</div>
          <div className="text-lg font-bold text-blue-900">
            {formatValue(links.reduce((sum, link) => sum + link.value, 0))}
          </div>
          <div className="text-xs text-blue-600">
            Total substitution volume
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Top Substitute</div>
          <div className="text-lg font-bold text-green-900">
            {nodes.filter(n => n.category === 'target')
              .sort((a, b) => (b.value || 0) - (a.value || 0))[0]?.name || 'N/A'}
          </div>
          <div className="text-xs text-green-600">
            Most popular substitute product
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">Substitution Rate</div>
          <div className="text-lg font-bold text-orange-900">
            {links.length > 0 ? ((links.length / nodes.filter(n => n.category === 'source').length) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-orange-600">
            Average substitution frequency
          </div>
        </div>
      </div>

      {/* Flow Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Substitution Details</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {links
            .sort((a, b) => b.value - a.value)
            .map((link, index) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">{sourceNode?.name}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-700">{targetNode?.name}</span>
                  </div>
                  <span className="text-blue-600 font-medium">{formatValue(link.value)}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};