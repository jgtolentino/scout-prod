// AI-Powered Recommendations Panel for Transaction Insights
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, Target, RefreshCw, Brain, ChevronRight } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'insight';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionItems: string[];
  metrics?: {
    currentValue: number;
    projectedValue: number;
    timeframe: string;
  };
}

interface AIRecommendationPanelProps {
  data: Array<{ [key: string]: any }>;
  activeFilters: Record<string, any>;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  className?: string;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  data,
  activeFilters,
  onRecommendationClick,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate AI recommendations based on data patterns
  useEffect(() => {
    generateRecommendations();
  }, [data, activeFilters]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      // Simulate AI analysis with intelligent recommendations based on data patterns
      const analysisResults = analyzeTransactionPatterns(data, activeFilters);
      setRecommendations(analysisResults);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTransactionPatterns = (data: any[], filters: Record<string, any>): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Analyze transaction volume patterns
    if (data.length > 0) {
      const avgTransactionValue = data.reduce((sum, item) => sum + (item.total_sales || 0), 0) / data.length;
      const recentTransactions = data.slice(-7);
      const recentAvg = recentTransactions.reduce((sum, item) => sum + (item.total_sales || 0), 0) / recentTransactions.length;

      // Trend analysis
      if (recentAvg > avgTransactionValue * 1.15) {
        recommendations.push({
          id: 'growth-trend',
          type: 'opportunity',
          priority: 'high',
          title: 'Strong Growth Trend Detected',
          description: 'Transaction values have increased by 15% in recent periods. This indicates positive momentum.',
          impact: 'Revenue growth opportunity of ₱' + ((recentAvg - avgTransactionValue) * 30).toLocaleString(),
          confidence: 87,
          actionItems: [
            'Increase inventory for high-performing products',
            'Extend promotional campaigns in growing segments',
            'Analyze successful tactics for replication'
          ],
          metrics: {
            currentValue: avgTransactionValue,
            projectedValue: recentAvg * 1.1,
            timeframe: '30 days'
          }
        });
      }

      // Peak time optimization
      const hourlyData = data.filter(item => item.period === 'hourly');
      if (hourlyData.length > 0) {
        const peakHours = identifyPeakHours(hourlyData);
        recommendations.push({
          id: 'peak-optimization',
          type: 'optimization',
          priority: 'medium',
          title: 'Peak Hour Optimization Opportunity',
          description: `Peak sales occur during ${peakHours.join(', ')}. Optimize staffing and inventory for these periods.`,
          impact: 'Potential 8-12% efficiency improvement',
          confidence: 92,
          actionItems: [
            'Schedule additional staff during peak hours',
            'Pre-position inventory before peak periods',
            'Implement dynamic pricing during high-demand times'
          ]
        });
      }

      // Low-performing period analysis
      if (recentAvg < avgTransactionValue * 0.85) {
        recommendations.push({
          id: 'performance-alert',
          type: 'risk',
          priority: 'high',
          title: 'Declining Performance Alert',
          description: 'Recent transaction performance is 15% below average. Immediate attention required.',
          impact: 'Potential revenue loss: ₱' + ((avgTransactionValue - recentAvg) * 30).toLocaleString(),
          confidence: 94,
          actionItems: [
            'Review and adjust pricing strategy',
            'Launch targeted promotional campaigns',
            'Analyze competitor activities',
            'Survey customer satisfaction'
          ],
          metrics: {
            currentValue: recentAvg,
            projectedValue: avgTransactionValue,
            timeframe: '14 days'
          }
        });
      }

      // Seasonal insights
      const currentMonth = new Date().getMonth();
      recommendations.push({
        id: 'seasonal-insight',
        type: 'insight',
        priority: 'medium',
        title: 'Seasonal Pattern Analysis',
        description: getSeasonalInsight(currentMonth),
        impact: 'Strategic planning advantage',
        confidence: 78,
        actionItems: [
          'Prepare seasonal inventory adjustments',
          'Plan targeted marketing campaigns',
          'Review historical seasonal performance'
        ]
      });

      // Category performance analysis
      if (filters.category && filters.category !== 'all') {
        recommendations.push({
          id: 'category-focus',
          type: 'opportunity',
          priority: 'medium',
          title: `${filters.category} Category Insights`,
          description: `Focused analysis on ${filters.category} reveals specific optimization opportunities.`,
          impact: 'Category-specific growth potential',
          confidence: 83,
          actionItems: [
            'Expand product variety in this category',
            'Optimize pricing for category products',
            'Cross-sell complementary items'
          ]
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const identifyPeakHours = (hourlyData: any[]): string[] => {
    const avgValue = hourlyData.reduce((sum, item) => sum + (item.total_sales || 0), 0) / hourlyData.length;
    return hourlyData
      .filter(item => (item.total_sales || 0) > avgValue * 1.2)
      .map(item => new Date(item.timestamp).getHours() + ':00')
      .slice(0, 3);
  };

  const getSeasonalInsight = (month: number): string => {
    const seasonalInsights = {
      0: 'January typically shows post-holiday recovery patterns. Focus on new customer acquisition.',
      1: 'February is ideal for Valentine\'s promotions and loyalty program launches.',
      2: 'March shows spring shopping trends. Prepare for seasonal product transitions.',
      3: 'April begins summer preparation phase. Adjust inventory accordingly.',
      4: 'May shows Mother\'s Day impact and summer preparation trends.',
      5: 'June starts peak summer season with increased beverage and cooling product demand.',
      6: 'July shows mid-summer patterns with vacation-related shopping behaviors.',
      7: 'August indicates back-to-school preparation affecting multiple categories.',
      8: 'September shows strong back-to-school and autumn preparation trends.',
      9: 'October begins holiday season preparation with Halloween impact.',
      10: 'November shows pre-Christmas shopping acceleration and Black Friday patterns.',
      11: 'December peaks with Christmas shopping and year-end consumer behavior.'
    };
    return seasonalInsights[month as keyof typeof seasonalInsights] || 'Seasonal patterns analysis available.';
  };

  const getIconByType = (type: Recommendation['type']) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'optimization': return <Target className="w-4 h-4 text-blue-600" />;
      case 'insight': return <Lightbulb className="w-4 h-4 text-purple-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBadgeColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'opportunity': return 'border-l-green-500 bg-green-50';
      case 'risk': return 'border-l-red-500 bg-red-50';
      case 'optimization': return 'border-l-blue-500 bg-blue-50';
      case 'insight': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>AI Recommendations</span>
            <Badge variant="secondary" className="text-xs">
              {recommendations.length} insights
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Brain className="w-8 h-8 animate-pulse mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-500">Analyzing patterns...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`border-l-4 p-4 rounded-r-lg transition-all cursor-pointer hover:shadow-md ${getTypeColor(recommendation.type)}`}
                onClick={() => {
                  setExpandedId(expandedId === recommendation.id ? null : recommendation.id);
                  onRecommendationClick?.(recommendation);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getIconByType(recommendation.type)}
                      <h4 className="font-medium text-sm text-gray-900">{recommendation.title}</h4>
                      <Badge className={`text-xs ${getBadgeColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span>{recommendation.confidence}% confidence</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
                    <p className="text-xs font-medium text-blue-600">{recommendation.impact}</p>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedId === recommendation.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>

                {expandedId === recommendation.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Action Items:</h5>
                        <ul className="space-y-1">
                          {recommendation.actionItems.map((action, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {recommendation.metrics && (
                        <div className="bg-white p-3 rounded border">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Projected Impact:</h5>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <div className="text-gray-500">Current</div>
                              <div className="font-medium">₱{recommendation.metrics.currentValue.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Projected</div>
                              <div className="font-medium text-green-600">₱{recommendation.metrics.projectedValue.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Timeframe</div>
                              <div className="font-medium">{recommendation.metrics.timeframe}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm text-gray-500">No recommendations available</p>
                <p className="text-xs text-gray-400">Analyze more data to generate insights</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};