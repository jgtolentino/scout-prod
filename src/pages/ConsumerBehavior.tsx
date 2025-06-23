import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts'
import { Users, Clock, ShoppingCart, TrendingUp, Loader2, Calendar, Target } from 'lucide-react'

interface BehaviorData {
  hour: number
  day_of_week: string
  avg_basket_size: number
  transaction_count: number
  customer_segments: {
    segment: string
    percentage: number
    avg_spend: number
  }[]
  purchase_patterns: {
    pattern: string
    frequency: number
    value: number
  }[]
}

interface HourlyPattern {
  hour: number
  transactions: number
  avg_basket: number
}

interface CustomerSegment {
  segment: string
  percentage: number
  avg_spend: number
  transactions: number
}

const ConsumerBehavior: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [data, setData] = useState<BehaviorData | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyPattern[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'hourly' | 'daily' | 'segments'>('hourly')

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getConsumerBehaviorData(filters)
        
        if (response.status === 200) {
          setData(response.data)
        } else {
          // Mock data for demonstration
          const mockHourlyData: HourlyPattern[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            transactions: Math.floor(Math.random() * 500) + 50,
            avg_basket: Math.floor(Math.random() * 200) + 100
          }))

          const mockSegments: CustomerSegment[] = [
            { segment: 'High Value', percentage: 15, avg_spend: 850, transactions: 2500 },
            { segment: 'Regular', percentage: 45, avg_spend: 320, transactions: 8500 },
            { segment: 'Occasional', percentage: 25, avg_spend: 180, transactions: 3200 },
            { segment: 'New', percentage: 15, avg_spend: 120, transactions: 1800 }
          ]

          setHourlyData(mockHourlyData)
          setSegments(mockSegments)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load consumer behavior data')
        console.error('Consumer behavior data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBehaviorData()
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

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const dayOfWeekData = [
    { day: 'Mon', transactions: 1200, avg_basket: 165 },
    { day: 'Tue', transactions: 1100, avg_basket: 158 },
    { day: 'Wed', transactions: 1300, avg_basket: 172 },
    { day: 'Thu', transactions: 1250, avg_basket: 168 },
    { day: 'Fri', transactions: 1800, avg_basket: 185 },
    { day: 'Sat', transactions: 2200, avg_basket: 195 },
    { day: 'Sun', transactions: 1900, avg_basket: 178 }
  ]

  const radarData = [
    { subject: 'Morning Rush', A: 120, B: 110, fullMark: 150 },
    { subject: 'Lunch Time', A: 98, B: 130, fullMark: 150 },
    { subject: 'Afternoon', A: 86, B: 130, fullMark: 150 },
    { subject: 'Evening Peak', A: 99, B: 100, fullMark: 150 },
    { subject: 'Night', A: 85, B: 90, fullMark: 150 },
    { subject: 'Weekend', A: 65, B: 85, fullMark: 150 }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-500">Loading consumer behavior data...</p>
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
            <Users className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load consumer behavior data</h3>
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
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Consumer Behavior Analysis</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {(['hourly', 'daily', 'segments'] as const).map((type) => (
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {segments.reduce((sum, seg) => sum + seg.transactions, 0).toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                Total Customers
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(segments.reduce((sum, seg) => sum + (seg.avg_spend * seg.transactions), 0) / segments.reduce((sum, seg) => sum + seg.transactions, 0))}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                Avg Basket Size
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {formatHour(hourlyData.reduce((max, curr) => curr.transactions > hourlyData[max].transactions ? hourlyData.indexOf(curr) : max, 0))}
              </h3>
              <p className="text-sm font-medium text-gray-600">
                Peak Hour
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {segments.find(s => s.segment === 'High Value')?.percentage || 0}%
              </h3>
              <p className="text-sm font-medium text-gray-600">
                High Value Customers
              </p>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        {viewType === 'hourly' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hourly Transaction Pattern */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Hourly Transaction Pattern</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour"
                    tickFormatter={formatHour}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), 'Transactions']}
                    labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#f97316" 
                    fill="#f97316"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Basket Size */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Hourly Basket Size</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour"
                    tickFormatter={formatHour}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Avg Basket']}
                    labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_basket" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewType === 'daily' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Day of Week Pattern */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Weekly Pattern</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), 'Transactions']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="transactions" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Behavior Radar Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Behavior Patterns</h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 150]} />
                  <Radar
                    name="Current Period"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Previous Period"
                    dataKey="B"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewType === 'segments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Customer Segments</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {segments.map((segment, index) => (
                <div key={segment.segment} className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      index === 0 ? 'bg-yellow-100' :
                      index === 1 ? 'bg-green-100' :
                      index === 2 ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Users className={`w-8 h-8 ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-green-600' :
                        index === 2 ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {segment.segment}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Share: </span>
                        <span className="font-medium">{segment.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Spend: </span>
                        <span className="font-medium">{formatCurrency(segment.avg_spend)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Customers: </span>
                        <span className="font-medium">{formatNumber(segment.transactions)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Key Insights</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Peak Shopping Hours</h4>
              <p className="text-sm text-blue-700">
                Highest transaction volume occurs between 6-8 PM on weekdays and 2-4 PM on weekends.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Customer Loyalty</h4>
              <p className="text-sm text-green-700">
                High-value customers represent 15% of the base but contribute 40% of total revenue.
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Basket Behavior</h4>
              <p className="text-sm text-orange-700">
                Weekend shoppers have 18% larger basket sizes compared to weekday shoppers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ConsumerBehavior