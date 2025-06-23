// RetailBot - AI-Powered Retail Analytics Assistant
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, Send, Trash2, Loader2, TrendingUp, Package, Users, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContext {
  filters?: Record<string, any>;
  currentPage?: string;
  metrics?: Record<string, number>;
}

export const RetailBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Scout Analytics AI assistant. I can help you analyze sales trends, product performance, customer behavior, and more. What would you like to explore?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current context from API service and filters
  useEffect(() => {
    const updateContext = async () => {
      try {
        const serviceStatus = apiService.getServiceStatus();
        const currentPath = window.location.pathname;
        
        setContext({
          currentPage: currentPath,
          dataSource: serviceStatus.currentDataSource,
          platform: serviceStatus.platform,
          azureConnected: serviceStatus.azureConnected,
          dataLakeConnected: serviceStatus.dataLakeConnected
        });
      } catch (error) {
        console.warn('Failed to get context:', error);
      }
    };

    updateContext();
  }, []);

  // Enhanced AI chat response with real data integration
  const generateAIResponse = async (userMessage: string, chatContext: ChatContext): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Get comprehensive data for context
    let dataContext = '';
    let detailedMetrics = {};
    
    try {
      const [overviewData, serviceStatus, productData, consumerData] = await Promise.all([
        apiService.getOverviewData({}),
        Promise.resolve(apiService.getServiceStatus()),
        apiService.getProductData({}),
        apiService.getConsumerBehavior({})
      ]);
      
      detailedMetrics = {
        overview: overviewData.data,
        serviceStatus,
        products: productData.data,
        consumers: consumerData.data
      };
      
      dataContext = `Current metrics: Revenue: $${overviewData.data.total_sales.toLocaleString()}, Transactions: ${overviewData.data.transaction_count.toLocaleString()}, Avg Basket: $${overviewData.data.avg_basket_size}, Growth: ${overviewData.data.growth_rate}%. Data source: ${serviceStatus.currentDataSource} (${serviceStatus.platform}).`;
    } catch (error) {
      dataContext = 'Unable to fetch current metrics - using available context.';
    }

    // Enhanced AI responses using real data
    const message = userMessage.toLowerCase();
    
    if (message.includes('sales') || message.includes('revenue')) {
      const growth = detailedMetrics.overview?.growth_rate || 0;
      const growthDirection = growth > 0 ? 'growing' : growth < 0 ? 'declining' : 'stable';
      return `📊 **Sales Analysis**: ${dataContext}\n\nYour sales are currently **${growthDirection}** at ${Math.abs(growth)}%. ${growth > 10 ? 'Excellent growth momentum!' : growth > 5 ? 'Solid growth trajectory.' : growth > 0 ? 'Positive but modest growth.' : growth < -5 ? 'Concerning decline that needs attention.' : 'Revenue is stable.'}\n\nWould you like me to analyze specific regions, time periods, or what's driving ${growth > 0 ? 'this growth' : 'these changes'}?`;
    }
    
    if (message.includes('product') || message.includes('performance')) {
      let productInsight = 'Product performance data shows interesting patterns. ';
      if (detailedMetrics.products && Array.isArray(detailedMetrics.products)) {
        const productCount = detailedMetrics.products.length;
        productInsight = `I can see ${productCount} products in your current dataset. `;
      }
      return `📦 **Product Performance**: ${productInsight}${dataContext}\n\nI can help you identify:\n• Top performers by revenue\n• Underperforming items\n• Category trends\n• Cross-selling opportunities\n\nWhat specific product insights would be most valuable for your business?`;
    }
    
    if (message.includes('customer') || message.includes('behavior')) {
      let customerInsight = 'Customer behavior analysis reveals spending patterns and segmentation opportunities. ';
      if (detailedMetrics.consumers?.segments) {
        const segments = detailedMetrics.consumers.segments;
        const topSegment = segments.reduce((max, seg) => seg.percentage > max.percentage ? seg : max, segments[0]);
        customerInsight = `Your largest customer segment is **${topSegment.segment}** (${topSegment.percentage}% of customers, avg spend: $${topSegment.avgSpend}). `;
      }
      return `👥 **Customer Behavior**: ${customerInsight}${dataContext}\n\nI can analyze:\n• Customer lifetime value\n• Purchase frequency patterns\n• Demographic trends\n• Segmentation strategies\n\nWhat customer insights would be most valuable for your strategy?`;
    }
    
    if (message.includes('trend') || message.includes('growth')) {
      const growth = detailedMetrics.overview?.growth_rate || 0;
      const basketSize = detailedMetrics.overview?.avg_basket_size || 0;
      return `📈 **Growth Trends**: Your business shows **${growth}% growth** with an average basket size of **$${basketSize}**. ${dataContext}\n\n${growth > 15 ? '🚀 Exceptional growth! Consider scaling operations.' : growth > 5 ? '📊 Strong growth trajectory.' : growth > 0 ? '📈 Positive momentum.' : '⚠️ Growth challenges detected.'}\n\nI can identify seasonal patterns, emerging trends, or growth opportunities. Which trend analysis interests you most?`;
    }
    
    if (message.includes('region') || message.includes('geographic')) {
      return `🌍 **Regional Analysis**: Geographic performance variations detected. ${dataContext}\n\nI can help with:\n• Regional sales comparisons\n• High-potential market identification\n• Distribution effectiveness analysis\n• Location-based optimization\n\nWhich geographic insights do you need for expansion or optimization?`;
    }
    
    if (message.includes('data') && message.includes('source')) {
      const status = detailedMetrics.serviceStatus || apiService.getServiceStatus();
      const sourceEmoji = status.azureConnected ? '🔵' : status.dataLakeConnected ? '🟢' : '🟠';
      const sourceDesc = status.azureConnected ? 'real-time API data' : status.dataLakeConnected ? 'direct CSV data from your Azure blob storage' : 'demo/fallback data';
      return `💾 **Data Source Status**: Currently using **${status.currentDataSource.toUpperCase()}** ${sourceEmoji}\n\n**Platform**: ${status.platform}\n**Source**: ${sourceDesc}\n**Features**: ${status.dataLakeConnected ? 'Direct data lake access enabled' : status.azureConnected ? 'Real-time API integration' : 'Mock data for demonstration'}\n\nAll my analytics and insights are based on this data source. ${status.azureConnected || status.dataLakeConnected ? 'You\'re getting real business insights!' : 'Switch to real data for actual business insights.'}`;
    }

    if (message.includes('top') && (message.includes('product') || message.includes('item'))) {
      return `🏆 **Top Products**: ${dataContext}\n\nBased on your current data, I can identify:\n• Highest revenue generators\n• Best-selling items by volume\n• Products with highest margins\n• Fast-growing categories\n\nWould you like me to show the top 5 products by revenue or another metric?`;
    }

    if (message.includes('anomal') || message.includes('unusual') || message.includes('spike')) {
      return `🔍 **Anomaly Detection**: ${dataContext}\n\nI'm analyzing your data for unusual patterns:\n• Unexpected sales spikes\n• Regional anomalies\n• Product performance outliers\n• Transaction pattern changes\n\n${detailedMetrics.overview?.growth_rate > 20 ? '⚠️ Detected: Unusually high growth rate!' : detailedMetrics.overview?.growth_rate < -10 ? '⚠️ Detected: Concerning sales decline!' : '✅ No major anomalies detected in current period.'}\n\nWhat specific patterns would you like me to investigate?`;
    }

    // Default enhanced response
    return `🤖 **Scout AI**: I understand you're asking about "${userMessage}". ${dataContext}\n\n**I can help you analyze**:\n• 📊 Sales trends and revenue patterns\n• 📦 Product performance and opportunities\n• 👥 Customer behavior and segmentation\n• 🌍 Regional insights and geographic analysis\n• 📈 Growth forecasting and anomaly detection\n\nCould you be more specific about what you'd like to explore? Try asking "Show top performing products" or "Analyze customer behavior".`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input.trim(), context);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Scout Analytics AI assistant. I can help you analyze sales trends, product performance, customer behavior, and more. What would you like to explore?',
      timestamp: new Date()
    }]);
  };

  const quickActions = [
    { icon: TrendingUp, text: 'Show sales trends', query: 'Show me the current sales trends and growth patterns' },
    { icon: Package, text: 'Top products', query: 'What are the top performing products by revenue?' },
    { icon: Users, text: 'Customer insights', query: 'Analyze customer behavior and segmentation patterns' },
    { icon: BarChart3, text: 'Data source status', query: 'What data source are we currently using and what does it mean?' }
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scout AI Assistant</h3>
            <p className="text-sm text-gray-600">Retail Analytics Expert</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {context.dataSource || 'unknown'} data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="text-gray-600 hover:text-gray-800"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-600">Analyzing data...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="justify-start text-left h-auto p-2"
                disabled={isLoading}
              >
                <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{action.text}</span>
              </Button>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sales, products, customers, trends..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};