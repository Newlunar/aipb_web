import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { FilterProvider } from './contexts/FilterContext'
import { UserProvider } from './contexts/UserContext'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { WidgetSettings } from './pages/WidgetSettings'
import { Agents, Strategy, Knowledge, Lab, Settings } from './pages/PlaceholderPages'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <FilterProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="agents" element={<Agents />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="lab" element={<Lab />} />
              <Route path="widgets" element={<WidgetSettings />} />
              <Route path="settings" element={<Settings />} />
              {/* 알 수 없는 경로는 대시보드로 리다이렉트 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </FilterProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
