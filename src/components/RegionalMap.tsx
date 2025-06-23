import React, { useEffect, useState, useRef } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { MapPin, Loader2, BarChart3 } from 'lucide-react'

interface RegionData {
  region: string
  city?: string
  municipality?: string
  coordinates: [number, number]
  total_sales: number
  transaction_count: number
  avg_basket_size: number
}

const RegionalMap: React.FC = () => {
  const { getActiveFilters, setFilter } = useFilterStore()
  const [data, setData] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getOverviewData(filters)
        
        if (response.status === 200) {
          // Mock geographic data for demonstration
          // In a real implementation, this would come from the API
          const mockData: RegionData[] = [
            {
              region: 'Metro Manila',
              coordinates: [14.5995, 120.9842],
              total_sales: 2500000,
              transaction_count: 15000,
              avg_basket_size: 166.67
            },
            {
              region: 'Cebu',
              coordinates: [10.3157, 123.8854],
              total_sales: 1800000,
              transaction_count: 12000,
              avg_basket_size: 150.00
            },
            {
              region: 'Davao',
              coordinates: [7.1907, 125.4553],
              total_sales: 1200000,
              transaction_count: 8000,
              avg_basket_size: 150.00
            },
            {
              region: 'Iloilo',
              coordinates: [10.7202, 122.5621],
              total_sales: 900000,
              transaction_count: 6000,
              avg_basket_size: 150.00
            },
            {
              region: 'Cagayan de Oro',
              coordinates: [8.4542, 124.6319],
              total_sales: 750000,
              transaction_count: 5000,
              avg_basket_size: 150.00
            }
          ]
          
          setData(mockData)
        } else {
          throw new Error(response.message || 'Failed to fetch map data')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load map data')
        console.error('Map data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [getActiveFilters])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const getMarkerSize = (sales: number, maxSales: number): number => {
    const minSize = 20
    const maxSize = 60
    const ratio = sales / maxSales
    return minSize + (maxSize - minSize) * ratio
  }

  const handleRegionClick = (region: RegionData) => {
    setSelectedRegion(region)
    setFilter('region', region.region)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-500">Loading regional data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load map data</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const maxSales = Math.max(...data.map(d => d.total_sales))

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Regional Performance</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div 
              ref={mapRef}
              className="relative bg-gray-50 rounded-lg h-80 overflow-hidden border"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23000' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {/* Philippines Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Interactive Philippines Map</p>
                  <p className="text-xs text-gray-400">Click on regions below to explore</p>
                </div>
              </div>

              {/* Data Points Overlay */}
              {data.map((region, index) => (
                <div
                  key={region.region}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${20 + (index * 15)}%`,
                    top: `${30 + (index * 12)}%`,
                  }}
                  onClick={() => handleRegionClick(region)}
                >
                  <div
                    className={`rounded-full bg-blue-500 bg-opacity-70 hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center ${
                      selectedRegion?.region === region.region ? 'ring-4 ring-blue-300' : ''
                    }`}
                    style={{
                      width: getMarkerSize(region.total_sales, maxSales),
                      height: getMarkerSize(region.total_sales, maxSales),
                    }}
                  >
                    <span className="text-white text-xs font-medium">
                      {region.region.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                      <div className="font-medium">{region.region}</div>
                      <div>{formatCurrency(region.total_sales)}</div>
                      <div>{formatNumber(region.transaction_count)} transactions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Data List */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 mb-4">Regions by Performance</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {data
                .sort((a, b) => b.total_sales - a.total_sales)
                .map((region, index) => (
                  <div
                    key={region.region}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedRegion?.region === region.region
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleRegionClick(region)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm text-gray-900">
                          {region.region}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Sales:</span>
                        <span className="font-medium">{formatCurrency(region.total_sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions:</span>
                        <span className="font-medium">{formatNumber(region.transaction_count)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Basket:</span>
                        <span className="font-medium">{formatCurrency(region.avg_basket_size)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Sales Volume</span>
              </div>
              <div className="text-xs text-gray-500">
                Bubble size represents sales volume • Click to filter by region
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default RegionalMap