import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { FilterProvider } from './contexts/FilterContext'
import { UserProvider } from './contexts/UserContext'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { WidgetSettings } from './pages/WidgetSettings'

// 플레이스홀더 페이지 (임시)
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-lg">{name} 페이지</p>
      <p className="text-sm mt-2">준비 중입니다.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <FilterProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="strategy" element={<PlaceholderPage name="투자전략" />} />
              <Route path="knowledge" element={<PlaceholderPage name="지식관리" />} />
              <Route path="lab" element={<PlaceholderPage name="실험실" />} />
              <Route path="widgets" element={<WidgetSettings />} />
              <Route path="settings" element={<PlaceholderPage name="설정" />} />
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
