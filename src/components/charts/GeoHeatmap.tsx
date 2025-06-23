// Geographic Heatmap for Location-based Transaction Analysis
import React from 'react';
import { ResponsiveContainer, Treemap, Cell, Tooltip } from 'recharts';

interface GeoHeatmapProps {
  data: Array<{ [key: string]: any }>;
  locationField: string;
  valueField: string;
  metricField?: string;
  height?: number;
  colorScheme?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

interface HeatmapData {
  name: string;
  value: number;
  metric?: number;
  intensity: number;
  region: string;
  coordinates?: { lat: number; lng: number };
}

export const GeoHeatmap: React.FC<GeoHeatmapProps> = ({
  data,
  locationField,
  valueField,
  metricField,
  height = 400,
  colorScheme = 'blue'
}) => {
  // Process and aggregate data by location
  const processedData = React.useMemo(() => {
    const locationMap = new Map<string, { value: number; metric?: number; count: number }>();

    data.forEach(item => {
      const location = item[locationField];
      const value = Number(item[valueField]) || 0;
      const metric = metricField ? Number(item[metricField]) || 0 : undefined;

      if (locationMap.has(location)) {
        const existing = locationMap.get(location)!;
        existing.value += value;
        existing.count += 1;
        if (metric !== undefined && existing.metric !== undefined) {
          existing.metric += metric;
        }
      } else {
        locationMap.set(location, { 
          value, 
          metric, 
          count: 1 
        });
      }
    });

    // Convert to array and calculate intensity
    const result: HeatmapData[] = Array.from(locationMap.entries()).map(([name, data]) => {
      return {
        name,
        value: data.value,
        metric: data.metric,
        intensity: data.value,
        region: getRegionFromLocation(name),
        coordinates: getCoordinatesFromLocation(name)
      };
    });

    // Normalize intensity values
    const maxValue = Math.max(...result.map(item => item.value));
    const minValue = Math.min(...result.map(item => item.value));

    return result.map(item => ({
      ...item,
      intensity: maxValue > minValue ? (item.value - minValue) / (maxValue - minValue) : 0.5
    }));
  }, [data, locationField, valueField, metricField]);

  // Color schemes
  const colorSchemes = {
    blue: ['#EBF8FF', '#BEE3F8', '#90CDF4', '#63B3ED', '#4299E1', '#3182CE', '#2B77CB', '#2C5282'],
    green: ['#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749'],
    orange: ['#FFFAF0', '#FEEBC8', '#FBD38D', '#F6AD55', '#ED8936', '#DD6B20', '#C05621', '#9C4221'],
    red: ['#FFF5F5', '#FED7D7', '#FEB2B2', '#FC8181', '#F56565', '#E53E3E', '#C53030', '#9B2C2C'],
    purple: ['#FAF5FF', '#E9D8FD', '#D6BCFA', '#B794F6', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A']
  };

  const getColorByIntensity = (intensity: number): string => {
    const colors = colorSchemes[colorScheme];
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-blue-600">{`${valueField}: ${formatValue(data.value)}`}</p>
          {data.metric && (
            <p className="text-sm text-green-600">{`${metricField}: ${data.metric.toLocaleString()}`}</p>
          )}
          <p className="text-sm text-gray-500">{`Region: ${data.region}`}</p>
          <p className="text-xs text-gray-400">{`Intensity: ${(data.intensity * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Create treemap data with proper nesting
  const treemapData = {
    name: 'Philippines',
    children: processedData.map(item => ({
      name: item.name,
      value: item.value,
      intensity: item.intensity,
      metric: item.metric,
      region: item.region
    }))
  };

  return (
    <div className="space-y-4">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData.children}
            dataKey="value"
            aspectRatio={4/3}
            stroke="#ffffff"
            strokeWidth={2}
          >
            <Tooltip content={<CustomTooltip />} />
            {treemapData.children.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColorByIntensity(entry.intensity)}
              />
            ))}
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend and Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Color Legend */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Intensity:</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Low</span>
            {colorSchemes[colorScheme].map((color, index) => (
              <div 
                key={index}
                className="w-4 h-4 border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>

        {/* Top Locations Summary */}
        <div className="flex flex-wrap gap-2">
          {processedData
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map((item, index) => (
              <div 
                key={item.name}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorByIntensity(item.intensity) }}
                />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-gray-600">{formatValue(item.value)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from(new Set(processedData.map(item => item.region))).map(region => {
          const regionData = processedData.filter(item => item.region === region);
          const regionTotal = regionData.reduce((sum, item) => sum + item.value, 0);
          const regionCount = regionData.length;

          return (
            <div key={region} className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-900 mb-2">{region}</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{formatValue(regionTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locations:</span>
                  <span className="font-medium">{regionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-medium">{formatValue(regionTotal / regionCount)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions for location data
function getRegionFromLocation(location: string): string {
  const regionMapping: Record<string, string> = {
    'manila': 'NCR',
    'quezon city': 'NCR',
    'makati': 'NCR',
    'pasig': 'NCR',
    'taguig': 'NCR',
    'cebu': 'Central Visayas',
    'davao': 'Davao Region',
    'iloilo': 'Western Visayas',
    'cagayan de oro': 'Northern Mindanao',
    'bacolod': 'Western Visayas',
    'baguio': 'Cordillera',
    'angeles': 'Central Luzon',
    'san fernando': 'Central Luzon'
  };

  const normalized = location.toLowerCase();
  return regionMapping[normalized] || 'Other Regions';
}

function getCoordinatesFromLocation(location: string): { lat: number; lng: number } | undefined {
  const coordinatesMapping: Record<string, { lat: number; lng: number }> = {
    'manila': { lat: 14.5995, lng: 120.9842 },
    'quezon city': { lat: 14.6760, lng: 121.0437 },
    'makati': { lat: 14.5547, lng: 121.0244 },
    'cebu': { lat: 10.3157, lng: 123.8854 },
    'davao': { lat: 7.1907, lng: 125.4553 }
  };

  return coordinatesMapping[location.toLowerCase()];
}