import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Outlet, useLocation } from 'react-router-dom'

// 페이지 정보 매핑
const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '대시보드', subtitle: '오늘의 주요 업무와 고객 현황을 확인하세요.' },
  '/customers': { title: '고객 관리', subtitle: '고객 정보를 조회하고 관리합니다.' },
  '/agents': { title: 'Agent 관리', subtitle: 'AI 에이전트를 관리하고 모니터링합니다.' },
  '/strategy': { title: '투자전략', subtitle: '투자전략을 수립하고 관리합니다.' },
  '/knowledge': { title: '지식관리', subtitle: '투자 관련 지식을 관리합니다.' },
  '/lab': { title: '실험실', subtitle: '새로운 기능을 테스트합니다.' },
  '/widgets': { title: '위젯설정', subtitle: '대시보드 위젯을 관리합니다.' },
  '/settings': { title: '설정', subtitle: '시스템 설정을 관리합니다.' },
}

export function Layout() {
  const location = useLocation()

  // 현재 경로에 맞는 페이지 정보 찾기 (정확한 매칭 없으면 대시보드 기본값)
  // TODO: 동적 라우팅이 추가되면 매칭 로직 개선 필요
  const currentInfo = PAGE_INFO[location.pathname] || PAGE_INFO['/']

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <Header title={currentInfo.title} subtitle={currentInfo.subtitle} />

        {/* 헤더와 콘텐츠 사이 간격 */}
        <div className="h-6 bg-white shrink-0" />

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl p-6 min-h-full shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
