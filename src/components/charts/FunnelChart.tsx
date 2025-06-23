// Customer Journey Funnel Chart Component
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  color?: string;
  description?: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  title?: string;
  showPercentages?: boolean;
  className?: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 400,
  title = "Customer Journey Funnel",
  showPercentages = true,
  className = ""
}) => {
  // Process data to calculate funnel metrics
  const processedData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(item => item.value));
    
    return data.map((item, index) => ({
      ...item,
      conversionRate: index > 0 ? ((item.value / data[index - 1].value) * 100) : 100,
      dropoffRate: index > 0 ? (((data[index - 1].value - item.value) / data[index - 1].value) * 100) : 0,
      relativeWidth: (item.value / maxValue) * 100,
      index
    }));
  }, [data]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getStageColor = (stage: FunnelStage, index: number) => {
    if (stage.color) return stage.color;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.stage}</p>
          <p className="text-sm text-blue-600">
            Count: {formatValue(data.value)} ({data.percentage.toFixed(1)}%)
          </p>
          {data.index > 0 && (
            <>
              <p className="text-sm text-green-600">
                Conversion: {data.conversionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-red-600">
                Drop-off: {data.dropoffRate.toFixed(1)}%
              </p>
            </>
          )}
          {data.description && (
            <p className="text-xs text-gray-500 mt-1">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-600">
          Overall Conversion: {processedData.length > 0 ? 
            ((processedData[processedData.length - 1].value / processedData[0].value) * 100).toFixed(1) : 0}%
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4">
        {processedData.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div className="flex items-center space-x-4">
              {/* Stage Label */}
              <div className="w-24 text-sm font-medium text-gray-700 text-right">
                {stage.stage}
              </div>
              
              {/* Funnel Bar */}
              <div className="flex-1 relative">
                <div 
                  className="h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-300 hover:opacity-80"
                  style={{ 
                    backgroundColor: getStageColor(stage, index),
                    width: `${stage.relativeWidth}%`,
                    minWidth: '200px'
                  }}
                >
                  <span className="text-white font-medium text-sm">
                    {formatValue(stage.value)}
                  </span>
                  {showPercentages && (
                    <span className="text-white text-sm">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                
                {/* Conversion Rate */}
                {index > 0 && (
                  <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                    <div className={`text-xs px-2 py-1 rounded ${
                      stage.conversionRate >= 70 ? 'bg-green-100 text-green-800' :
                      stage.conversionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stage.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Drop-off Indicator */}
            {index < processedData.length - 1 && (
              <div className="flex items-center justify-center py-2">
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  -{stage.dropoffRate.toFixed(1)}% drop-off
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alternative Bar Chart View */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Alternative View</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={processedData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number"
              tickFormatter={formatValue}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="category"
              dataKey="stage"
              stroke="#6b7280"
              fontSize={12}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStageColor(entry, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Top of Funnel</div>
          <div className="text-lg font-bold text-blue-900">
            {processedData.length > 0 ? formatValue(processedData[0].value) : '0'}
          </div>
          <div className="text-xs text-blue-600">
            Total awareness/visits
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Bottom of Funnel</div>
          <div className="text-lg font-bold text-green-900">
            {processedData.length > 0 ? formatValue(processedData[processedData.length - 1].value) : '0'}
          </div>
          <div className="text-xs text-green-600">
            Final conversions
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Biggest Drop-off</div>
          <div className="text-lg font-bold text-purple-900">
            {processedData.length > 1 ? 
              processedData.reduce((max, stage) => stage.dropoffRate > max.dropoffRate ? stage : max).stage :
              'N/A'
            }
          </div>
          <div className="text-xs text-purple-600">
            Needs attention
          </div>
        </div>
      </div>

      {/* Stage Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Stage Performance Details</h4>
        <div className="space-y-2">
          {processedData.map((stage, index) => (
            <div key={stage.stage} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getStageColor(stage, index) }}
                />
                <span className="font-medium text-gray-900">{stage.stage}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>{formatValue(stage.value)}</span>
                <span>{stage.percentage.toFixed(1)}%</span>
                {index > 0 && (
                  <span className={
                    stage.conversionRate >= 70 ? 'text-green-600' :
                    stage.conversionRate >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {stage.conversionRate.toFixed(1)}% conv.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};