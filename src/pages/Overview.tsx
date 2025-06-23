import React, { useEffect, useState } from 'react'
import CascadingFilters from '@/components/CascadingFilters'
import KPICards from '@/components/KPICards'
import RegionalMap from '@/components/RegionalMap'
import AdsBot from '@/components/AdsBot'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Calendar, Target, AlertCircle, Brain, Zap, Users, ShoppingCart, Loader2, Filter, BarChart3, Activity } from 'lucide-react'
import { SmartFilterPanel } from '@/components/charts/SmartFilterPanel'
import { AIRecommendationPanel } from '@/components/charts/AIRecommendationPanel'
import { GeoHeatmap } from '@/components/charts/GeoHeatmap'

interface OverviewData {
  total_sales: number
  transaction_count: number
  avg_basket_size: number
  growth_rate: number
  daily_trends: Array<{
    date: string
    sales: number
    transactions: number
    avg_basket: number
  }>
  category_breakdown: Array<{
    category: string
    sales: number
    percentage: number
  }>
  regional_performance: Array<{
    region: string
    sales: number
    growth: number
    market_share: number
  }>
}

const Overview: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trends' | 'regional' | 'insights'>('trends')
  const [smartFilters, setSmartFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = { ...getActiveFilters(), ...smartFilters }
        const response = await apiService.getOverviewData(filters)
        
        if (response.status === 200) {
          setData(response.data)
        } else {
          // Enhanced mock data for comprehensive overview
          const mockData: OverviewData = {
            total_sales: 12500000,
            transaction_count: 68500,
            avg_basket_size: 182.5,
            growth_rate: 8.7,
            daily_trends: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              sales: Math.floor(Math.random() * 500000) + 300000 + (i % 7 === 5 || i % 7 === 6 ? 150000 : 0),
              transactions: Math.floor(Math.random() * 3000) + 1500 + (i % 7 === 5 || i % 7 === 6 ? 800 : 0),
              avg_basket: Math.floor(Math.random() * 50) + 150 + (i % 7 === 5 || i % 7 === 6 ? 25 : 0)
            })),
            category_breakdown: [
              { category: 'Beverages', sales: 4500000, percentage: 36 },
              { category: 'Snacks', sales: 3200000, percentage: 25.6 },
              { category: 'Dairy', sales: 2100000, percentage: 16.8 },
              { category: 'Personal Care', sales: 1800000, percentage: 14.4 },
              { category: 'Household', sales: 900000, percentage: 7.2 }
            ],
            regional_performance: [
              { region: 'Metro Manila', sales: 5000000, growth: 12.3, market_share: 40 },
              { region: 'Cebu', sales: 2800000, growth: 8.7, market_share: 22.4 },
              { region: 'Davao', sales: 2200000, growth: 15.2, market_share: 17.6 },
              { region: 'Iloilo', sales: 1500000, growth: 5.8, market_share: 12 },
              { region: 'Cagayan de Oro', sales: 1000000, growth: 18.5, market_share: 8 }
            ]
          }
          setData(mockData)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load overview data')
        console.error('Overview data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [getActiveFilters, smartFilters])

  const handleFilterChange = (filters: Record<string, any>) => {
    setSmartFilters(filters)
  }

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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

  const tabs = [
    { id: 'trends', label: 'Sales Trends', icon: TrendingUp },
    { id: 'regional', label: 'Regional Heatmap', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ] as const

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Header with Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Business Overview</h1>
                <span className="text-sm text-gray-500">Real-time analytics dashboard</span>
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
                  <span>Advanced Filters</span>
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

        {/* Filters */}
        <CascadingFilters />
        
        {/* Enhanced KPI Cards */}
        <KPICards />

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'trends' && data && (
            <>
              {/* Sales Trend Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Sales Performance Trends</h2>
                  <p className="text-sm text-gray-500 ml-4">Daily sales and transaction patterns</p>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                        name === 'sales' ? formatCurrency(value) : formatNumber(value),
                        name === 'sales' ? 'Sales' : name === 'transactions' ? 'Transactions' : 'Avg Basket'
                      ]}
                      labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString()}`}
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
                      dataKey="sales" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="transactions" 
                      stackId="2"
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.category_breakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {data.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Sales']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Regional Growth</h2>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.regional_performance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number"
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        type="category"
                        dataKey="region"
                        stroke="#6b7280"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Growth Rate']}
                      />
                      <Bar dataKey="growth" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === 'regional' && (
            <>
              {/* Enhanced Regional Map */}
              <RegionalMap />
              
              {/* Regional Heatmap */}
              {data && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <GeoHeatmap
                    data={data.regional_performance.map(region => ({
                      location: region.region,
                      value: region.sales,
                      growth: region.growth,
                      market_share: region.market_share
                    }))}
                    height={400}
                    title="Regional Sales Heatmap"
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'insights' && data && (
            <>
              {/* AI Insights Panel */}
              <AIRecommendationPanel
                data={data.daily_trends}
                xField="date"
                yField="sales"
                height={400}
                title="AI-Powered Business Insights"
              />

              {/* Performance Alerts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Performance Alerts</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Growth Opportunity</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Davao region showing 15.2% growth - consider increasing inventory allocation
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Trend Alert</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Beverages category gaining momentum with 36% market share
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Customer Insight</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Weekend basket sizes 18% larger - optimize weekend promotions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Smart Recommendations</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Inventory Optimization</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">High Impact</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Increase Dairy products by 25% in Metro Manila stores based on demand patterns
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Price Strategy</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Medium Impact</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Consider dynamic pricing for Personal Care items during peak hours (6-8 PM)
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Market Expansion</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Strategic</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Explore opportunities in underperforming regions with targeted campaigns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* AI Assistant */}
        <AdsBot />
      </div>
    </ErrorBoundary>
  )
}

export default Overview