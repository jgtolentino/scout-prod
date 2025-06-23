import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { DeploymentStatus } from '@/components/DeploymentStatus'
import { Analytics } from '@/components/Analytics'
import Overview from '@/pages/Overview'
import TransactionTrends from '@/pages/TransactionTrends'
import ProductMix from '@/pages/ProductMix'
import ConsumerBehavior from '@/pages/ConsumerBehavior'
import AIInsights from '@/pages/AIInsights'
import { BarChart3, TrendingUp, Package, Users, Bot, Home } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Transaction Trends', href: '/trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/product-mix', icon: Package },
  { name: 'Consumer Behavior', href: '/consumer-behavior', icon: Users },
  { name: 'AI Insights', href: '/ai-insights', icon: Bot },
]

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">Scout Analytics</h1>
                        <p className="text-xs text-gray-500">Data-Driven Insights Dashboard</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {navigation.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`
                          }
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {item.name}
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/trends" element={<TransactionTrends />} />
                  <Route path="/product-mix" element={<ProductMix />} />
                  <Route path="/consumer-behavior" element={<ConsumerBehavior />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                </Routes>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    © 2024 Scout Analytics. Built with React, TypeScript, and Tailwind CSS.
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-400">v2.0.0</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="System Status: Healthy"></div>
                  </div>
                </div>
              </div>
            </footer>

            {/* Deployment Status Component */}
            <DeploymentStatus />
            
            {/* Analytics */}
            <Analytics />
          </div>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App