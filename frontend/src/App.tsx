import { Layout } from './components/layout'
import { FilterProvider } from './contexts/FilterContext'
import { UserProvider } from './contexts/UserContext'

function App() {
  return (
    <UserProvider>
      <FilterProvider>
        <Layout />
      </FilterProvider>
    </UserProvider>
  )
}

export default App
