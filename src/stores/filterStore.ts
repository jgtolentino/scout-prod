import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface FilterState {
  // Geography filters
  region: string | null
  city: string | null
  municipality: string | null
  barangay: string | null
  
  // Organization filters
  holding_company: string | null
  client: string | null
  category: string | null
  brand: string | null
  sku: string | null
  
  // Time filters
  year: number | null
  quarter: number | null
  month: number | null
  week: number | null
  day: string | null
  hour: number | null
  
  // Actions
  setFilter: (key: string, value: string | number | null) => void
  clearFilters: () => void
  clearGeographyFromLevel: (level: string) => void
  clearOrganizationFromLevel: (level: string) => void
  getActiveFilters: () => Record<string, any>
}

const geographyLevels = ['region', 'city', 'municipality', 'barangay']
const organizationLevels = ['holding_company', 'client', 'category', 'brand', 'sku']

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      region: null,
      city: null,
      municipality: null,
      barangay: null,
      holding_company: null,
      client: null,
      category: null,
      brand: null,
      sku: null,
      year: null,
      quarter: null,
      month: null,
      week: null,
      day: null,
      hour: null,
      
      setFilter: (key: string, value: string | number | null) => {
        set((state) => {
          const newState = { ...state, [key]: value }
          
          // Clear dependent filters when parent changes
          if (geographyLevels.includes(key)) {
            const levelIndex = geographyLevels.indexOf(key)
            geographyLevels.slice(levelIndex + 1).forEach(level => {
              newState[level as keyof FilterState] = null
            })
          }
          
          if (organizationLevels.includes(key)) {
            const levelIndex = organizationLevels.indexOf(key)
            organizationLevels.slice(levelIndex + 1).forEach(level => {
              newState[level as keyof FilterState] = null
            })
          }
          
          return newState
        })
      },
      
      clearFilters: () => {
        set({
          region: null,
          city: null,
          municipality: null,
          barangay: null,
          holding_company: null,
          client: null,
          category: null,
          brand: null,
          sku: null,
          year: null,
          quarter: null,
          month: null,
          week: null,
          day: null,
          hour: null,
        })
      },
      
      clearGeographyFromLevel: (level: string) => {
        set((state) => {
          const newState = { ...state }
          const levelIndex = geographyLevels.indexOf(level)
          if (levelIndex >= 0) {
            geographyLevels.slice(levelIndex).forEach(level => {
              newState[level as keyof FilterState] = null
            })
          }
          return newState
        })
      },
      
      clearOrganizationFromLevel: (level: string) => {
        set((state) => {
          const newState = { ...state }
          const levelIndex = organizationLevels.indexOf(level)
          if (levelIndex >= 0) {
            organizationLevels.slice(levelIndex).forEach(level => {
              newState[level as keyof FilterState] = null
            })
          }
          return newState
        })
      },
      
      getActiveFilters: () => {
        const state = get()
        const filters: Record<string, any> = {}
        
        Object.entries(state).forEach(([key, value]) => {
          if (value !== null && typeof state[key as keyof FilterState] !== 'function') {
            filters[key] = value
          }
        })
        
        return filters
      },
    }),
    {
      name: 'filter-store',
    }
  )
)