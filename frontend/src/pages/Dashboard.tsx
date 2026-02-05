import { useState, useEffect } from 'react'
import { LayoutGrid, Check } from 'lucide-react'
import { initializeDefaultWidgets } from '../types/widget'
import { usePageWidgets } from '../hooks/usePageWidgets'
import { WidgetGrid } from '../components/widgets/WidgetGrid'
import { Link } from 'react-router-dom'

const PAGE_NAME = 'dashboard'

export function Dashboard() {
  const [isEditLayout, setIsEditLayout] = useState(false)

  // Dashboard는 'dashboard' pageType으로 로드 -> pinned 된 것만 나옴
  const {
    pageWidgets,
    moveWidget,
    togglePinToDashboard
  } = usePageWidgets(PAGE_NAME)

  useEffect(() => {
    // 혹시라도 위젯 데이터가 없을 때를 대비해 초기화
    initializeDefaultWidgets()
  }, [])

  if (pageWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <LayoutGrid size={48} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">대시보드가 비어있습니다</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          다른 페이지에서 마음에 드는 위젯의 <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs mx-1">📌</span> 버튼을 눌러
          대시보드에 고정해보세요.
        </p>
        <Link
          to="/customers"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          고객 관리로 이동하기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 툴바: 대시보드는 '선택' 보다는 '재배치' 위주 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">내 대시보드</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditLayout((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditLayout
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {isEditLayout ? (
              <>
                <Check size={18} />
                완료
              </>
            ) : (
              <>
                <LayoutGrid size={18} />
                위젯 재배치
              </>
            )}
          </button>
        </div>
      </div>

      {/* 위젯 그리드 */}
      <WidgetGrid
        widgets={pageWidgets}
        isEditLayout={isEditLayout}
        onMove={moveWidget}
        onTogglePin={togglePinToDashboard}
      />
    </div>
  )
}
