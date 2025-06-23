// Enhanced Time Series Chart with Peak Detection
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface PeakTimeChartProps {
  data: Array<{ [key: string]: any }>;
  xField: string;
  yField: string;
  valueField?: string;
  peakThreshold?: number;
  height?: number;
  annotations?: Array<{ x: string; label: string; color?: string }>;
}

export const PeakTimeChart: React.FC<PeakTimeChartProps> = ({
  data,
  xField,
  yField,
  valueField,
  peakThreshold = 0.15,
  height = 300,
  annotations = []
}) => {
  // Identify peaks in the data
  const maxValue = Math.max(...data.map(item => item[yField]));
  const peaks = data.filter(item => item[yField] > maxValue * (1 - peakThreshold));

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPeak = peaks.some(peak => peak[xField] === label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
          <p className="text-sm text-blue-600">{`${yField}: ${formatValue(payload[0].value)}`}</p>
          {valueField && payload[1] && (
            <p className="text-sm text-green-600">{`${valueField}: ₱${formatValue(payload[1].value)}`}</p>
          )}
          {isPeak && (
            <p className="text-xs text-orange-600 font-medium">📈 Peak Hour</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xField} 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Peak indicators */}
          {peaks.map((peak, index) => (
            <ReferenceLine 
              key={index}
              x={peak[xField]} 
              stroke="#F59E0B" 
              strokeDasharray="2 2"
              label={{ value: "Peak", position: "top", fontSize: 10 }}
            />
          ))}
          
          {/* Annotations */}
          {annotations.map((annotation, index) => (
            <ReferenceLine 
              key={`annotation-${index}`}
              x={annotation.x} 
              stroke={annotation.color || "#10B981"} 
              strokeWidth={2}
              label={{ 
                value: annotation.label, 
                position: "topLeft", 
                fontSize: 10,
                fill: annotation.color || "#10B981"
              }}
            />
          ))}
          
          <Area 
            type="monotone" 
            dataKey={yField} 
            stroke="#3B82F6" 
            fill="url(#peakGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
          />
          
          {valueField && (
            <Line 
              type="monotone" 
              dataKey={valueField} 
              stroke="#10B981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};