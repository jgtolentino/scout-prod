import React, { useEffect, useState } from 'react'
import { apiService } from '../services/api'
import { Badge } from './ui/badge'

interface ServiceStatus {
  platform: string;
  apiUrl: string;
  useMockFallback: boolean;
  useDataLake: boolean;
  currentDataSource: string;
  consecutiveFailures: number;
  azureConnected: boolean;
  dataLakeConnected: boolean;
  features: any;
}

interface HealthData {
  status: string;
  timestamp: string;
  platform?: string;
  apiUrl?: string;
  services?: {
    database: string;
    api: string;
    cache: string;
  };
}

interface APIResponse<T> {
  status: number;
  data: T;
  message?: string;
}

export const DeploymentStatus: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Get health check from API
        const healthResponse: APIResponse<HealthData> = await apiService.healthCheck()
        setHealthData(healthResponse.data)
        
        // Get service status from API service
        const status = apiService.getServiceStatus()
        setServiceStatus(status)
        
        setLastChecked(new Date())
      } catch (error) {
        console.warn('🔄 Scout-Prod: Health check failed', error)
        // Set fallback status
        setHealthData({
          status: 'mock-fallback',
          timestamp: new Date().toISOString(),
          platform: 'unknown',
          apiUrl: 'unknown',
          services: {
            database: 'error',
            api: 'error',
            cache: 'error'
          }
        })
      }
    }

    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleReconnect = async () => {
    setIsReconnecting(true)
    try {
      const success = await apiService.reconnectToAzure()
      if (success) {
        // Refresh status immediately
        const healthResponse: APIResponse<HealthData> = await apiService.healthCheck()
        setHealthData(healthResponse.data)
        const status = apiService.getServiceStatus()
        setServiceStatus(status)
      }
    } catch (error) {
      console.warn('🔄 Scout-Prod: Manual reconnection failed', error)
    } finally {
      setIsReconnecting(false)
    }
  }

  const getStatusInfo = () => {
    if (!healthData || !serviceStatus) {
      return {
        status: 'checking',
        color: 'bg-yellow-500',
        text: 'Checking...',
        description: 'Initializing connection'
      }
    }

    // Azure API connected
    if (healthData.status === 'azure-connected' && serviceStatus.azureConnected) {
      return {
        status: 'azure',
        color: 'bg-blue-500',
        text: 'Azure API',
        description: 'Real-time data from Azure API'
      }
    }

    // Data Lake connected
    if (healthData.status === 'data-lake-connected' && serviceStatus.dataLakeConnected) {
      return {
        status: 'datalake',
        color: 'bg-green-500',
        text: 'Data Lake',
        description: 'Real data from Azure Blob Storage'
      }
    }

    // Mock fallback
    if (healthData.status === 'mock-fallback' || serviceStatus.useMockFallback) {
      return {
        status: 'mock',
        color: 'bg-orange-500',
        text: 'Mock Data',
        description: 'Using fallback data (Azure unavailable)'
      }
    }

    return {
      status: 'unknown',
      color: 'bg-gray-500',
      text: 'Unknown',
      description: 'Status unclear'
    }
  }

  const statusInfo = getStatusInfo()

  // Production mode - minimal badge
  if (import.meta.env.PROD) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className={`${statusInfo.color} text-white border-0`}>
          {serviceStatus?.platform || 'scout-prod'} • {statusInfo.text}
        </Badge>
      </div>
    )
  }

  // Development mode - detailed panel
  return (
    <div className="fixed bottom-4 right-4 z-50 p-3 bg-white border rounded-lg shadow-lg max-w-sm text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Scout-Prod Status</div>
        {serviceStatus?.useMockFallback && (
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isReconnecting ? '🔄' : '🔗'} Reconnect
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Data Source:</span>
          <Badge className={`${statusInfo.color} text-white text-xs`}>
            {statusInfo.text}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Platform:</span>
          <Badge variant="outline" className="text-xs">
            {serviceStatus?.platform || 'unknown'}
          </Badge>
        </div>

        {healthData?.services && (
          <div className="pt-1 border-t">
            <div className="text-xs text-gray-600 mb-1">Services:</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div>DB</div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  healthData.services.database === 'azure-sql' ? 'bg-blue-500' :
                  healthData.services.database === 'azure-blob-storage' ? 'bg-green-500' :
                  healthData.services.database === 'mock' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="text-center">
                <div>API</div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  healthData.services.api === 'azure-singleton' ? 'bg-blue-500' :
                  healthData.services.api === 'direct-csv-access' ? 'bg-green-500' :
                  healthData.services.api === 'mock' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="text-center">
                <div>Cache</div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  healthData.services.cache === 'azure-redis' ? 'bg-blue-500' :
                  healthData.services.cache === 'in-memory' ? 'bg-green-500' :
                  healthData.services.cache === 'mock' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
              </div>
            </div>
          </div>
        )}

        {serviceStatus && (
          <div className="pt-1 border-t">
            <div className="text-xs text-gray-600 mb-1">Data Source:</div>
            <div className="text-xs">
              <Badge variant="outline" className={`text-xs ${
                serviceStatus.currentDataSource === 'azure-api' ? 'border-blue-500 text-blue-700' :
                serviceStatus.currentDataSource === 'data-lake' ? 'border-green-500 text-green-700' :
                'border-orange-500 text-orange-700'
              }`}>
                {serviceStatus.currentDataSource.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {serviceStatus?.consecutiveFailures > 0 && (
          <div className="text-orange-600">
            Failures: {serviceStatus.consecutiveFailures}
          </div>
        )}

        {lastChecked && (
          <div className="text-gray-500 text-xs">
            Updated: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}