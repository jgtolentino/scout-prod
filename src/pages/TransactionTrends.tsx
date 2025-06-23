import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts'
import { TrendingUp, Calendar, Clock, Loader2 } from 'lucide-react'

interface TrendData {
  timestamp: string
  total_sales: number
  transaction_count: number
  avg_basket_size: number
  period: string
}

const TransactionTrends: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getTransactionTrends({ ...filters, period: viewType })
        
        if (response.status === 200) {
          setData(response.data?.trends || [])
        } else {
          // Mock data for demonstration
          const mockData: TrendData[] = Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            total_sales: Math.floor(Math.random() * 500000) + 100000,
            transaction_count: Math.floor(Math.random() * 1000) + 200,
            avg_basket_size: Math.floor(Math.random() * 200) + 100,
            period: viewType
          }))
          setData(mockData)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load trends data')
        console.error('Trends data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendsData()
  }, [getActiveFilters, viewType])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    switch (viewType) {
      case 'hourly':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case 'daily':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`
      case 'monthly':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' })
      default:
        return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-500">Loading transaction trends...</p>
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
            <TrendingUp className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load trends data</h3>
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
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Transaction Trends</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((type) => (
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

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Sales']}
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total_sales" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Count Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Transaction Volume</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="transaction_count" 
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Basket Size Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Average Basket Size</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Avg. Basket Size']}
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_basket_size" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default TransactionTrends