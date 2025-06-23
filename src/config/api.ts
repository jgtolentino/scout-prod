// Scout-Prod API Configuration with Azure Singleton Integration

/**
 * API URL resolver with Netlify-optimized routing
 */
const getApiBaseUrl = (): string => {
  // 1. Environment variable override (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Platform-specific URL detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Netlify deployment (primary platform for scout-prod)
    if (hostname.includes('netlify.app')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Vercel deployment (backup platform)
    if (hostname.includes('vercel.app')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Azure deployment
    if (hostname.includes('azurewebsites.net') || hostname.includes('azurestaticapps.net')) {
      return 'https://scout-analytics-api.azurewebsites.net';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  
  // 3. Fallback to Azure singleton API
  return 'https://scout-analytics-api.azurewebsites.net';
};

/**
 * Detect current deployment platform
 */
const detectPlatform = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('netlify.app')) return 'netlify';
  if (hostname.includes('vercel.app')) return 'vercel';  
  if (hostname.includes('azurestaticapps.net')) return 'azure-swa';
  if (hostname.includes('azurewebsites.net')) return 'azure-app-service';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
  
  return 'unknown';
};

/**
 * Platform configuration optimized for scout-prod
 */
const getPlatformConfig = () => {
  const platform = detectPlatform();
  const isNetlify = platform === 'netlify';
  const isLocal = platform === 'local';
  
  return {
    platform,
    apiUrl: getApiBaseUrl(),
    isProduction: platform !== 'local',
    
    // Platform capabilities
    supportsAzureAPI: true, // Always try Azure API first
    supportsStaticSite: ['netlify', 'vercel', 'azure-swa'].includes(platform),
    
    // Performance configuration optimized for scout-prod
    timeout: isNetlify ? 15000 : 10000, // Longer timeout for Netlify
    retries: 3,
    retryDelay: 1000,
    
    // Feature flags
    features: {
      hybridAPI: true,
      mockFallback: true,
      realTimeData: !isLocal,
      azureIntegration: true,
      platformDetection: true,
    },
    
    // Monitoring
    analytics: {
      enabled: platform !== 'local',
      platform: platform,
      environment: import.meta.env.MODE || 'production',
    }
  };
};

// Main API configuration
const API_BASE_URL = getApiBaseUrl();

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔗 Scout-Prod API Configuration:', {
    platform: detectPlatform(),
    apiUrl: API_BASE_URL,
    environment: import.meta.env.MODE,
    hybrid: 'Azure API + Mock Fallback'
  });
}

export { 
  API_BASE_URL,
  getApiBaseUrl,
  detectPlatform,
  getPlatformConfig
};