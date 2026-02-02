import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Dashboard } from '../../pages/Dashboard'
import { Customers } from '../../pages/Customers'
import { WidgetSettings } from '../../pages/WidgetSettings'

// 페이지 설정
const pageConfig: Record<string, { title: string; subtitle: string; component: React.ComponentType }> = {
  '/': { title: '대시보드', subtitle: '오늘의 주요 업무와 고객 현황을 확인하세요.', component: Dashboard },
  '/customers': { title: '고객 관리', subtitle: '고객 정보를 조회하고 관리합니다.', component: Customers },
  '/strategy': { title: '투자전략', subtitle: '투자전략을 수립하고 관리합니다.', component: () => <PlaceholderPage name="투자전략" /> },
  '/knowledge': { title: '지식관리', subtitle: '투자 관련 지식을 관리합니다.', component: () => <PlaceholderPage name="지식관리" /> },
  '/lab': { title: '실험실', subtitle: '새로운 기능을 테스트합니다.', component: () => <PlaceholderPage name="실험실" /> },
  '/widgets': { title: '위젯설정', subtitle: '대시보드 위젯을 관리합니다.', component: WidgetSettings },
  '/settings': { title: '설정', subtitle: '시스템 설정을 관리합니다.', component: () => <PlaceholderPage name="설정" /> },
}

// 플레이스홀더 페이지
function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-lg">{name} 페이지</p>
      <p className="text-sm mt-2">준비 중입니다.</p>
    </div>
  )
}

export function Layout() {
  const [currentPath, setCurrentPath] = useState('/')
  
  const currentPage = pageConfig[currentPath] || pageConfig['/']
  const PageComponent = currentPage.component

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <Header title={currentPage.title} subtitle={currentPage.subtitle} />

        {/* 헤더와 콘텐츠 사이 간격 */}
        <div className="h-6 bg-white shrink-0" />

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl p-6 min-h-full shadow-sm">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  )
}
