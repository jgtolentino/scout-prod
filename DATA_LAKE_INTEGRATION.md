# Scout-Prod Azure Data Lake Integration

## 🎯 Overview

Scout-Prod now supports **direct querying of your Azure Data Lake** at `scoutdata/raw/scout-seed`, providing three-tier data access:

1. **🔵 Azure API** (Primary) - Real-time API endpoint
2. **🟢 Data Lake** (Secondary) - Direct CSV access from blob storage  
3. **🟠 Mock Data** (Fallback) - Static data for offline development

## 📊 Available Data Sources

Your data lake contains the following CSV files:

- **`transactions.csv`** (206.16 KiB) - Core transaction data
- **`transaction_items.csv`** (119.66 KiB) - Line item details
- **`customers.csv`** (5.32 KiB) - Customer information
- **`stores.csv`** (854 B) - Store locations
- **`products.csv`** (1.06 KiB) - Product catalog
- **`brands.csv`** (461 B) - Brand information
- **`devices.csv`** (2.2 KiB) - Device data
- **`request_behaviors.csv`** (298.12 KiB) - User behavior analytics
- **`substitutions.csv`** (21.3 KiB) - Product substitution data

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Azure Data Lake Access
VITE_AZURE_STORAGE_ACCOUNT=scoutdata
VITE_AZURE_CONTAINER=raw/scout-seed

# Authentication (choose one)
VITE_AZURE_SAS_TOKEN=your_sas_token_here
# OR
VITE_AZURE_STORAGE_KEY=your_storage_key_here

# Feature Flags
VITE_ENABLE_DATA_LAKE=true
VITE_CACHE_TTL_MINUTES=15
```

### SAS Token Generation

For secure client-side access, generate a SAS token:

1. Go to Azure Portal → Storage Account → Shared access signature
2. Set permissions: **Read, List**
3. Set resource types: **Container, Object**
4. Set expiry date
5. Generate SAS token
6. Add to `VITE_AZURE_SAS_TOKEN`

## 🚀 How It Works

### Intelligent Fallback System

```
Azure API → Data Lake → Mock Data
     ↓           ↓          ↓
  Real-time    Real CSV   Fallback
   endpoint    parsing    data
```

### Data Processing

The data lake service automatically:

- **Fetches CSV files** from blob storage
- **Parses and joins** related tables (transactions ↔ customers ↔ products)
- **Calculates KPIs** (revenue, growth rate, basket size)
- **Caches results** for 15 minutes
- **Handles errors** gracefully with fallback

### Real-Time Analytics

All standard Scout-Prod features work with data lake:

- ✅ **KPI Calculations** from real transaction data
- ✅ **Product Performance** analysis
- ✅ **Customer Segmentation** based on spending patterns
- ✅ **Regional Analytics** from store and customer data
- ✅ **Growth Trends** comparison across time periods

## 📈 Status Monitoring

The **DeploymentStatus** component shows real-time data source:

- **🔵 Azure API** - API endpoint active
- **🟢 Data Lake** - CSV files being accessed directly
- **🟠 Mock Data** - Fallback mode active

## 🔍 Data Lake Analytics Features

### KPI Calculation
```typescript
// Automatically calculates from your real data:
const kpis = await dataLakeService.calculateKPIMetrics();
// Returns: total_sales, transaction_count, avg_basket_size, growth_rate
```

### Product Performance
```typescript
// Top 50 products by revenue with category breakdown
const products = await dataLakeService.getProductPerformance();
```

### Customer Behavior
```typescript
// Customer segmentation by spend patterns
const behavior = await dataLakeService.getCustomerBehavior();
```

## 🛠️ Development Usage

### Testing Data Lake Connection

```bash
# Enable debug logging
VITE_ENABLE_DEBUG_LOGGING=true

# Watch browser console for:
# 📊 Data Lake detected and available
# 📄 Fetched transactions.csv: 1234 records
# 🔗 Enriched 1234 transactions with customer, store, and product data
```

### Cache Management

```typescript
// Clear cache manually
dataLakeService.clearCache();

// Check cache stats
const stats = dataLakeService.getCacheStats();
```

### Local Development

Without Azure credentials, Scout-Prod automatically falls back to mock data while maintaining the same interface.

## 🔒 Security Considerations

1. **SAS Tokens** are recommended over storage keys for client-side access
2. **Read-only permissions** limit exposure
3. **Time-limited tokens** expire automatically
4. **CORS configuration** in Azure Storage for domain restrictions

## 📊 Performance Benefits

- **Direct CSV Access** - No API overhead for data lake queries
- **Client-side Caching** - 15-minute cache reduces blob storage requests
- **Intelligent Routing** - Automatic failover between data sources
- **Real Data Analysis** - Your actual transaction patterns and metrics

## 🔄 Deployment

The data lake integration works on all platforms:

- **🌐 Netlify** - Static site with client-side data processing
- **⚡ Vercel** - Edge functions with blob storage access
- **☁️ Azure** - Native integration with blob storage
- **💻 Local** - Development with mock fallback

## 🎉 Benefits

1. **Real Data Insights** - Analytics from your actual transactions
2. **High Availability** - Three-tier fallback system
3. **Cost Effective** - Direct blob access reduces API costs
4. **Scalable** - Handles large CSV files with streaming parsing
5. **Transparent** - Visual indicators show current data source

Your Scout-Prod dashboard now provides **real insights from your actual business data** while maintaining 100% uptime through intelligent fallback capabilities.