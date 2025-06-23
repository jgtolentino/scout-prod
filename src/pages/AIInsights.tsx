import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Lightbulb, TrendingUp, AlertTriangle, Target, Zap, Loader2, Brain, BarChart3 } from 'lucide-react'

interface AIInsight {
  id: string
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast' | 'opportunity'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  data?: any
  actionable: boolean
  timestamp: string
}

interface PredictiveModel {
  name: string
  accuracy: number
  prediction: string
  confidence: number
  timeframe: string
}

const AIInsights: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [models, setModels] = useState<PredictiveModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [generatingInsight, setGeneratingInsight] = useState(false)

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const filters = getActiveFilters()
        const response = await apiService.getAIInsights(filters)
        
        if (response.status === 200) {
          setInsights(response.data?.insights || [])
          setModels(response.data?.models || [])
        } else {
          // Mock AI insights for demonstration
          const mockInsights: AIInsight[] = [
            {
              id: '1',
              type: 'trend',
              title: 'Emerging Growth in Metro Manila',
              description: 'Sales in Metro Manila have increased by 23% over the past 30 days, significantly outpacing other regions. This trend is driven by increased consumer confidence and new product launches.',
              confidence: 0.89,
              impact: 'high',
              category: 'Sales',
              actionable: true,
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'anomaly',
              title: 'Unusual Spike in Cebu Transactions',
              description: 'Transaction volume in Cebu region is 45% higher than expected for this time period. Investigation reveals correlation with local festival events.',
              confidence: 0.76,
              impact: 'medium',
              category: 'Operations',
              actionable: true,
              timestamp: new Date().toISOString()
            },
            {
              id: '3',
              type: 'recommendation',
              title: 'Inventory Optimization Opportunity',
              description: 'Based on current trends and seasonal patterns, recommend increasing stock levels for top-performing SKUs by 15% in high-traffic locations.',
              confidence: 0.82,
              impact: 'high',
              category: 'Inventory',
              actionable: true,
              timestamp: new Date().toISOString()
            },
            {
              id: '4',
              type: 'forecast',
              title: 'Q4 Revenue Projection',
              description: 'Machine learning models predict 18% revenue growth in Q4 based on historical patterns, current trends, and market indicators.',
              confidence: 0.71,
              impact: 'high',
              category: 'Finance',
              actionable: false,
              timestamp: new Date().toISOString()
            },
            {
              id: '5',
              type: 'opportunity',
              title: 'Cross-selling Potential',
              description: 'Customers purchasing beverages show 67% likelihood to buy snacks. Implementing targeted promotions could increase basket size by 12%.',
              confidence: 0.85,
              impact: 'medium',
              category: 'Marketing',
              actionable: true,
              timestamp: new Date().toISOString()
            }
          ]

          const mockModels: PredictiveModel[] = [
            {
              name: 'Sales Forecasting',
              accuracy: 87.3,
              prediction: '+18% revenue growth expected',
              confidence: 0.87,
              timeframe: 'Next Quarter'
            },
            {
              name: 'Demand Planning',
              accuracy: 82.1,
              prediction: 'Peak demand on weekends',
              confidence: 0.82,
              timeframe: 'Next 30 days'
            },
            {
              name: 'Customer Segmentation',
              accuracy: 91.5,
              prediction: '4 distinct customer segments',
              confidence: 0.92,
              timeframe: 'Current'
            },
            {
              name: 'Anomaly Detection',
              accuracy: 94.2,
              prediction: 'No anomalies detected',
              confidence: 0.94,
              timeframe: 'Real-time'
            }
          ]

          setInsights(mockInsights)
          setModels(mockModels)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load AI insights')
        console.error('AI insights error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAIInsights()
  }, [getActiveFilters])

  const generateNewInsight = async () => {
    try {
      setGeneratingInsight(true)
      const filters = getActiveFilters()
      
      // Simulate AI insight generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'recommendation',
        title: 'Dynamic Pricing Opportunity',
        description: 'AI analysis suggests implementing dynamic pricing for premium products could increase margins by 8-12% without affecting demand.',
        confidence: 0.78,
        impact: 'high',
        category: 'Pricing',
        actionable: true,
        timestamp: new Date().toISOString()
      }
      
      setInsights(prev => [newInsight, ...prev])
    } catch (err) {
      console.error('Failed to generate insight:', err)
    } finally {
      setGeneratingInsight(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp
      case 'anomaly': return AlertTriangle
      case 'recommendation': return Target
      case 'forecast': return BarChart3
      case 'opportunity': return Zap
      default: return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'anomaly': return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'recommendation': return 'bg-green-100 text-green-600 border-green-200'
      case 'forecast': return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'opportunity': return 'bg-yellow-100 text-yellow-600 border-yellow-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = ['all', ...Array.from(new Set(insights.map(i => i.category)))]
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(i => i.category === selectedCategory)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-500">Loading AI insights...</p>
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
            <Bot className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load AI insights</h3>
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
              <Bot className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <Button
                onClick={generateNewInsight}
                disabled={generatingInsight}
                size="sm"
                className="flex items-center space-x-2"
              >
                {generatingInsight ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span>{generatingInsight ? 'Generating...' : 'Generate Insight'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* AI Models Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Predictive Models</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((model, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{model.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {model.accuracy}% accuracy
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.confidence * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">{model.prediction}</p>
                  <p className="text-xs text-gray-500">{model.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => {
            const IconComponent = getInsightIcon(insight.type)
            const colorClasses = getInsightColor(insight.type)
            const impactColor = getImpactColor(insight.impact)
            
            return (
              <div key={insight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClasses}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {insight.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.type}
                          </Badge>
                          <Badge className={`text-xs ${impactColor}`}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {insight.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(insight.confidence * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">confidence</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Generated {new Date(insight.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Insights Summary</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {insights.length}
              </div>
              <div className="text-sm text-gray-600">Total Insights</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-sm text-gray-600">Actionable</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Impact</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* AI Chat Integration */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ask Scout AI</h3>
              <p className="text-sm text-gray-600">Get personalized insights about your data</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Ask me anything about your business data..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>
              <Bot className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AIInsights