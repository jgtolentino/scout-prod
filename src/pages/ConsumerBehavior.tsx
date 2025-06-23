import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts'
import { Users, Clock, ShoppingCart, TrendingUp, Loader2, Calendar, Target, Filter, Activity, Package } from 'lucide-react'
import { FunnelChart } from '@/components/charts/FunnelChart'
import { BasketAnalysis } from '@/components/charts/BasketAnalysis'
import { SmartFilterPanel } from '@/components/charts/SmartFilterPanel'

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
  const [activeTab, setActiveTab] = useState<'patterns' | 'funnel' | 'basket'>('patterns')
  const [smartFilters, setSmartFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = { ...getActiveFilters(), ...smartFilters }
        const response = await apiService.getConsumerBehaviorData(filters)
        
        if (response.status === 200) {
          setData(response.data)
        } else {
          // Enhanced mock data for comprehensive analysis
          const mockHourlyData: HourlyPattern[] = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            transactions: Math.floor(Math.random() * 500) + 50 + (i >= 10 && i <= 14 || i >= 18 && i <= 21 ? 200 : 0),
            avg_basket: Math.floor(Math.random() * 200) + 100 + (i >= 18 && i <= 21 ? 50 : 0)
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
  }, [getActiveFilters, smartFilters])

  // Generate funnel data for customer journey
  const funnelData = [
    { stage: 'Awareness', value: 100000, percentage: 100, description: 'Total potential customers' },
    { stage: 'Consideration', value: 65000, percentage: 65, description: 'Customers who showed interest' },
    { stage: 'Intent', value: 42000, percentage: 42, description: 'Customers ready to purchase' },
    { stage: 'Purchase', value: 28000, percentage: 28, description: 'Actual purchases' },
    { stage: 'Loyalty', value: 18000, percentage: 18, description: 'Repeat customers' }
  ];

  // Generate basket analysis data
  const basketData = [
    // Individual items
    { product1: 'Coca-Cola 330ml', support: 0.45, confidence: 0.45, lift: 1.0, frequency: 12500, category: 'Beverages' },
    { product1: 'Lay\'s Classic 50g', support: 0.38, confidence: 0.38, lift: 1.0, frequency: 9800, category: 'Snacks' },
    { product1: 'Oreo Original', support: 0.32, confidence: 0.32, lift: 1.0, frequency: 8200, category: 'Snacks' },
    { product1: 'Nestle Milk 1L', support: 0.28, confidence: 0.28, lift: 1.0, frequency: 7100, category: 'Dairy' },
    
    // Association rules
    { product1: 'Coca-Cola 330ml', product2: 'Lay\'s Classic 50g', support: 0.32, confidence: 0.71, lift: 1.87, frequency: 8200, category: 'Cross-category' },
    { product1: 'Oreo Original', product2: 'Nestle Milk 1L', support: 0.18, confidence: 0.56, lift: 2.0, frequency: 4600, category: 'Complementary' },
    { product1: 'Coffee 3-in-1', product2: 'Oreo Original', support: 0.15, confidence: 0.62, lift: 1.94, frequency: 3800, category: 'Complementary' },
    { product1: 'Bread Loaf', product2: 'Nestle Milk 1L', support: 0.22, confidence: 0.65, lift: 2.32, frequency: 5600, category: 'Meal-based' },
    { product1: 'Instant Noodles', product2: 'Soft Drinks', support: 0.19, confidence: 0.58, lift: 1.76, frequency: 4900, category: 'Convenience' }
  ];

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

  const handleFilterChange = (filters: Record<string, any>) => {
    setSmartFilters(filters)
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
    { subject: 'Morning Rush', current: 120, previous: 110, fullMark: 150 },
    { subject: 'Lunch Time', current: 98, previous: 130, fullMark: 150 },
    { subject: 'Afternoon', current: 86, previous: 130, fullMark: 150 },
    { subject: 'Evening Peak', current: 99, previous: 100, fullMark: 150 },
    { subject: 'Night', current: 85, previous: 90, fullMark: 150 },
    { subject: 'Weekend', current: 65, previous: 85, fullMark: 150 }
  ]

  const tabs = [
    { id: 'patterns', label: 'Shopping Patterns', icon: Activity },
    { id: 'funnel', label: 'Customer Journey', icon: Users },
    { id: 'basket', label: 'Basket Analysis', icon: ShoppingCart }
  ] as const

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
        {/* Enhanced Header with Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Consumer Behavior Analysis</h1>
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
                {hourlyData.length > 0 ? formatHour(hourlyData.reduce((max, curr) => curr.transactions > hourlyData[max].transactions ? hourlyData.indexOf(curr) : max, 0)) : '00:00'}
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

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'patterns' && (
            <>
              {/* Shopping Patterns Over Time */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shopping Patterns Over Time</h2>
                  <p className="text-sm text-gray-500 ml-4">Multi-line chart of behavioral trends</p>
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
                      yAxisId="left"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'transactions' ? formatNumber(value) : formatCurrency(value),
                        name === 'transactions' ? 'Transactions' : 'Avg Basket Size'
                      ]}
                      labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="transactions" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="avg_basket" 
                      stackId="2"
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

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
                        dataKey="current"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Previous Period"
                        dataKey="previous"
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

              {/* Customer Segments */}
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
            </>
          )}

          {activeTab === 'funnel' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FunnelChart
                data={funnelData}
                height={500}
                title="Customer Journey Funnel"
                showPercentages={true}
              />
            </div>
          )}

          {activeTab === 'basket' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <BasketAnalysis
                data={basketData}
                height={400}
                title="Market Basket Analysis"
              />
            </div>
          )}
        </div>

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