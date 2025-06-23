// ContextDisplay - Shows current filter context for AI assistant
import React from 'react';
import { Badge } from './ui/badge';
import { Filter, Database, Globe, Building, Calendar } from 'lucide-react';

interface ContextDisplayProps {
  filters?: Record<string, any>;
  serviceStatus?: {
    currentDataSource: string;
    platform: string;
    azureConnected: boolean;
    dataLakeConnected: boolean;
  };
}

export const ContextDisplay: React.FC<ContextDisplayProps> = ({ 
  filters = {}, 
  serviceStatus 
}) => {
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== null && value !== '' && value !== undefined)
    .map(([key, value]) => ({ key, value }));

  const getFilterIcon = (key: string) => {
    if (key.includes('region') || key.includes('city') || key.includes('geographic')) {
      return Globe;
    }
    if (key.includes('company') || key.includes('brand') || key.includes('category')) {
      return Building;
    }
    if (key.includes('date') || key.includes('time') || key.includes('period')) {
      return Calendar;
    }
    return Filter;
  };

  const getDataSourceColor = (source: string) => {
    switch (source) {
      case 'azure-api': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'data-lake': return 'bg-green-100 text-green-700 border-green-300';
      case 'mock': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDataSourceDescription = (source: string) => {
    switch (source) {
      case 'azure-api': return 'Real-time API data';
      case 'data-lake': return 'Direct CSV access';
      case 'mock': return 'Demo/fallback data';
      default: return 'Unknown source';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">AI Context</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current filters and data source for AI responses
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Data Source */}
        {serviceStatus && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Data Source</span>
            </div>
            <div className="space-y-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getDataSourceColor(serviceStatus.currentDataSource)}`}
              >
                {serviceStatus.currentDataSource.replace('-', ' ').toUpperCase()}
              </Badge>
              <p className="text-xs text-gray-600">
                {getDataSourceDescription(serviceStatus.currentDataSource)}
              </p>
              <div className="text-xs text-gray-500">
                Platform: {serviceStatus.platform}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
          </div>
          
          {activeFilters.length > 0 ? (
            <div className="space-y-3">
              {activeFilters.map((filter) => {
                const IconComponent = getFilterIcon(filter.key);
                return (
                  <div key={filter.key} className="flex items-start space-x-2">
                    <IconComponent className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {filter.key.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {typeof filter.value === 'object' 
                          ? JSON.stringify(filter.value) 
                          : filter.value.toString()
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No filters applied</p>
              <p className="text-xs text-gray-400">Global context active</p>
            </div>
          )}
        </div>

        {/* Context Summary */}
        <div className="pt-3 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              <span className="font-medium">Scope:</span> {
                activeFilters.length > 0 
                  ? `Filtered (${activeFilters.length} filter${activeFilters.length !== 1 ? 's' : ''})` 
                  : 'Global'
              }
            </div>
            <div>
              <span className="font-medium">Updated:</span> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="text-xs text-blue-700 font-medium mb-1">💡 AI Tips</div>
          <div className="text-xs text-blue-600 space-y-1">
            <div>• AI responses are based on current filters</div>
            <div>• Add filters to get specific insights</div>
            <div>• Data source affects available information</div>
          </div>
        </div>
      </div>
    </div>
  );
};