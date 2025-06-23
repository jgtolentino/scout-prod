// Pareto Chart Component for Product Performance Analysis
import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ParetoData {
  name: string;
  value: number;
  cumulative: number;
  percentage: number;
  cumulativePercentage: number;
}

interface ParetoChartProps {
  data: Array<{ [key: string]: any }>;
  nameField: string;
  valueField: string;
  height?: number;
  title?: string;
  showRule80?: boolean;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({
  data,
  nameField,
  valueField,
  height = 400,
  title = "Pareto Analysis",
  showRule80 = true
}) => {
  // Process data for Pareto analysis
  const processedData = React.useMemo(() => {
    // Sort data by value in descending order
    const sortedData = [...data]
      .sort((a, b) => (b[valueField] || 0) - (a[valueField] || 0));

    // Calculate total value
    const totalValue = sortedData.reduce((sum, item) => sum + (item[valueField] || 0), 0);

    // Create Pareto data with cumulative percentages
    let cumulativeValue = 0;
    return sortedData.map((item, index) => {
      const value = item[valueField] || 0;
      cumulativeValue += value;
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      const cumulativePercentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;

      return {
        name: item[nameField] || `Item ${index + 1}`,
        value,
        cumulative: cumulativeValue,
        percentage,
        cumulativePercentage,
        rank: index + 1
      };
    });
  }, [data, nameField, valueField]);

  // Find 80% line position
  const eightyPercentIndex = processedData.findIndex(item => item.cumulativePercentage >= 80);
  const rule80Items = eightyPercentIndex >= 0 ? eightyPercentIndex + 1 : processedData.length;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Value: {formatValue(data.value)} ({formatPercent(data.percentage)})
          </p>
          <p className="text-sm text-green-600">
            Cumulative: {formatPercent(data.cumulativePercentage)}
          </p>
          <p className="text-xs text-gray-500">Rank: #{data.rank}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showRule80 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">{rule80Items}</span> items represent 
            <span className="font-medium text-green-600"> 80%</span> of total value
          </div>
        )}
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatValue}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#6b7280"
              fontSize={12}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* 80% Rule Reference Line */}
            {showRule80 && (
              <ReferenceLine 
                yAxisId="right"
                y={80} 
                stroke="#F59E0B" 
                strokeDasharray="5 5"
                label={{ value: "80% Rule", position: "topLeft", fontSize: 12 }}
              />
            )}
            
            {/* Value Bars */}
            <Bar 
              yAxisId="left"
              dataKey="value"
              fill="#3B82F6"
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
              name="Value"
            />
            
            {/* Cumulative Percentage Line */}
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercentage"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              name="Cumulative %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Top Performers</div>
          <div className="text-lg font-bold text-blue-900">
            {rule80Items} / {processedData.length}
          </div>
          <div className="text-xs text-blue-600">
            Items contributing 80% of value
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Concentration</div>
          <div className="text-lg font-bold text-green-900">
            {processedData.length > 0 ? ((rule80Items / processedData.length) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-green-600">
            Share of products driving majority value
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Top Item Share</div>
          <div className="text-lg font-bold text-purple-900">
            {processedData.length > 0 ? processedData[0].percentage.toFixed(1) : 0}%
          </div>
          <div className="text-xs text-purple-600">
            Value contribution of #1 performer
          </div>
        </div>
      </div>

      {/* Top Items List */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Top Contributors (80% Rule)</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {processedData.slice(0, rule80Items).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>{formatValue(item.value)}</span>
                <span className="text-green-600">{formatPercent(item.cumulativePercentage)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};