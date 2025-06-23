// Smart Filter Panel with Enhanced Controls
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Filter, Calendar, MapPin, Package, Users, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SmartFilterPanelProps {
  onFilterChange: (filters: Record<string, any>) => void;
  activeFilters: Record<string, any>;
  className?: string;
}

export const SmartFilterPanel: React.FC<SmartFilterPanelProps> = ({ 
  onFilterChange, 
  activeFilters = {},
  className = "" 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState(activeFilters.timeRange || 'last7days');
  const [includeWeekends, setIncludeWeekends] = useState(activeFilters.includeWeekends || true);
  const [location, setLocation] = useState(activeFilters.location || 'all');
  const [category, setCategory] = useState(activeFilters.category || 'all');
  const [excludeReturns, setExcludeReturns] = useState(activeFilters.excludeReturns || false);
  const [groupSmallValues, setGroupSmallValues] = useState(activeFilters.groupSmallValues || false);

  const timePresets = [
    { value: 'today', label: 'Today', count: 156 },
    { value: 'yesterday', label: 'Yesterday', count: 234 },
    { value: 'last7days', label: 'Last 7 Days', count: 1842 },
    { value: 'last30days', label: 'Last 30 Days', count: 7654 },
    { value: 'custom', label: 'Custom Range', count: null }
  ];

  const locations = [
    { value: 'all', label: 'All Locations', count: 7654 },
    { value: 'ncr', label: 'National Capital Region', count: 3420 },
    { value: 'cebu', label: 'Cebu', count: 1890 },
    { value: 'davao', label: 'Davao', count: 1234 },
    { value: 'others', label: 'Other Regions', count: 1110 }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', count: 7654 },
    { value: 'beverages', label: 'Beverages', count: 2456 },
    { value: 'snacks', label: 'Snacks', count: 1890 },
    { value: 'dairy', label: 'Dairy Products', count: 1234 },
    { value: 'tobacco', label: 'Tobacco', count: 987 },
    { value: 'others', label: 'Others', count: 1087 }
  ];

  const applyFilters = () => {
    const filters = {
      timeRange,
      includeWeekends,
      location,
      category,
      excludeReturns,
      groupSmallValues
    };
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setTimeRange('last7days');
    setIncludeWeekends(true);
    setLocation('all');
    setCategory('all');
    setExcludeReturns(false);
    setGroupSmallValues(false);
    onFilterChange({
      timeRange: 'last7days',
      includeWeekends: true,
      location: 'all',
      category: 'all',
      excludeReturns: false,
      groupSmallValues: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (timeRange !== 'last7days') count++;
    if (!includeWeekends) count++;
    if (location !== 'all') count++;
    if (category !== 'all') count++;
    if (excludeReturns) count++;
    if (groupSmallValues) count++;
    return count;
  };

  const FilterSelect = ({ 
    options, 
    value, 
    onChange, 
    icon: Icon, 
    label 
  }: { 
    options: FilterOption[]; 
    value: string; 
    onChange: (value: string) => void; 
    icon: any; 
    label: string; 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-between p-2 text-sm rounded-md transition-colors ${
              value === option.value
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <span>{option.label}</span>
            {option.count && (
              <Badge variant="secondary" className="text-xs">
                {option.count.toLocaleString()}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const ToggleControl = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string; 
    description?: string; 
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Smart Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`space-y-6 ${expanded ? '' : 'max-h-40 overflow-hidden'}`}>
          {/* Time Dimension */}
          <FilterSelect
            options={timePresets}
            value={timeRange}
            onChange={setTimeRange}
            icon={Calendar}
            label="Time Range"
          />

          {/* Location Hierarchy */}
          <FilterSelect
            options={locations}
            value={location}
            onChange={setLocation}
            icon={MapPin}
            label="Location"
          />

          {/* Product Dimension */}
          <FilterSelect
            options={categories}
            value={category}
            onChange={setCategory}
            icon={Package}
            label="Product Category"
          />

          {/* Advanced Toggles */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Advanced Options</span>
            </div>
            
            <ToggleControl
              checked={includeWeekends}
              onChange={setIncludeWeekends}
              label="Include Weekends"
              description="Show Saturday and Sunday data"
            />
            
            <ToggleControl
              checked={excludeReturns}
              onChange={setExcludeReturns}
              label="Exclude Returns"
              description="Filter out return transactions"
            />
            
            <ToggleControl
              checked={groupSmallValues}
              onChange={setGroupSmallValues}
              label="Group Small Values"
              description="Combine values under ₱50"
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={applyFilters}
            className="w-full"
            size="sm"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};