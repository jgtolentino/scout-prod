export interface GeographyFilter {
  region: string | null
  city: string | null
  municipality: string | null
  barangay: string | null
}

export interface OrganizationFilter {
  holding_company: string | null
  client: string | null
  category: string | null
  brand: string | null
  sku: string | null
}

export interface TimeFilter {
  year: number | null
  quarter: number | null
  month: number | null
  week: number | null
  day: string | null
  hour: number | null
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface FilterCounts {
  geography: Record<string, number>
  organization: Record<string, number>
}

export interface Transaction {
  id: string
  datetime: string
  geography_id: string
  organization_id: string
  total_amount: number
  quantity: number
}

export interface KPIData {
  total_sales: number
  transaction_count: number
  avg_basket_size: number
  growth_rate: number
}

export interface ChartData {
  name: string
  value: number
  category?: string
  timestamp?: string
}

export interface APIResponse<T> {
  status: number
  data: T
  message?: string
}

export interface ErrorState {
  message: string
  code?: number
  details?: any
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking'
  platform: string
  apiUrl: string
  data?: any
  error?: any
}