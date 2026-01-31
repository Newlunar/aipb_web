import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
  customerGroup: string
  setCustomerGroup: (group: string) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [customerGroup, setCustomerGroup] = useState('all')

  return (
    <FilterContext.Provider value={{ customerGroup, setCustomerGroup }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}
