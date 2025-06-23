// Mock data service to replace API calls
import { KPIData } from '../types/index';

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
}

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
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

// Mock data
const mockFilterOptions: Record<string, FilterOption[]> = {
  holding_company: [
    { value: 'all', label: 'All Companies', count: 1250 },
    { value: 'company-a', label: 'Company A', count: 420 },
    { value: 'company-b', label: 'Company B', count: 380 },
    { value: 'company-c', label: 'Company C', count: 450 }
  ],
  region: [
    { value: 'all', label: 'All Regions', count: 1250 },
    { value: 'north-america', label: 'North America', count: 520 },
    { value: 'europe', label: 'Europe', count: 380 },
    { value: 'asia-pacific', label: 'Asia Pacific', count: 350 }
  ],
  brand: [
    { value: 'all', label: 'All Brands', count: 1250 },
    { value: 'brand-x', label: 'Brand X', count: 450 },
    { value: 'brand-y', label: 'Brand Y', count: 400 },
    { value: 'brand-z', label: 'Brand Z', count: 400 }
  ],
  category: [
    { value: 'all', label: 'All Categories', count: 1250 },
    { value: 'electronics', label: 'Electronics', count: 520 },
    { value: 'clothing', label: 'Clothing', count: 380 },
    { value: 'home-garden', label: 'Home & Garden', count: 350 }
  ]
};

const mockProductData: ProductData[] = [
  { category: 'Electronics', subcategory: 'Smartphones', revenue: 2500000, units: 12500, growth: 15.2 },
  { category: 'Electronics', subcategory: 'Laptops', revenue: 1800000, units: 3600, growth: 8.7 },
  { category: 'Electronics', subcategory: 'Tablets', revenue: 950000, units: 4750, growth: -2.1 },
  { category: 'Clothing', subcategory: 'Casual Wear', revenue: 1200000, units: 24000, growth: 12.3 },
  { category: 'Clothing', subcategory: 'Formal Wear', revenue: 800000, units: 8000, growth: 5.6 },
  { category: 'Home & Garden', subcategory: 'Furniture', revenue: 1500000, units: 2500, growth: 18.9 },
  { category: 'Home & Garden', subcategory: 'Appliances', revenue: 2200000, units: 5500, growth: 22.1 }
];

const mockKPIData: KPIData = {
  total_sales: 10950000,
  transaction_count: 60850,
  avg_basket_size: 179.95,
  growth_rate: 11.5
};

const mockHealthStatus: HealthStatus = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: {
    database: 'online',
    api: 'online',
    cache: 'online'
  }
};

const mockFilterCounts: FilterCounts = {
  geography: {
    'region': 4
  },
  organization: {
    'holding_company': 4,
    'brand': 4,
    'category': 4
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  async healthCheck(): Promise<APIResponse<HealthStatus>> {
    await delay(200);
    return {
      status: 200,
      data: mockHealthStatus
    };
  },

  async getOverviewData(params: Record<string, string> = {}): Promise<APIResponse<KPIData>> {
    await delay(400);
    return {
      status: 200,
      data: mockKPIData
    };
  },

  async getFilterOptions(filterType: string): Promise<APIResponse<{ options: FilterOption[] }>> {
    await delay(300);
    const options = mockFilterOptions[filterType] || [];
    return {
      status: 200,
      data: { options }
    };
  },

  async getFilterCounts(params: Record<string, string> = {}): Promise<APIResponse<FilterCounts>> {
    await delay(250);
    return {
      status: 200,
      data: mockFilterCounts
    };
  },

  async getProductData(params: Record<string, string>): Promise<APIResponse<ProductData[]>> {
    await delay(500);
    
    // Apply basic filtering based on params
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
  },

  async getKPIData(params: Record<string, string>): Promise<APIResponse<KPIData>> {
    await delay(400);
    
    return {
      status: 200,
      data: mockKPIData
    };
  },

  async getTransactionTrends(params: Record<string, string>): Promise<APIResponse<any>> {
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
  },

  async getConsumerBehavior(params: Record<string, string>): Promise<APIResponse<any>> {
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
  },

  async getAIInsights(params: Record<string, string>): Promise<APIResponse<any>> {
    await delay(800);
    return {
      status: 200,
      data: {
        insights: [
          {
            type: 'trend',
            title: 'Rising Demand in Electronics',
            description: 'Electronics category showing 15% growth, driven by smartphone upgrades.',
            confidence: 0.89,
            impact: 'high'
          },
          {
            type: 'opportunity',
            title: 'Home & Garden Expansion',
            description: 'Home & Garden category has highest growth rate at 20.5%. Consider inventory expansion.',
            confidence: 0.92,
            impact: 'medium'
          },
          {
            type: 'warning',
            title: 'Tablet Market Decline',
            description: 'Tablet subcategory showing -2.1% growth. Review pricing strategy.',
            confidence: 0.76,
            impact: 'low'
          }
        ],
        recommendations: [
          'Increase marketing spend on Electronics category',
          'Expand Home & Garden product line',
          'Review tablet pricing and promotions'
        ]
      }
    };
  }
};

export default apiService;