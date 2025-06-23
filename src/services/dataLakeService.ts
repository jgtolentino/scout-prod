// Azure Data Lake Direct Query Service for Scout-Prod
// Direct access to scoutdata blob storage with CSV parsing

import axios from 'axios';
import { KPIData } from '../types/index';

interface BlobStorageConfig {
  storageAccount: string;
  containerName: string;
  sasToken?: string;
  accessKey?: string;
}

interface CSVData {
  [key: string]: string | number;
}

interface DataLakeMetrics {
  totalTransactions: number;
  totalRevenue: number;
  uniqueCustomers: number;
  avgBasketSize: number;
  growthRate: number;
}

class AzureDataLakeService {
  private config: BlobStorageConfig;
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor() {
    this.config = {
      storageAccount: 'scoutdata',
      containerName: 'raw/scout-seed',
      // These would typically come from environment variables in production
      sasToken: import.meta.env.VITE_AZURE_SAS_TOKEN,
      accessKey: import.meta.env.VITE_AZURE_STORAGE_KEY
    };
    
    this.baseUrl = `https://${this.config.storageAccount}.blob.core.windows.net/${this.config.containerName}`;
    
    console.log('🔗 Azure Data Lake Service initialized:', {
      storageAccount: this.config.storageAccount,
      container: this.config.containerName,
      hasAuth: !!(this.config.sasToken || this.config.accessKey)
    });
  }

  // Parse CSV data from blob response
  private parseCSV(csvText: string): CSVData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CSVData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVData = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number, otherwise keep as string
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      
      data.push(row);
    }
    
    return data;
  }

  // Cache management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  // Fetch CSV file from blob storage
  async fetchCSV(filename: string): Promise<CSVData[]> {
    const cacheKey = `csv_${filename}`;
    const cached = this.getFromCache<CSVData[]>(cacheKey);
    if (cached) {
      console.log(`📋 Using cached data for ${filename}`);
      return cached;
    }

    try {
      const url = `${this.baseUrl}/${filename}`;
      const headers: Record<string, string> = {
        'x-ms-version': '2020-04-08',
      };

      // Add authentication if available
      if (this.config.sasToken) {
        // SAS token is appended to URL
        const fullUrl = `${url}?${this.config.sasToken}`;
        const response = await axios.get(fullUrl, { headers });
        const data = this.parseCSV(response.data);
        this.setCache(cacheKey, data, 15); // Cache for 15 minutes
        console.log(`📄 Fetched ${filename}: ${data.length} records`);
        return data;
      } else {
        // Try public access or alternative auth
        const response = await axios.get(url, { headers });
        const data = this.parseCSV(response.data);
        this.setCache(cacheKey, data, 15);
        console.log(`📄 Fetched ${filename}: ${data.length} records`);
        return data;
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch ${filename}:`, error);
      throw new Error(`Unable to fetch ${filename} from data lake`);
    }
  }

  // Get all transaction data with joins
  async getTransactionData(): Promise<any[]> {
    try {
      const [transactions, transactionItems, customers, stores, products] = await Promise.all([
        this.fetchCSV('transactions.csv'),
        this.fetchCSV('transaction_items.csv'),
        this.fetchCSV('customers.csv'),
        this.fetchCSV('stores.csv'),
        this.fetchCSV('products.csv')
      ]);

      // Create lookup maps for faster joins
      const customerMap = new Map(customers.map(c => [c.customer_id, c]));
      const storeMap = new Map(stores.map(s => [s.store_id, s]));
      const productMap = new Map(products.map(p => [p.product_id, p]));

      // Join transaction data
      const enrichedTransactions = transactions.map(transaction => {
        const items = transactionItems.filter(item => item.transaction_id === transaction.transaction_id);
        const customer = customerMap.get(transaction.customer_id);
        const store = storeMap.get(transaction.store_id);

        return {
          ...transaction,
          customer: customer || null,
          store: store || null,
          items: items.map(item => ({
            ...item,
            product: productMap.get(item.product_id) || null
          }))
        };
      });

      console.log(`🔗 Enriched ${enrichedTransactions.length} transactions with customer, store, and product data`);
      return enrichedTransactions;
    } catch (error) {
      console.error('❌ Failed to get transaction data:', error);
      throw error;
    }
  }

  // Calculate KPI metrics from data lake
  async calculateKPIMetrics(): Promise<KPIData> {
    try {
      const transactions = await this.getTransactionData();
      
      if (transactions.length === 0) {
        throw new Error('No transaction data available');
      }

      // Calculate metrics
      const totalSales = transactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
      const transactionCount = transactions.length;
      const avgBasketSize = totalSales / transactionCount;

      // Calculate growth rate (simplified - compare recent vs older data)
      const sortedTransactions = transactions.sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );
      
      const recentTransactions = sortedTransactions.slice(0, Math.floor(sortedTransactions.length / 2));
      const olderTransactions = sortedTransactions.slice(Math.floor(sortedTransactions.length / 2));
      
      const recentRevenue = recentTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
      const olderRevenue = olderTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
      
      const growthRate = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;

      const kpiData: KPIData = {
        total_sales: Math.round(totalSales),
        transaction_count: transactionCount,
        avg_basket_size: Math.round(avgBasketSize * 100) / 100,
        growth_rate: Math.round(growthRate * 100) / 100
      };

      console.log('📊 Calculated KPI metrics from data lake:', kpiData);
      return kpiData;
    } catch (error) {
      console.error('❌ Failed to calculate KPI metrics:', error);
      throw error;
    }
  }

  // Get product performance data
  async getProductPerformance(): Promise<any[]> {
    try {
      const [transactions, transactionItems, products, brands] = await Promise.all([
        this.fetchCSV('transactions.csv'),
        this.fetchCSV('transaction_items.csv'),
        this.fetchCSV('products.csv'),
        this.fetchCSV('brands.csv')
      ]);

      const productMap = new Map(products.map(p => [p.product_id, p]));
      const brandMap = new Map(brands.map(b => [b.brand_id, b]));

      // Aggregate product performance
      const productPerformance = new Map();

      transactionItems.forEach(item => {
        const product = productMap.get(item.product_id);
        if (!product) return;

        const key = product.product_id;
        if (!productPerformance.has(key)) {
          productPerformance.set(key, {
            product_id: product.product_id,
            product_name: product.product_name,
            category: product.category,
            brand: brandMap.get(product.brand_id),
            total_revenue: 0,
            total_quantity: 0,
            transaction_count: 0
          });
        }

        const perf = productPerformance.get(key);
        perf.total_revenue += Number(item.line_total) || 0;
        perf.total_quantity += Number(item.quantity) || 0;
        perf.transaction_count += 1;
      });

      const result = Array.from(productPerformance.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 50); // Top 50 products

      console.log(`📈 Calculated performance for ${result.length} products`);
      return result;
    } catch (error) {
      console.error('❌ Failed to get product performance:', error);
      throw error;
    }
  }

  // Get customer behavior insights
  async getCustomerBehavior(): Promise<any> {
    try {
      const transactions = await this.getTransactionData();
      
      if (transactions.length === 0) {
        throw new Error('No transaction data available');
      }

      // Customer segmentation by spend
      const customerSpend = new Map();
      transactions.forEach(t => {
        const customerId = t.customer_id;
        if (!customerSpend.has(customerId)) {
          customerSpend.set(customerId, { 
            totalSpend: 0, 
            transactionCount: 0,
            customer: t.customer 
          });
        }
        const customer = customerSpend.get(customerId);
        customer.totalSpend += Number(t.total_amount) || 0;
        customer.transactionCount += 1;
      });

      const customers = Array.from(customerSpend.values());
      const avgSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length;

      // Segment customers
      const segments = {
        'Premium Buyers': customers.filter(c => c.totalSpend > avgSpend * 2).length,
        'Regular Customers': customers.filter(c => c.totalSpend > avgSpend && c.totalSpend <= avgSpend * 2).length,
        'Occasional Shoppers': customers.filter(c => c.totalSpend <= avgSpend).length
      };

      const totalCustomers = customers.length;
      const segmentData = Object.entries(segments).map(([segment, count]) => ({
        segment,
        percentage: Math.round((count / totalCustomers) * 100),
        avgSpend: Math.round(
          customers
            .filter(c => {
              if (segment === 'Premium Buyers') return c.totalSpend > avgSpend * 2;
              if (segment === 'Regular Customers') return c.totalSpend > avgSpend && c.totalSpend <= avgSpend * 2;
              return c.totalSpend <= avgSpend;
            })
            .reduce((sum, c) => sum + c.totalSpend, 0) / count
        )
      }));

      console.log('👥 Calculated customer behavior segments:', segmentData);
      return {
        segments: segmentData,
        totalCustomers,
        avgSpend: Math.round(avgSpend)
      };
    } catch (error) {
      console.error('❌ Failed to get customer behavior:', error);
      throw error;
    }
  }

  // Get data lake connection status
  async getConnectionStatus(): Promise<any> {
    try {
      // Test connection by fetching a small file
      await this.fetchCSV('brands.csv');
      return {
        status: 'data-lake-connected',
        timestamp: new Date().toISOString(),
        services: {
          database: 'azure-blob-storage',
          api: 'direct-csv-access',
          cache: 'in-memory'
        }
      };
    } catch (error) {
      return {
        status: 'data-lake-error',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'error',
          api: 'error',
          cache: 'error'
        }
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Data lake cache cleared');
  }

  // Get cache statistics
  getCacheStats(): any {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemory: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
}

// Create singleton instance
const dataLakeService = new AzureDataLakeService();

export { dataLakeService, AzureDataLakeService };
export default dataLakeService;