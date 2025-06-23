import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, TrendingUp, Layers, Target, Loader2, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import { ParetoChart } from '@/components/charts/ParetoChart'
import { SankeyDiagram } from '@/components/charts/SankeyDiagram'
import { SmartFilterPanel } from '@/components/charts/SmartFilterPanel'

interface ProductData {
  category: string
  brand: string
  sku: string
  total_sales: number
  transaction_count: number
  market_share: number
  growth_rate: number
}

const ProductMix: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [data, setData] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'category' | 'brand' | 'sku'>('category')
  const [activeTab, setActiveTab] = useState<'overview' | 'pareto' | 'substitution'>('overview')
  const [smartFilters, setSmartFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = { ...getActiveFilters(), ...smartFilters }
        const response = await apiService.getProductMixData({ ...filters, level: viewType })
        
        if (response.status === 200) {
          setData(response.data?.products || [])
        } else {
          // Enhanced mock data for comprehensive analysis
          const mockData: ProductData[] = [
            {
              category: 'Beverages',
              brand: 'Coca-Cola',
              sku: 'Coke 330ml',
              total_sales: 2500000,
              transaction_count: 15000,
              market_share: 35.2,
              growth_rate: 12.5
            },
            {
              category: 'Beverages',
              brand: 'Pepsi',
              sku: 'Pepsi 330ml',
              total_sales: 1800000,
              transaction_count: 11000,
              market_share: 25.4,
              growth_rate: 8.3
            },
            {
              category: 'Snacks',
              brand: 'Lay\'s',
              sku: 'Lay\'s Classic 50g',
              total_sales: 1500000,
              transaction_count: 12000,
              market_share: 21.1,
              growth_rate: 15.8
            },
            {
              category: 'Dairy',
              brand: 'Nestle',
              sku: 'Nestle Milk 1L',
              total_sales: 1200000,
              transaction_count: 8000,
              market_share: 16.9,
              growth_rate: -2.1
            },
            {
              category: 'Snacks',
              brand: 'Oreo',
              sku: 'Oreo Original 137g',
              total_sales: 900000,
              transaction_count: 7500,
              market_share: 12.7,
              growth_rate: 9.4
            },
            {
              category: 'Personal Care',
              brand: 'Unilever',
              sku: 'Dove Soap 100g',
              total_sales: 750000,
              transaction_count: 6000,
              market_share: 10.6,
              growth_rate: 5.2
            },
            {
              category: 'Household',
              brand: 'P&G',
              sku: 'Tide Detergent 1kg',
              total_sales: 650000,
              transaction_count: 4500,
              market_share: 9.1,
              growth_rate: 3.7
            },
            {
              category: 'Beverages',
              brand: 'San Miguel',
              sku: 'SMB Pale Pilsen 330ml',
              total_sales: 580000,
              transaction_count: 4200,
              market_share: 8.2,
              growth_rate: 7.1
            }
          ]
          setData(mockData)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product data')
        console.error('Product data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [getActiveFilters, viewType, smartFilters])

  // Generate substitution flow data
  const substitutionData = React.useMemo(() => {
    const nodes = [
      // Source products (being substituted)
      { id: 'coke', name: 'Coca-Cola', category: 'source' as const, value: 2500000 },
      { id: 'lays', name: 'Lay\'s Classic', category: 'source' as const, value: 1500000 },
      { id: 'nestle', name: 'Nestle Milk', category: 'source' as const, value: 1200000 },
      
      // Target products (substitutes)
      { id: 'pepsi', name: 'Pepsi', category: 'target' as const, value: 1800000 },
      { id: 'oreo', name: 'Oreo', category: 'target' as const, value: 900000 },
      { id: 'dove', name: 'Dove Soap', category: 'target' as const, value: 750000 },
      { id: 'smb', name: 'SMB Beer', category: 'target' as const, value: 580000 }
    ];

    const links = [
      { source: 'coke', target: 'pepsi', value: 450000 },
      { source: 'coke', target: 'smb', value: 320000 },
      { source: 'lays', target: 'oreo', value: 280000 },
      { source: 'nestle', target: 'dove', value: 180000 },
      { source: 'lays', target: 'pepsi', value: 150000 }
    ];

    return { nodes, links };
  }, []);

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

  const handleFilterChange = (filters: Record<string, any>) => {
    setSmartFilters(filters)
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  // Aggregate data by category for category performance
  const categoryData = React.useMemo(() => {
    const categoryMap = new Map<string, { total_sales: number; transaction_count: number; growth_rate: number; count: number }>()
    
    data.forEach(item => {
      const existing = categoryMap.get(item.category) || { total_sales: 0, transaction_count: 0, growth_rate: 0, count: 0 }
      existing.total_sales += item.total_sales
      existing.transaction_count += item.transaction_count
      existing.growth_rate += item.growth_rate
      existing.count += 1
      categoryMap.set(item.category, existing)
    })

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      total_sales: stats.total_sales,
      transaction_count: stats.transaction_count,
      avg_growth_rate: stats.growth_rate / stats.count,
      market_share: data.length > 0 ? (stats.total_sales / data.reduce((sum, item) => sum + item.total_sales, 0)) * 100 : 0
    }))
  }, [data])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'pareto', label: 'Pareto Analysis', icon: TrendingUp },
    { id: 'substitution', label: 'Substitution Flow', icon: Layers }
  ] as const

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-500">Loading product mix data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load product data</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Header with Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Product Mix Analysis</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                    showFilters
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                {(['category', 'brand', 'sku'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      viewType === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="px-6">
            <div className="flex space-x-1 border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Smart Filters Panel */}
        {showFilters && (
          <SmartFilterPanel
            onFilterChange={handleFilterChange}
            activeFilters={smartFilters}
            className="w-full"
          />
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {data.length}
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      Active {viewType}s
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.reduce((sum, item) => sum + item.total_sales, 0))}
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      Total Sales
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {data.length > 0 ? (data.reduce((sum, item) => sum + item.market_share, 0) / data.length).toFixed(1) : 0}%
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Market Share
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {data.length > 0 ? (data.reduce((sum, item) => sum + item.growth_rate, 0) / data.length).toFixed(1) : 0}%
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Growth Rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Market Share Pie Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Target className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Market Share Distribution</h2>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.map((item, index) => ({
                          name: item[viewType],
                          value: item.total_sales,
                          market_share: item.market_share,
                          color: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, market_share }) => `${name}: ${market_share.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Sales']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{category.category}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(category.total_sales)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.avg_growth_rate > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.avg_growth_rate > 0 ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(category.avg_growth_rate).toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-600">{category.market_share.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pareto' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ParetoChart
                data={data}
                nameField={viewType}
                valueField="total_sales"
                height={500}
                title="Product Performance Pareto Analysis"
                showRule80={true}
              />
            </div>
          )}

          {activeTab === 'substitution' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SankeyDiagram
                nodes={substitutionData.nodes}
                links={substitutionData.links}
                width={800}
                height={400}
              />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ProductMix