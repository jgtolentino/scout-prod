// Hybrid API Service - Real Azure API with Data Lake and Mock Fallback for Scout-Prod
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, detectPlatform, getPlatformConfig } from '../config/api';
import { KPIData } from '../types/index';
import dataLakeService from './dataLakeService';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ProductData {
  category: string;
  subcategory: string;
  revenue: number;
  units: number;
  growth: number;
}

interface APIResponse<T> {
  status: number;
  data: T;
  message?: string;
}

interface HealthStatus {
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

interface FilterCounts {
  geography: {
    [key: string]: number;
  };
  organization: {
    [key: string]: number;
  };
}

// Mock data fallback (original scout-prod data)
const mockFilterOptions: Record<string, FilterOption[]> = {
  holding_company: [
    { value: 'all', label: 'All Companies', count: 1250 },
    { value: 'company-a', label: 'Company A', count: 420 },
    { value: 'company-b', label: 'Company B', count: 380 },
    { value: 'company-c', label: 'Company C', count: 450 }
  ],
  region: [
    { value: 'all', label: 'All Regions', count: 1250 },
    { value: 'ncr', label: 'National Capital Region', count: 520 },
    { value: 'region-1', label: 'Region I - Ilocos', count: 380 },
    { value: 'region-3', label: 'Region III - Central Luzon', count: 350 }
  ],
  city: [
    { value: 'all', label: 'All Cities', count: 1250 },
    { value: 'manila', label: 'Manila', count: 450 },
    { value: 'quezon-city', label: 'Quezon City', count: 400 },
    { value: 'caloocan', label: 'Caloocan', count: 400 }
  ],
  brand: [
    { value: 'all', label: 'All Brands', count: 1250 },
    { value: 'brand-x', label: 'Brand X', count: 450 },
    { value: 'brand-y', label: 'Brand Y', count: 400 },
    { value: 'brand-z', label: 'Brand Z', count: 400 }
  ],
  category: [
    { value: 'all', label: 'All Categories', count: 1250 },
    { value: 'fmcg', label: 'FMCG', count: 520 },
    { value: 'beverages', label: 'Beverages', count: 380 },
    { value: 'personal-care', label: 'Personal Care', count: 350 }
  ]
};

const mockProductData: ProductData[] = [
  { category: 'FMCG', subcategory: 'Instant Noodles', revenue: 2500000, units: 12500, growth: 15.2 },
  { category: 'FMCG', subcategory: 'Rice Products', revenue: 1800000, units: 3600, growth: 8.7 },
  { category: 'FMCG', subcategory: 'Cooking Oil', revenue: 950000, units: 4750, growth: -2.1 },
  { category: 'Beverages', subcategory: 'Soft Drinks', revenue: 1200000, units: 24000, growth: 12.3 },
  { category: 'Beverages', subcategory: 'Energy Drinks', revenue: 800000, units: 8000, growth: 5.6 },
  { category: 'Personal Care', subcategory: 'Shampoo', revenue: 1500000, units: 2500, growth: 18.9 },
  { category: 'Personal Care', subcategory: 'Soap', revenue: 2200000, units: 5500, growth: 22.1 }
];

const mockKPIData: KPIData = {
  total_sales: 10950000,
  transaction_count: 60850,
  avg_basket_size: 179.95,
  growth_rate: 11.5
};

const mockHealthStatus: HealthStatus = {
  status: 'mock-fallback',
  timestamp: new Date().toISOString(),
  services: {
    database: 'mock',
    api: 'mock',
    cache: 'mock'
  }
};

const mockFilterCounts: FilterCounts = {
  geography: {
    'region': 4,
    'city': 15,
    'municipality': 45,
    'barangay': 180
  },
  organization: {
    'holding_company': 4,
    'client': 12,
    'category': 8,
    'brand': 25,
    'sku': 150
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class HybridScoutProdApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Longer timeout for scout-prod
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private platformConfig = getPlatformConfig();
  private useMockFallback = false;
  private useDataLake = false;
  private consecutiveFailures = 0;
  private maxFailures = 3;
  private dataSourcePriority = ['azure-api', 'data-lake', 'mock']; // Fallback order

  constructor() {
    this.setupInterceptors();
    this.detectBestDataSource();
    console.log(`🔗 Scout-Prod Hybrid API initialized:`, {
      platform: this.platformConfig.platform,
      apiUrl: this.platformConfig.apiUrl,
      features: 'Azure API + Data Lake + Mock Fallback'
    });
  }

  // Detect the best available data source
  private async detectBestDataSource() {
    try {
      // Test data lake connection first
      const dataLakeStatus = await dataLakeService.getConnectionStatus();
      if (dataLakeStatus.status === 'data-lake-connected') {
        this.useDataLake = true;
        console.log('📊 Data Lake detected and available');
      }
    } catch (error) {
      console.log('📊 Data Lake not available, will use API fallback');
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Client-Platform'] = this.platformConfig.platform;
        config.headers['X-Client-App'] = 'scout-prod';
        config.headers['X-Client-Environment'] = import.meta.env.MODE;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with intelligent fallback
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Reset failure count on successful response
        this.consecutiveFailures = 0;
        this.useMockFallback = false;
        return response;
      },
      (error) => {
        this.consecutiveFailures++;
        
        const enhancedError = {
          message: error.response?.data?.error || error.message || 'Request failed',
          status: error.response?.status,
          platform: this.platformConfig.platform,
          apiUrl: this.platformConfig.apiUrl,
          consecutiveFailures: this.consecutiveFailures,
          shouldUseMockFallback: this.consecutiveFailures >= this.maxFailures || 
                                error.code === 'ECONNREFUSED' || 
                                error.response?.status >= 500
        };
        
        console.warn('🚨 Scout-Prod API Error:', enhancedError);
        
        // Enable mock fallback after repeated failures
        if (enhancedError.shouldUseMockFallback) {
          console.log('🔄 Scout-Prod: Enabling mock fallback mode');
          this.useMockFallback = true;
        }
        
        return Promise.reject(enhancedError);
      }
    );
  }

  // Health check with Azure API + Data Lake integration
  async healthCheck(): Promise<APIResponse<HealthStatus>> {
    // Try Azure API first
    try {
      const response = await this.client.get('/health');
      
      return {
        status: 200,
        data: {
          status: 'azure-connected',
          timestamp: new Date().toISOString(),
          platform: this.platformConfig.platform,
          apiUrl: this.platformConfig.apiUrl,
          services: response.data.services || {
            database: 'azure-sql',
            api: 'azure-singleton',
            cache: 'azure-redis'
          }
        }
      };
    } catch (apiError) {
      console.warn('❌ Scout-Prod: Azure API health check failed, trying data lake');
      
      // Try Data Lake as fallback
      if (this.useDataLake) {
        try {
          const dataLakeStatus = await dataLakeService.getConnectionStatus();
          if (dataLakeStatus.status === 'data-lake-connected') {
            return {
              status: 200,
              data: {
                status: 'data-lake-connected',
                timestamp: new Date().toISOString(),
                platform: this.platformConfig.platform,
                apiUrl: 'azure-blob-storage',
                services: dataLakeStatus.services
              }
            };
          }
        } catch (dataLakeError) {
          console.warn('❌ Scout-Prod: Data Lake also failed');
        }
      }
      
      // Fall back to mock
      console.log('🔄 Scout-Prod: Using mock fallback');
      this.useMockFallback = true;
      
      await delay(200);
      return {
        status: 200,
        data: mockHealthStatus
      };
    }
  }

  // Overview data with Azure API + Data Lake integration
  async getOverviewData(params: Record<string, string> = {}): Promise<APIResponse<KPIData>> {
    // Try Azure API first
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/overview?${queryParams}`);
      return response.data;
    } catch (apiError) {
      console.warn('🔄 Scout-Prod: Azure API failed for overview data, trying data lake');
      
      // Try Data Lake as fallback
      if (this.useDataLake) {
        try {
          const kpiData = await dataLakeService.calculateKPIMetrics();
          console.log('📊 Retrieved KPI data from Data Lake');
          return {
            status: 200,
            data: kpiData
          };
        } catch (dataLakeError) {
          console.warn('❌ Scout-Prod: Data Lake failed for overview data');
        }
      }
      
      // Final fallback to mock data
      console.log('🔄 Scout-Prod: Using mock overview data');
      this.useMockFallback = true;
      
      await delay(400);
      return {
        status: 200,
        data: mockKPIData
      };
    }
  }

  // Filter options with Azure integration
  async getFilterOptions(filterType: string): Promise<APIResponse<{ options: FilterOption[] }>> {
    if (this.useMockFallback) {
      await delay(300);
      const options = mockFilterOptions[filterType] || [];
      return {
        status: 200,
        data: { options }
      };
    }

    try {
      const response = await this.client.get(`/api/v1/filters/options/${filterType}`);
      return response.data;
    } catch (error) {
      console.warn(`🔄 Scout-Prod: Filter options fallback for ${filterType}`);
      this.useMockFallback = true;
      
      await delay(300);
      const options = mockFilterOptions[filterType] || [];
      return {
        status: 200,
        data: { options }
      };
    }
  }

  // Filter counts
  async getFilterCounts(params: Record<string, string> = {}): Promise<APIResponse<FilterCounts>> {
    if (this.useMockFallback) {
      await delay(250);
      return {
        status: 200,
        data: mockFilterCounts
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/filters/counts?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Scout-Prod: Filter counts fallback');
      this.useMockFallback = true;
      
      await delay(250);
      return {
        status: 200,
        data: mockFilterCounts
      };
    }
  }

  // Product data
  async getProductData(params: Record<string, string>): Promise<APIResponse<ProductData[]>> {
    if (this.useMockFallback) {
      await delay(500);
      
      // Apply basic filtering to mock data
      let filteredData = [...mockProductData];
      
      if (params.category && params.category !== 'all') {
        filteredData = filteredData.filter(item => 
          item.category.toLowerCase().includes(params.category.toLowerCase())
        );
      }
      
      return {
        status: 200,
        data: filteredData
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Scout-Prod: Product data fallback');
      this.useMockFallback = true;
      return this.getProductData(params);
    }
  }

  // Alias for getOverviewData (scout-prod compatibility)
  async getKPIData(params: Record<string, string>): Promise<APIResponse<KPIData>> {
    return this.getOverviewData(params);
  }

  // Transaction trends
  async getTransactionTrends(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(600);
      return {
        status: 200,
        data: {
          trends: [
            { date: '2024-01', transactions: 15420, revenue: 2340000 },
            { date: '2024-02', transactions: 16890, revenue: 2580000 },
            { date: '2024-03', transactions: 18230, revenue: 2890000 },
            { date: '2024-04', transactions: 17650, revenue: 2720000 },
            { date: '2024-05', transactions: 19340, revenue: 3120000 },
            { date: '2024-06', transactions: 20180, revenue: 3350000 }
          ]
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/trends?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Scout-Prod: Transaction trends fallback');
      this.useMockFallback = true;
      return this.getTransactionTrends(params);
    }
  }

  // Consumer behavior
  async getConsumerBehavior(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(550);
      return {
        status: 200,
        data: {
          segments: [
            { segment: 'Premium Buyers', percentage: 25, avgSpend: 850 },
            { segment: 'Value Seekers', percentage: 40, avgSpend: 320 },
            { segment: 'Occasional Shoppers', percentage: 20, avgSpend: 180 },
            { segment: 'Frequent Buyers', percentage: 15, avgSpend: 520 }
          ],
          demographics: {
            ageGroups: [
              { range: '18-25', percentage: 22 },
              { range: '26-35', percentage: 35 },
              { range: '36-45', percentage: 28 },
              { range: '46+', percentage: 15 }
            ]
          }
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/analytics/consumer-behavior?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Scout-Prod: Consumer behavior fallback');
      this.useMockFallback = true;
      return this.getConsumerBehavior(params);
    }
  }

  // AI insights with Azure OpenAI integration
  async getAIInsights(params: Record<string, string>): Promise<APIResponse<any>> {
    if (this.useMockFallback) {
      await delay(800);
      return {
        status: 200,
        data: {
          insights: [
            {
              type: 'trend',
              title: 'Rising Demand in FMCG',
              description: 'FMCG category showing 15% growth, driven by essential goods demand.',
              confidence: 0.89,
              impact: 'high'
            },
            {
              type: 'opportunity',
              title: 'Personal Care Expansion',
              description: 'Personal Care category has highest growth rate at 20.5%. Consider inventory expansion.',
              confidence: 0.92,
              impact: 'medium'
            }
          ],
          recommendations: [
            'Increase marketing spend on FMCG category',
            'Expand Personal Care product line',
            'Review beverage pricing strategy'
          ]
        }
      };
    }

    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await this.client.get(`/api/v1/ai/insights?${queryParams}`);
      return response.data;
    } catch (error) {
      console.warn('🔄 Scout-Prod: AI insights fallback');
      this.useMockFallback = true;
      return this.getAIInsights(params);
    }
  }

  // Get current service status with data lake info
  getServiceStatus() {
    let currentDataSource = 'unknown';
    if (!this.useMockFallback) {
      currentDataSource = 'azure-api';
    } else if (this.useDataLake) {
      currentDataSource = 'data-lake';
    } else {
      currentDataSource = 'mock';
    }

    return {
      platform: this.platformConfig.platform,
      apiUrl: this.platformConfig.apiUrl,
      useMockFallback: this.useMockFallback,
      useDataLake: this.useDataLake,
      currentDataSource: currentDataSource,
      consecutiveFailures: this.consecutiveFailures,
      azureConnected: !this.useMockFallback && !this.useDataLake,
      dataLakeConnected: this.useDataLake,
      features: {
        ...this.platformConfig.features,
        dataLakeAccess: this.useDataLake,
        hybridFallback: true
      }
    };
  }

  // Force reconnection attempt
  async reconnectToAzure(): Promise<boolean> {
    console.log('🔄 Scout-Prod: Attempting to reconnect to Azure API...');
    this.consecutiveFailures = 0;
    this.useMockFallback = false;
    
    try {
      await this.healthCheck();
      return !this.useMockFallback;
    } catch (error) {
      console.warn('❌ Scout-Prod: Reconnection failed');
      return false;
    }
  }
}

// Create singleton instance
const hybridApiService = new HybridScoutProdApiService();

// Export both the class instance and individual methods for compatibility
export const apiService = {
  healthCheck: () => hybridApiService.healthCheck(),
  getOverviewData: (params?: Record<string, string>) => hybridApiService.getOverviewData(params || {}),
  getFilterOptions: (filterType: string) => hybridApiService.getFilterOptions(filterType),
  getFilterCounts: (params?: Record<string, string>) => hybridApiService.getFilterCounts(params || {}),
  getProductData: (params: Record<string, string>) => hybridApiService.getProductData(params),
  getKPIData: (params: Record<string, string>) => hybridApiService.getKPIData(params),
  getTransactionTrends: (params: Record<string, string>) => hybridApiService.getTransactionTrends(params),
  getConsumerBehavior: (params: Record<string, string>) => hybridApiService.getConsumerBehavior(params),
  getAIInsights: (params: Record<string, string>) => hybridApiService.getAIInsights(params),
  getServiceStatus: () => hybridApiService.getServiceStatus(),
  reconnectToAzure: () => hybridApiService.reconnectToAzure()
};

export default apiService;