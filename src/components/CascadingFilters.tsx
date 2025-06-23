import React, { useEffect, useState, useCallback } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, Filter, MapPin, Building2 } from 'lucide-react'
import { apiService } from '@/services/api'
import { FilterOption, FilterCounts } from '@/types'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const CascadingFilters: React.FC = () => {
  const { 
    region, city, municipality, barangay,
    holding_company, client, category, brand, sku,
    setFilter, clearFilters, getActiveFilters 
  } = useFilterStore()
  
  const [options, setOptions] = useState<Record<string, FilterOption[]>>({})
  const [counts, setCounts] = useState<FilterCounts>({ geography: {}, organization: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hierarchy definitions  
  const geographyLevels = ['region', 'city', 'municipality', 'barangay']
  const organizationLevels = ['holding_company', 'client', 'category', 'brand', 'sku']

  const geographyLabels = {
    region: 'Region',
    city: 'City',
    municipality: 'Municipality', 
    barangay: 'Barangay'
  }

  const organizationLabels = {
    holding_company: 'Holding Company',
    client: 'Client',
    category: 'Category',
    brand: 'Brand',
    sku: 'SKU'
  }

  // Field length validation to prevent 108 warnings
  const MAX_LENGTHS = {
    region: 100, city: 100, municipality: 100, barangay: 100,
    holding_company: 100, client: 100, category: 100, brand: 100, sku: 150
  }

  const truncateValue = useCallback((value: string, field: string): string => {
    const maxLength = MAX_LENGTHS[field as keyof typeof MAX_LENGTHS] || 100
    return value.length > maxLength ? value.substring(0, maxLength) : value
  }, [])

  // Fetch filter options with error handling
  const fetchOptions = useCallback(async (level: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const activeFilters = getActiveFilters()
      const truncatedFilters: Record<string, any> = {}
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && key !== level) {
          truncatedFilters[key] = typeof value === 'string' ? truncateValue(value, key) : value
        }
      })

      const response = await apiService.getFilterOptions(level, truncatedFilters)
      
      if (response.status === 200 && response.data?.options) {
        setOptions(prev => ({ ...prev, [level]: response.data.options }))
      } else {
        throw new Error(response.message || `Invalid response for ${level}`)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error'
      setError(`Failed to load ${level} options: ${errorMessage}`)
      console.error(`Filter options error for ${level}:`, err)
      
      // Set empty options on error to prevent UI breaking
      setOptions(prev => ({ ...prev, [level]: [] }))
    } finally {
      setLoading(false)
    }
  }, [getActiveFilters, truncateValue])

  // Fetch filter counts
  const fetchCounts = useCallback(async () => {
    try {
      const activeFilters = getActiveFilters()
      const truncatedFilters: Record<string, any> = {}
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          truncatedFilters[key] = typeof value === 'string' ? truncateValue(value, key) : value
        }
      })

      const response = await apiService.getFilterCounts(truncatedFilters)
      
      if (response.status === 200 && response.data) {
        setCounts(response.data)
      }
    } catch (err) {
      console.error('Filter counts error:', err)
      setCounts({ geography: {}, organization: {} })
    }
  }, [getActiveFilters, truncateValue])

  // Load initial options and update when filters change
  useEffect(() => {
    const loadInitialOptions = async () => {
      // Load first level options
      await Promise.all([
        fetchOptions('region'),
        fetchOptions('holding_company')
      ])
      
      // Load dependent options based on current selections
      if (region) await fetchOptions('city')
      if (city) await fetchOptions('municipality')
      if (municipality) await fetchOptions('barangay')
      
      if (holding_company) await fetchOptions('client')
      if (client) await fetchOptions('category')
      if (category) await fetchOptions('brand')
      if (brand) await fetchOptions('sku')
      
      // Load counts
      await fetchCounts()
    }

    loadInitialOptions()
  }, [region, city, municipality, barangay, holding_company, client, category, brand, sku, fetchOptions, fetchCounts])

  const handleFilterChange = useCallback((level: string, value: string | null) => {
    setFilter(level, value)
  }, [setFilter])

  const getActiveFiltersCount = () => {
    return Object.values(getActiveFilters()).filter(Boolean).length
  }

  const renderSelect = (level: string, value: string | null, placeholder: string, disabled = false) => {
    const levelOptions = options[level] || []
    const isLoading = loading && levelOptions.length === 0

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          {placeholder}
          {counts.geography[level] !== undefined && (
            <span className="ml-1 text-xs text-gray-500">
              ({counts.geography[level] || counts.organization[level] || 0})
            </span>
          )}
        </label>
        <Select
          value={value || ''}
          onValueChange={(val) => handleFilterChange(level, val || null)}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? 'Loading...' : `Select ${placeholder}`} />
          </SelectTrigger>
          <SelectContent>
            {levelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {option.count}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geography Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-gray-900">Geographic Hierarchy</h3>
            </div>
            
            <div className="space-y-3">
              {renderSelect('region', region, geographyLabels.region)}
              {renderSelect('city', city, geographyLabels.city, !region)}
              {renderSelect('municipality', municipality, geographyLabels.municipality, !city)}
              {renderSelect('barangay', barangay, geographyLabels.barangay, !municipality)}
            </div>
          </div>

          {/* Organization Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium text-gray-900">Organization Hierarchy</h3>
            </div>
            
            <div className="space-y-3">
              {renderSelect('holding_company', holding_company, organizationLabels.holding_company)}
              {renderSelect('client', client, organizationLabels.client, !holding_company)}
              {renderSelect('category', category, organizationLabels.category, !client)}
              {renderSelect('brand', brand, organizationLabels.brand, !category)}
              {renderSelect('sku', sku, organizationLabels.sku, !brand)}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(getActiveFilters()).map(([key, value]) => (
                value && (
                  <Badge
                    key={key}
                    variant="outline"
                    className="bg-blue-50 text-blue-800 border-blue-200"
                  >
                    {geographyLabels[key as keyof typeof geographyLabels] || 
                     organizationLabels[key as keyof typeof organizationLabels] || 
                     key}: {value}
                    <button
                      onClick={() => handleFilterChange(key, null)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading filter options...
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default CascadingFilters