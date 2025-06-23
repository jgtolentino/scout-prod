import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { HealthStatus } from '@/types'

export const DeploymentStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    platform: 'unknown',
    apiUrl: 'unknown'
  })

  useEffect(() => {
    const checkHealth = async () => {
      const result = await apiService.healthCheck()
      setHealth(result)
    }

    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'bg-green-500'
      case 'unhealthy': return 'bg-red-500'
      case 'checking': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className={`${getStatusColor()} text-white`}>
          {health.platform} • {health.status}
        </Badge>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-3 bg-white border rounded-lg shadow-lg max-w-xs">
      <div className="text-sm font-medium mb-2">Deployment Status</div>
      <div className="space-y-1 text-xs">
        <div>Platform: <Badge variant="outline">{health.platform}</Badge></div>
        <div>Status: <Badge className={getStatusColor() + ' text-white'}>{health.status}</Badge></div>
        <div>API: <code className="text-xs bg-gray-100 px-1 rounded">{health.apiUrl}</code></div>
        {health.error && (
          <div className="text-red-600">Error: {health.error.message}</div>
        )}
      </div>
    </div>
  )
}