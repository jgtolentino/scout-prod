import React, { useState, useRef, useEffect } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { apiService } from '@/services/api'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, Loader2, Lightbulb, TrendingUp, BarChart3, Target } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast'
  title: string
  description: string
  confidence: number
  data?: any
}

const AdsBot: React.FC = () => {
  const { getActiveFilters } = useFilterStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Scout Analytics AI assistant. I can help you analyze your data, identify trends, and provide actionable insights. What would you like to explore today?",
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load AI insights when filters change
    const loadInsights = async () => {
      try {
        setLoadingInsights(true)
        const filters = getActiveFilters()
        
        if (Object.keys(filters).length > 0) {
          const response = await apiService.getAIInsights(filters)
          if (response.status === 200 && response.data?.insights) {
            setInsights(response.data.insights)
          }
        } else {
          // Provide mock insights for demonstration
          setInsights([
            {
              type: 'trend',
              title: 'Sales Growth Trend',
              description: 'Sales have increased by 15.3% compared to the previous period, with particularly strong performance in Metro Manila.',
              confidence: 0.89
            },
            {
              type: 'recommendation',
              title: 'Inventory Optimization',
              description: 'Consider increasing stock levels for top-performing SKUs in high-traffic locations during peak hours.',
              confidence: 0.76
            },
            {
              type: 'anomaly',
              title: 'Unusual Activity Detected',
              description: 'Transaction volumes in Cebu region are 23% higher than expected for this time period.',
              confidence: 0.82
            }
          ])
        }
      } catch (error) {
        console.error('Failed to load AI insights:', error)
      } finally {
        setLoadingInsights(false)
      }
    }

    loadInsights()
  }, [getActiveFilters])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: 'Analyzing your query...',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const filters = getActiveFilters()
      const response = await apiService.chatWithAI(userMessage.content, filters)
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading)
        const botResponse: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: response.data?.message || response.message || "I apologize, but I'm having trouble processing your request right now. Please try again.",
          timestamp: new Date(),
        }
        return [...filteredMessages, botResponse]
      })
    } catch (error: any) {
      // Remove loading message and add error response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading)
        const errorResponse: ChatMessage = {
          id: Date.now().toString(),
          type: 'bot',
          content: "I'm currently unable to process your request. However, I can help you analyze your current data filters and provide insights based on the visible information.",
          timestamp: new Date(),
        }
        return [...filteredMessages, errorResponse]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp
      case 'recommendation': return Target
      case 'anomaly': return BarChart3
      case 'forecast': return Lightbulb
      default: return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-600'
      case 'recommendation': return 'bg-green-100 text-green-600'
      case 'anomaly': return 'bg-orange-100 text-orange-600'
      case 'forecast': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const suggestedQuestions = [
    "What are the top performing regions?",
    "Show me sales trends by product category",
    "Which SKUs have the highest growth rate?",
    "Analyze consumer behavior patterns",
    "What time of day sees peak transactions?"
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Scout Analytics AI</h2>
              <p className="text-sm text-gray-500">Your intelligent data assistant</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 h-96">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.isLoading && (
                        <div className="flex items-center mt-2">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-xs opacity-75">Thinking...</span>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your data..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="border-l border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">AI Insights</h3>
                {loadingInsights && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const IconComponent = getInsightIcon(insight.type)
                  const colorClasses = getInsightColor(insight.type)
                  
                  return (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {insight.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${insight.confidence * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-xs text-gray-500">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {insights.length === 0 && !loadingInsights && (
                <div className="text-center py-8">
                  <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Apply filters to see AI insights
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AdsBot