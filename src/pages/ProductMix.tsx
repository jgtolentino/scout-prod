import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts'
import { Package, TrendingUp, Layers, Target, Loader2 } from 'lucide-react'

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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getProductData({ ...filters, level: viewType })
        
        if (response.status === 200) {
          setData(response.data?.products || [])
        } else {
          // Mock data for demonstration
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
              category: 'Snacks',
              brand: 'Lay\'s',
              sku: 'Lay\'s Classic 50g',
              total_sales: 1800000,
              transaction_count: 12000,
              market_share: 25.4,
              growth_rate: 8.3
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
              category: 'Personal Care',
              brand: 'Unilever',
              sku: 'Dove Soap 100g',
              total_sales: 900000,
              transaction_count: 6000,
              market_share: 12.7,
              growth_rate: 15.8
            },
            {
              category: 'Household',
              brand: 'P&G',
              sku: 'Tide Detergent 1kg',
              total_sales: 700000,
              transaction_count: 4500,
              market_share: 9.8,
              growth_rate: 5.2
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
  }, [getActiveFilters, viewType])

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

  const pieData = data.map((item, index) => ({
    name: item[viewType],
    value: item.total_sales,
    market_share: item.market_share,
    color: COLORS[index % COLORS.length]
  }))

  const radialData = data.map((item, index) => ({
    name: item[viewType],
    value: item.market_share,
    fill: COLORS[index % COLORS.length]
  }))

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Product Mix Analysis</h1>
            </div>
            
            <div className="flex items-center space-x-2">
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, market_share }) => `${name}: ${market_share}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Sales Performance Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={viewType}
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="total_sales" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Share Radial Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Layers className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Market Share Breakdown</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={radialData}>
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                clockWise
                dataKey="value"
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Market Share']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Detailed Performance</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Share
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item[viewType]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.transaction_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.market_share.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.growth_rate > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.growth_rate > 0 ? '+' : ''}{item.growth_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ProductMix