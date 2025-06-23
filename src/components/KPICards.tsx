import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { KPIData } from '@/types'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, BarChart3, Loader2 } from 'lucide-react'

const KPICards: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousData, setPreviousData] = useState<KPIData | null>(null)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getOverviewData(filters)
        
        if (response.status === 200) {
          setPreviousData(data) // Store previous data for comparison
          setData(response.data)
        } else {
          throw new Error(response.message || 'Failed to fetch KPI data')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load KPI data')
        console.error('KPI data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIData()
  }, [getActiveFilters, data])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const renderTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <BarChart3 className="w-4 h-4 text-gray-400" />
  }

  const renderTrendText = (change: number) => {
    const absChange = Math.abs(change)
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
    const prefix = change > 0 ? '+' : change < 0 ? '' : '±'
    
    return (
      <span className={`text-sm font-medium ${color}`}>
        {prefix}{absChange.toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load KPI data</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Calculate trends if we have previous data
  const trends = previousData ? {
    sales: calculatePercentageChange(data.total_sales, previousData.total_sales),
    transactions: calculatePercentageChange(data.transaction_count, previousData.transaction_count),
    basket: calculatePercentageChange(data.avg_basket_size, previousData.avg_basket_size),
    growth: data.growth_rate
  } : {
    sales: 0,
    transactions: 0,
    basket: 0,
    growth: data.growth_rate || 0
  }

  const kpiCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(data.total_sales),
      trend: trends.sales,
      icon: DollarSign,
      color: 'blue',
      description: 'Revenue generated'
    },
    {
      title: 'Transactions',
      value: formatNumber(data.transaction_count),
      trend: trends.transactions,
      icon: ShoppingCart,
      color: 'green',
      description: 'Number of transactions'
    },
    {
      title: 'Avg. Basket Size',
      value: formatCurrency(data.avg_basket_size),
      trend: trends.basket,
      icon: Users,
      color: 'orange',
      description: 'Average transaction value'
    },
    {
      title: 'Growth Rate',
      value: `${trends.growth.toFixed(1)}%`,
      trend: trends.growth,
      icon: TrendingUp,
      color: 'purple',
      description: 'Period over period'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon
          const colorClasses = getColorClasses(card.color)
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {renderTrendIcon(card.trend)}
                  {renderTrendText(card.trend)}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {card.value}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </ErrorBoundary>
  )
}

export default KPICards