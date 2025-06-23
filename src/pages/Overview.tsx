import React from 'react'
import CascadingFilters from '@/components/CascadingFilters'
import KPICards from '@/components/KPICards'
import RegionalMap from '@/components/RegionalMap'
import AdsBot from '@/components/AdsBot'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const Overview: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Filters */}
        <CascadingFilters />
        
        {/* KPI Cards */}
        <KPICards />
        
        {/* Regional Map */}
        <RegionalMap />
        
        {/* AI Assistant */}
        <AdsBot />
      </div>
    </ErrorBoundary>
  )
}

export default Overview