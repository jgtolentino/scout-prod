// Violin Plot for Value Distribution Analysis
import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, Line } from 'recharts';

interface ViolinPlotProps {
  data: Array<{ [key: string]: any }>;
  xField: string;
  valueField: string;
  groupField?: string;
  height?: number;
  showMedian?: boolean;
  showQuartiles?: boolean;
}

export const ViolinPlot: React.FC<ViolinPlotProps> = ({
  data,
  xField,
  valueField,
  groupField,
  height = 300,
  showMedian = true,
  showQuartiles = true
}) => {
  // Calculate distribution statistics for each group
  const processedData = React.useMemo(() => {
    const groups = groupField 
      ? [...new Set(data.map(item => item[groupField]))]
      : ['all'];

    return groups.map(group => {
      const groupData = groupField 
        ? data.filter(item => item[groupField] === group)
        : data;

      const values = groupData.map(item => item[valueField]).sort((a, b) => a - b);
      const n = values.length;

      if (n === 0) return { group, values: [], stats: null };

      // Calculate statistics
      const q1 = values[Math.floor(n * 0.25)];
      const median = values[Math.floor(n * 0.5)];
      const q3 = values[Math.floor(n * 0.75)];
      const min = values[0];
      const max = values[n - 1];
      const mean = values.reduce((sum, val) => sum + val, 0) / n;

      // Calculate kernel density estimation (simplified)
      const bandwidth = (max - min) / 20;
      const density = [];
      
      for (let i = 0; i <= 20; i++) {
        const x = min + (i / 20) * (max - min);
        let kde = 0;
        
        values.forEach(value => {
          const u = (x - value) / bandwidth;
          kde += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
        });
        
        kde = kde / (n * bandwidth);
        density.push({ x, density: kde, group });
      }

      return {
        group,
        values,
        stats: { q1, median, q3, min, max, mean },
        density,
        maxDensity: Math.max(...density.map(d => d.density))
      };
    });
  }, [data, xField, valueField, groupField]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Group: ${label}`}</p>
          <p className="text-sm text-blue-600">{`Density: ${payload[0]?.value?.toFixed(4)}`}</p>
          <p className="text-sm text-green-600">{`Value: ${formatValue(payload[0]?.payload?.x || 0)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Create chart data by combining all density curves
  const chartData = React.useMemo(() => {
    const allPoints = new Set<number>();
    processedData.forEach(group => {
      group.density?.forEach(point => allPoints.add(point.x));
    });

    return Array.from(allPoints).sort((a, b) => a - b).map(x => {
      const point: any = { x };
      processedData.forEach(group => {
        const densityPoint = group.density?.find(d => d.x === x);
        point[`density_${group.group}`] = densityPoint?.density || 0;
        if (showMedian && group.stats) {
          point[`median_${group.group}`] = group.stats.median;
        }
      });
      return point;
    });
  }, [processedData, showMedian]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="x"
            tickFormatter={formatValue}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            label={{ value: 'Density', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {processedData.map((group, index) => (
            <Area
              key={`density_${group.group}`}
              type="monotone"
              dataKey={`density_${group.group}`}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={`${group.group} Distribution`}
            />
          ))}

          {showMedian && processedData.map((group, index) => (
            <Line
              key={`median_${group.group}`}
              type="monotone"
              dataKey={`median_${group.group}`}
              stroke={colors[index % colors.length]}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name={`${group.group} Median`}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Statistics Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedData.map((group, index) => (
          group.stats && (
            <div key={group.group} className="bg-gray-50 p-3 rounded-lg">
              <div 
                className="flex items-center space-x-2 mb-2"
                style={{ color: colors[index % colors.length] }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="font-medium text-sm">{group.group}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Median:</span>
                  <span className="font-medium">{formatValue(group.stats.median)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean:</span>
                  <span className="font-medium">{formatValue(group.stats.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-medium">{formatValue(group.stats.min)} - {formatValue(group.stats.max)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Q1-Q3:</span>
                  <span className="font-medium">{formatValue(group.stats.q1)} - {formatValue(group.stats.q3)}</span>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};