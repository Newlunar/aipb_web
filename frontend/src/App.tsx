import { Layout } from './components/layout'
import { FilterProvider } from './contexts/FilterContext'

function App() {
  return (
    <FilterProvider>
      <Layout />
    </FilterProvider>
  )
}

export default App
