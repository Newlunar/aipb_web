import { useState } from 'react'
import { Plus, LayoutGrid, Trash2, Edit, Users, Save, BarChart3 } from 'lucide-react'
import {
  widgetTemplates,
  loadSavedWidgets,
  saveWidget,
  deleteWidget,
  updateWidget,
  PAGE_NAMES,
  WIDGET_PAGE_OPTIONS,
  type WidgetTemplate,
  type SavedWidget,
  type PageType,
  type BarChartVariant,
  type WidgetDisplayType,
  type ColumnMappingDef,
  type ActionListApiConfig,
  type BarChartApiConfig,
  type TextBlockApiConfig,
  type SummaryCardApiConfig,
} from '../types/widget'
import { getApiPathForCode, type WidgetCode } from '../types/widgetApiMapping'
import { useWidgetDataByApiPath } from '../hooks/useWidgetData'
import { useUser } from '../contexts/UserContext'

/** 표현 타입별 옵션 (API 경로 직접 입력 방식) */
const DISPLAY_TYPE_OPTIONS: { value: WidgetDisplayType; label: string; icon: string; apiPathExample: string }[] = [
  { value: 'action-list', label: '테이블 (액션리스트)', icon: '📋', apiPathExample: '/api/widgets/action-list/AL001/data' },
  { value: 'bar-chart', label: '바 차트', icon: '📊', apiPathExample: '/api/widgets/bar-chart/BC001/data' },
  { value: 'text-block', label: '텍스트 블록', icon: '📝', apiPathExample: '/api/widgets/text-block/TB001/data' },
  { value: 'summary-card', label: '요약 카드', icon: '📊', apiPathExample: '/api/widgets/summary-card/SC001/data' },
]
import { BarChartWidget } from '../components/widgets/BarChart'
import { TextBlockWidget } from '../components/widgets/TextBlock'

type Tab = 'create' | 'list' | 'stats'

export function WidgetSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [savedWidgets, setSavedWidgets] = useState<SavedWidget[]>(loadSavedWidgets())
  const [editingWidget, setEditingWidget] = useState<SavedWidget | null>(null)

  const refreshWidgets = () => {
    setSavedWidgets(loadSavedWidgets())
  }

  const handleEdit = (widget: SavedWidget) => {
    setEditingWidget(widget)
  }

  const handleCancelEdit = () => {
    setEditingWidget(null)
  }

  const handleSaveEdit = (updatedWidget: SavedWidget) => {
    updateWidget(updatedWidget.id, updatedWidget)
    setEditingWidget(null)
    refreshWidgets()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 text-base font-medium transition-colors relative ${
              activeTab === 'list'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={20} />
              위젯 목록
            </div>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-base font-medium transition-colors relative ${
              activeTab === 'create'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus size={20} />
              위젯 생성
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-base font-medium transition-colors relative ${
              activeTab === 'stats'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={20} />
              위젯 통계
            </div>
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-0 py-4">
        {activeTab === 'list' && !editingWidget && (
          <WidgetListTab widgets={savedWidgets} onRefresh={refreshWidgets} onEdit={handleEdit} />
        )}
        {activeTab === 'list' && editingWidget && (
          <WidgetEditTab
            widget={editingWidget}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
        {activeTab === 'create' && (
          <WidgetCreateTab onWidgetCreated={refreshWidgets} />
        )}
        {activeTab === 'stats' && (
          <WidgetStatsTab widgets={savedWidgets} />
        )}
      </div>
    </div>
  )
}

// 위젯 통계 탭
function WidgetStatsTab({
  widgets
}: {
  widgets: SavedWidget[]
}) {
  // Mock 사용 통계 데이터 (나중에 실제 데이터로 대체)
  const getWidgetStats = (widgetId: string) => {
    const hash = widgetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
      views: 120 + (hash % 500),
      clicks: 45 + (hash % 200),
      avgUsageTime: Math.floor(30 + (hash % 120)),
      lastAccessed: new Date(Date.now() - (hash % 10) * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')
    }
  }

  // Mock 페이지 데이터 (위젯에 pages가 없으면 기본값 생성)
  const getMockPages = (widgetId: string, existingPages?: PageType[]): PageType[] => {
    if (existingPages && existingPages.length > 0) return existingPages

    const hash = widgetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const allPages: PageType[] = ['customers', 'strategy', 'knowledge', 'lab']

    // 위젯마다 랜덤하게 1-3개 페이지 할당
    const count = 1 + (hash % 3)
    const selectedPages: PageType[] = []

    for (let i = 0; i < count; i++) {
      const pageIndex = (hash + i * 17) % allPages.length
      if (!selectedPages.includes(allPages[pageIndex])) {
        selectedPages.push(allPages[pageIndex])
      }
    }

    return selectedPages.length > 0 ? selectedPages : ['customers']
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg">통계를 표시할 위젯이 없습니다</p>
        <p className="text-sm mt-2">위젯을 생성하면 사용 통계를 확인할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">위젯 통계</h3>
              <p className="text-sm text-gray-500 mt-1">
                총 {widgets.length}개의 위젯에 대한 사용 통계입니다
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                목 데이터
              </span>
            </div>
          </div>
        </div>

        {/* 통계 테이블 */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  위젯 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  노출 페이지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  템플릿
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  그리드 크기
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  클릭수
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평균 사용 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 접근
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {widgets.map((widget) => {
                const template = widgetTemplates.find(t => t.id === widget.templateId)
                const stats = getWidgetStats(widget.id)
                const pages = getMockPages(widget.id, widget.pages)

                return (
                  <tr key={widget.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template?.icon || '📊'}</span>
                        <div>
                          <div className="font-medium text-gray-900">{widget.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 font-mono">
                            {widget.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {pages.map((page) => (
                          <span
                            key={page}
                            className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {PAGE_NAMES[page]}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5">
                        {pages.length}개 페이지
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{template?.name || '-'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{template?.type || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {widget.config.gridWidth || template?.gridSize.width || 3}칸 × {template?.gridSize.height || 1}칸
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">{stats.views.toLocaleString()}</div>
                      <div className="text-xs text-green-600 mt-0.5">+12%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">{stats.clicks.toLocaleString()}</div>
                      <div className="text-xs text-blue-600 mt-0.5">+8%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">{stats.avgUsageTime}초</div>
                      <div className="text-xs text-gray-500 mt-0.5">평균</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stats.lastAccessed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(widget.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(widget.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 푸터 요약 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">총 위젯 수</div>
              <div className="text-2xl font-bold text-gray-900">{widgets.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">총 조회수</div>
              <div className="text-2xl font-bold text-gray-900">
                {widgets.reduce((sum, w) => sum + getWidgetStats(w.id).views, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">총 클릭수</div>
              <div className="text-2xl font-bold text-gray-900">
                {widgets.reduce((sum, w) => sum + getWidgetStats(w.id).clicks, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">평균 사용 시간</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(widgets.reduce((sum, w) => sum + getWidgetStats(w.id).avgUsageTime, 0) / widgets.length)}초
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 위젯 목록 탭
function WidgetListTab({
  widgets,
  onRefresh,
  onEdit
}: {
  widgets: SavedWidget[]
  onRefresh: () => void
  onEdit: (widget: SavedWidget) => void
}) {
  const [selectedWidget, setSelectedWidget] = useState<SavedWidget | null>(widgets[0] || null)

  const handleDelete = (id: string) => {
    if (confirm('이 위젯을 삭제하시겠습니까?')) {
      deleteWidget(id)
      // 삭제된 위젯이 선택되어 있었다면 첫 번째 위젯 선택
      if (selectedWidget?.id === id) {
        const remaining = loadSavedWidgets()
        setSelectedWidget(remaining[0] || null)
      }
      onRefresh()
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <LayoutGrid size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg">저장된 위젯이 없습니다</p>
        <p className="text-sm mt-2">새로운 위젯을 생성해보세요.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* 좌측: 위젯 목록 */}
      <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">위젯 목록</h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {widgets.length}개
            </p>
          </div>

          {/* 위젯 리스트 */}
          <div className="flex-1 overflow-y-auto">
            {widgets.map((widget) => {
              const template = widgetTemplates.find(t => t.id === widget.templateId)
              const isSelected = selectedWidget?.id === widget.id

              return (
                <button
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{template?.icon || '📊'}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${
                        isSelected ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {widget.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {template?.name || widget.templateId}
                      </p>
                      {(widget.config.apiPath || widget.config.query?.base_table) && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono truncate max-w-full" title={widget.config.apiPath || widget.config.query?.base_table}>
                          {widget.config.apiPath || widget.config.query.base_table}
                        </span>
                      )}
                      {widget.config.gridWidth && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {widget.config.gridWidth}칸
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 우측: 상세 정보 및 미리보기 */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {selectedWidget ? (
          <WidgetDetailPanel
            widget={selectedWidget}
            onDelete={handleDelete}
            onEdit={onEdit}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex items-center justify-center text-gray-400">
            위젯을 선택하세요
          </div>
        )}
      </div>
    </div>
  )
}

// 위젯 상세 패널
function WidgetDetailPanel({
  widget,
  onDelete,
  onEdit
}: {
  widget: SavedWidget
  onDelete: (id: string) => void
  onEdit: (widget: SavedWidget) => void
}) {
  const template = widgetTemplates.find(t => t.id === widget.templateId)

  // API 기반이면 columnMappings, 아니면 columns
  const columns = widget.config.columnMappings || widget.config.columns || []
  const query = widget.config.query || null

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{template?.icon || '📊'}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{widget.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {template?.name || widget.templateId}
                {template && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {template.type}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(widget)}
              className="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              <Edit size={16} />
              수정
            </button>
            <button
              onClick={() => onDelete(widget.id)}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
      {/* 메타데이터 */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">위젯 정보</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-gray-500 mb-1">템플릿 유형</dt>
            <dd className="text-sm font-medium text-gray-900">{template?.name || widget.templateId}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-1">템플릿 ID</dt>
            <dd className="text-sm font-medium text-gray-900 font-mono text-xs">{widget.templateId}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-1">그리드 크기</dt>
            <dd className="text-sm font-medium text-gray-900">
              {widget.config.gridWidth || template?.gridSize.width || 3}칸 × {template?.gridSize.height || 1}칸
            </dd>
          </div>
          {(widget.config.apiPath || query) && (
            <div className="col-span-2">
              <dt className="text-xs text-gray-500 mb-1">API 경로 / 데이터 테이블</dt>
              <dd className="text-sm font-medium text-gray-900 font-mono break-all">
                {widget.config.apiPath || query?.base_table || '(미지정)'}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-gray-500 mb-1">컬럼 개수</dt>
            <dd className="text-sm font-medium text-gray-900">
              {columns.length}개
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-1">생성일</dt>
            <dd className="text-sm font-medium text-gray-900">
              {new Date(widget.createdAt).toLocaleString('ko-KR')}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 mb-1">마지막 수정</dt>
            <dd className="text-sm font-medium text-gray-900">
              {new Date(widget.updatedAt).toLocaleString('ko-KR')}
            </dd>
          </div>
        </dl>
      </div>

      {/* 컬럼 매핑 구조 */}
      {columns.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">컬럼 매핑 구조</h3>

          {/* 쿼리/API 설정 요약 */}
          {(widget.config.apiPath || widget.config.query) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                {widget.config.apiPath ? (
                  <div className="col-span-full">
                    <span className="text-blue-600 font-medium">API:</span>{' '}
                    <span className="text-blue-900 font-mono break-all">{widget.config.apiPath}</span>
                  </div>
                ) : (
                <div>
                  <span className="text-blue-600 font-medium">테이블:</span>{' '}
                  <span className="text-blue-900 font-mono">{widget.config.query?.base_table}</span>
                </div>
                )}
                {!widget.config.apiPath && widget.config.query?.scenario_filter?.codes && (
                  <div>
                    <span className="text-blue-600 font-medium">시나리오:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.scenario_filter.codes.join(', ')}
                    </span>
                  </div>
                )}
                {!widget.config.apiPath && widget.config.query?.status_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">상태:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.status_filter.join(', ')}
                    </span>
                  </div>
                )}
                {!widget.config.apiPath && widget.config.query?.customer_group_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">고객 그룹:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.customer_group_filter.join(', ')}
                    </span>
                  </div>
                )}
                {!widget.config.apiPath && widget.config.query?.account_type_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">계좌 타입:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.account_type_filter.join(', ')}
                    </span>
                  </div>
                )}
                {!widget.config.apiPath && widget.config.query?.filters && Array.isArray(widget.config.query.filters) && widget.config.query.filters.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-blue-600 font-medium">동적 필터:</span>{' '}
                    <span className="text-blue-900">{widget.config.query.filters.length}개</span>
                    <div className="mt-1 space-y-1">
                      {widget.config.query.filters.slice(0, 3).map((filter: any, idx: number) => (
                        <div key={idx} className="text-xs text-blue-800 font-mono">
                          {filter.column} {filter.operator} {JSON.stringify(filter.value)}
                        </div>
                      ))}
                      {widget.config.query.filters.length > 3 && (
                        <div className="text-xs text-blue-700">...외 {widget.config.query.filters.length - 3}개</div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-blue-600 font-medium">컬럼:</span>{' '}
                  <span className="text-blue-900">{columns.length}개</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">컬럼 키</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">표시명</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">데이터 원천</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">필드 경로</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">포맷</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">정렬</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">필터</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {columns.map((col: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-blue-600">{col.responseKey ?? col.key}</td>
                    <td className="px-3 py-2 text-gray-900">{col.label}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        col.source === 'api' || col.responseKey ? 'bg-teal-100 text-teal-700' :
                        col.source === 'customer' ? 'bg-purple-100 text-purple-700' :
                        col.source === 'event' ? 'bg-green-100 text-green-700' :
                        col.source === 'scenario' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {col.responseKey ? 'api' : (col.source || '-')}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-600">{col.responseKey ?? col.field}</td>
                    <td className="px-3 py-2">
                      {(col.format?.type ?? col.format) && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {col.format?.type ?? col.format}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {col.sortable && (
                        <span className="text-green-600">✓</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {col.filterable && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 데이터 원천 설명 */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">customer</span>
              <span className="text-gray-500">→ customers 테이블 (JOIN)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">event</span>
              <span className="text-gray-500">→ customer_scenario_events 테이블</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">scenario</span>
              <span className="text-gray-500">→ scenarios 테이블 (JOIN)</span>
            </div>
          </div>
        </div>
      )}

      {/* 날 데이터 (Raw Config) */}
      <div className="p-6 border-b border-gray-200">
        <details className="group">
          <summary className="text-sm font-semibold text-gray-700 mb-2 cursor-pointer hover:text-primary flex items-center gap-2">
            <span>날 데이터 (Raw Config)</span>
            <span className="text-xs text-gray-500 group-open:hidden">클릭하여 펼치기</span>
            <span className="text-xs text-gray-500 hidden group-open:inline">클릭하여 접기</span>
          </summary>
          <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-gray-100 font-mono">
              {JSON.stringify(widget.config, null, 2)}
            </pre>
          </div>
        </details>
      </div>

      {/* 미리보기 */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">미리보기</h3>
        <WidgetPreview widget={widget} template={template} />
      </div>
      </div>
    </div>
  )
}

// 위젯 미리보기
function WidgetPreview({
  widget,
  template
}: {
  widget: SavedWidget
  template?: WidgetTemplate
}) {
  if (!template) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
        <LayoutGrid size={48} className="mx-auto mb-2" />
        <p>템플릿을 찾을 수 없습니다</p>
        <p className="text-xs mt-1">템플릿 ID: {widget.templateId}</p>
      </div>
    )
  }

  if (template.type === 'action-list') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">{widget.title}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">고객명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">등급</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">시나리오</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">날짜</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">샘플 고객 {i}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      {['Diamond', 'Platinum', 'Gold'][i - 1]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">샘플 시나리오</td>
                  <td className="px-4 py-3 text-gray-600">2026-02-{10 + i}</td>
                  <td className="px-4 py-3 text-gray-900">{i}.0억</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>총 3건</span>
          <span>1 / 1 페이지</span>
        </div>
      </div>
    )
  }

  if (template?.type === 'summary-card') {
    return (
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900">128</p>
            <p className="text-sm text-green-600 mt-1">+5.2% 전월 대비</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Users size={24} className="text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (template?.type === 'schedule') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">{widget.title}</h4>
        </div>
        <div className="p-4 space-y-3">
          {[
            { time: '09:30', title: '김철수 고객 상담', type: '상담' },
            { time: '11:00', title: '이영희 포트폴리오 리뷰', type: '리뷰' },
            { time: '14:00', title: '신규 상품 설명회', type: '세미나' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-primary w-12">{item.time}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (template?.type === 'bar-chart') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[320px]">
        <BarChartWidget widget={widget} />
      </div>
    )
  }

  if (template?.type === 'text-block') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[320px]">
        <TextBlockWidget widget={widget} />
      </div>
    )
  }

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
      <LayoutGrid size={48} className="mx-auto mb-2" />
      <p>미리보기를 준비중입니다</p>
    </div>
  )
}


/** 기존 위젯 config를 API 폼 초기값으로 변환 */
function widgetToApiFormInit(widget: SavedWidget) {
  const c = widget.config || {}
  const templateId = widget.templateId as WidgetDisplayType
  const hasApiPath = typeof c.apiPath === 'string' && c.apiPath.length > 0
  const widgetCode = c.widgetCode as WidgetCode | undefined
  const apiPath = hasApiPath ? c.apiPath : (widgetCode && getApiPathForCode(widgetCode)) || DISPLAY_TYPE_OPTIONS[0].apiPathExample
  const cols = c.columnMappings || (c.columns || []).map((col: any) => ({
    responseKey: col.field || col.key || '',
    label: col.label || col.key || '',
    format: (col.format?.type || col.format || 'text') as ColumnMappingDef['format'],
    width: col.width
  }))
  return {
    displayType: (c.displayType as WidgetDisplayType) || templateId,
    widgetTitle: widget.title,
    apiPath,
    apiParamsJson: JSON.stringify(c.apiParams ?? {}, null, 2),
    columnMappings: templateId === 'action-list' ? cols : [],
    metricMappings: (c.metricMappings || []) as SummaryCardApiConfig['metricMappings'],
    titleKey: c.titleKey || 'title',
    contentKey: c.contentKey || 'content',
    chartVariant: (c.chartVariant as BarChartVariant) || 'vertical-bar-stacked',
    gridWidth: c.gridWidth ?? 3,
    selectedPages: (widget.pages && widget.pages.length > 0 ? widget.pages : ['customers']) as PageType[]
  }
}

// 공통 API 폼 (생성/수정 공통)
function WidgetApiForm({
  mode,
  editWidget,
  onSave,
  onCancel
}: {
  mode: 'create' | 'edit'
  editWidget?: SavedWidget
  onSave: (widget: SavedWidget) => void
  onCancel?: () => void
}) {
  const { currentUser } = useUser()
  const init = mode === 'edit' && editWidget ? widgetToApiFormInit(editWidget) : null
  const [displayType, setDisplayType] = useState<WidgetDisplayType>(init?.displayType ?? 'action-list')
  const [widgetTitle, setWidgetTitle] = useState(init?.widgetTitle ?? '')
  const [apiPath, setApiPath] = useState(init?.apiPath ?? '')
  const [apiParamsJson, setApiParamsJson] = useState(init?.apiParamsJson ?? '{}')
  const [apiParamsError, setApiParamsError] = useState<string | null>(null)
  const [columnMappings, setColumnMappings] = useState<ColumnMappingDef[]>(init?.columnMappings ?? [])
  const [selectedPages, setSelectedPages] = useState<PageType[]>(init?.selectedPages ?? ['customers'])
  const [gridWidth, setGridWidth] = useState(init?.gridWidth ?? 3)
  const [chartVariant, setChartVariant] = useState<BarChartVariant>(init?.chartVariant ?? 'vertical-bar-stacked')
  const [titleKey, setTitleKey] = useState(init?.titleKey ?? 'title')
  const [contentKey, setContentKey] = useState(init?.contentKey ?? 'content')
  const [metricMappings, setMetricMappings] = useState<SummaryCardApiConfig['metricMappings']>(init?.metricMappings ?? [])

  const opt = DISPLAY_TYPE_OPTIONS.find(d => d.value === displayType)!
  const apiParams = (() => {
    try {
      const p = JSON.parse(apiParamsJson || '{}')
      if (currentUser?.id && typeof p === 'object') p.wm_id = currentUser.id
      return p as Record<string, string | number>
    } catch {
      return {} as Record<string, string | number>
    }
  })()

  useWidgetDataByApiPath<unknown>({
    apiPath: apiPath.trim() || '',
    apiParams: currentUser?.id ? { ...apiParams, wm_id: currentUser.id } : apiParams,
    skip: !apiPath.trim(),
  })

  const handleDisplayTypeSelect = (type: WidgetDisplayType) => {
    setDisplayType(type)
    const example = DISPLAY_TYPE_OPTIONS.find(d => d.value === type)?.apiPathExample ?? ''
    setApiPath(example)
    if (type === 'action-list') {
      setColumnMappings([
        { responseKey: 'customer_name', label: '고객명', format: 'text', width: '120px' },
        { responseKey: 'grade', label: '등급', format: 'badge', width: '80px' },
        { responseKey: 'scenario_name', label: '시나리오', format: 'text', width: '120px' },
        { responseKey: 'event_date', label: '일자', format: 'date', width: '100px', sortable: true },
      ])
    } else if (type === 'text-block') {
      setTitleKey('title')
      setContentKey('content')
    } else if (type === 'summary-card') {
      setMetricMappings([
        { responseKey: 'totalCustomers', title: '관리 고객', format: 'number', suffix: '명' },
        { responseKey: 'totalAum', title: '총 AUM', format: 'currency' },
      ])
    }
  }

  const togglePage = (page: PageType) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    )
  }

  const handleApiParamsChange = (value: string) => {
    setApiParamsJson(value)
    try {
      JSON.parse(value || '{}')
      setApiParamsError(null)
    } catch {
      setApiParamsError('유효하지 않은 JSON 형식입니다')
    }
  }

  const addColumnMapping = () => setColumnMappings([...columnMappings, { responseKey: '', label: '새 컬럼', format: 'text' }])
  const updateColumnMapping = (index: number, field: keyof ColumnMappingDef, value: unknown) => {
    const next = [...columnMappings]
    next[index] = { ...next[index], [field]: value }
    setColumnMappings(next)
  }
  const removeColumnMapping = (index: number) => setColumnMappings(columnMappings.filter((_, i) => i !== index))
  const addMetricMapping = () => setMetricMappings([...metricMappings, { responseKey: '', title: '새 지표', format: 'number' }])
  const updateMetricMapping = (index: number, field: string, value: unknown) => {
    const next = [...metricMappings]
    next[index] = { ...next[index], [field]: value }
    setMetricMappings(next)
  }
  const removeMetricMapping = (index: number) => setMetricMappings(metricMappings.filter((_, i) => i !== index))

  const handleSave = () => {
    if (!apiPath.trim()) {
      alert('API 경로를 입력해주세요.')
      return
    }
    if (!widgetTitle.trim()) {
      alert('위젯 제목을 입력해주세요.')
      return
    }
    if (displayType === 'action-list' && columnMappings.length === 0) {
      alert('컬럼 매핑을 1개 이상 추가해주세요.')
      return
    }
    if (displayType === 'summary-card' && metricMappings.length === 0) {
      alert('지표 매핑을 1개 이상 추가해주세요.')
      return
    }
    let apiParamsParsed: Record<string, string | number> = {}
    try {
      apiParamsParsed = JSON.parse(apiParamsJson || '{}') as Record<string, string | number>
      if (currentUser?.id) apiParamsParsed.wm_id = currentUser.id
    } catch {
      alert('API 파라미터 JSON 형식이 올바르지 않습니다.')
      return
    }
    const pagesToSave: PageType[] = selectedPages.length > 0 ? selectedPages : (['customers'] as PageType[])
    const baseConfig = { apiPath: apiPath.trim(), apiParams: apiParamsParsed, gridWidth, gridRows: 1 }

    if (mode === 'create') {
      if (displayType === 'action-list') {
        onSave(saveWidget({ templateId: 'action-list', title: widgetTitle, config: { ...baseConfig, displayType: 'action-list', columnMappings, pageSize: 10 } as ActionListApiConfig, pages: pagesToSave }))
      } else if (displayType === 'bar-chart') {
        onSave(saveWidget({ templateId: 'bar-chart', title: widgetTitle, config: { ...baseConfig, displayType: 'bar-chart', chartVariant } as BarChartApiConfig, pages: pagesToSave }))
      } else if (displayType === 'text-block') {
        onSave(saveWidget({ templateId: 'text-block', title: widgetTitle, config: { ...baseConfig, displayType: 'text-block', titleKey, contentKey } as TextBlockApiConfig, pages: pagesToSave }))
      } else if (displayType === 'summary-card') {
        onSave(saveWidget({ templateId: 'summary-card', title: widgetTitle, config: { ...baseConfig, displayType: 'summary-card', metricMappings } as SummaryCardApiConfig, pages: pagesToSave }))
      }
    } else if (mode === 'edit' && editWidget) {
      const config = displayType === 'action-list' ? { ...baseConfig, displayType: 'action-list', columnMappings, pageSize: 10 } as ActionListApiConfig
        : displayType === 'bar-chart' ? { ...baseConfig, displayType: 'bar-chart', chartVariant } as BarChartApiConfig
        : displayType === 'text-block' ? { ...baseConfig, displayType: 'text-block', titleKey, contentKey } as TextBlockApiConfig
        : { ...baseConfig, displayType: 'summary-card', metricMappings } as SummaryCardApiConfig
      onSave({
        ...editWidget,
        templateId: displayType,
        title: widgetTitle,
        config,
        pages: pagesToSave,
        updatedAt: new Date().toISOString()
      })
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="w-64 flex-shrink-0 flex flex-col min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">표현 타입</h3>
          <div className="space-y-2">
            {DISPLAY_TYPE_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => handleDisplayTypeSelect(d.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  displayType === d.value ? 'bg-primary/10 border-primary' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl mr-2">{d.icon}</span>
                <span className="font-medium">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{opt.label}</h2>
            <p className="text-sm text-gray-500 mt-1">API 경로를 입력하고 응답 key를 컬럼에 매핑하세요.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">위젯 제목 *</label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="예: 만기 고객 목록"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API 경로 *</label>
                <input
                  type="text"
                  value={apiPath}
                  onChange={(e) => setApiPath(e.target.value)}
                  placeholder={opt.apiPathExample}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API 파라미터 (JSON, 선택)</label>
                <textarea
                  value={apiParamsJson}
                  onChange={(e) => handleApiParamsChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-mono text-sm ${
                    apiParamsError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder='{"wm_id": "w33000001"}'
                />
                {apiParamsError && <p className="mt-1 text-xs text-red-600">{apiParamsError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">그리드 너비</label>
                <select
                  value={gridWidth}
                  onChange={(e) => setGridWidth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}칸</option>
                  ))}
                </select>
              </div>
              {displayType === 'action-list' && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">컬럼 매핑 (API 응답 key → 표현)</label>
                    <button type="button" onClick={addColumnMapping} className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark">
                      + 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {columnMappings.map((col, i) => (
                      <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                        <input placeholder="responseKey" value={col.responseKey} onChange={(e) => updateColumnMapping(i, 'responseKey', e.target.value)} className="flex-1 px-2 py-1 text-sm font-mono border rounded" />
                        <input placeholder="라벨" value={col.label} onChange={(e) => updateColumnMapping(i, 'label', e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded" />
                        <select value={col.format ?? 'text'} onChange={(e) => updateColumnMapping(i, 'format', e.target.value)} className="px-2 py-1 text-sm border rounded">
                          <option value="text">text</option>
                          <option value="number">number</option>
                          <option value="currency">currency</option>
                          <option value="date">date</option>
                          <option value="badge">badge</option>
                        </select>
                        <input placeholder="width" value={col.width ?? ''} onChange={(e) => updateColumnMapping(i, 'width', e.target.value)} className="w-20 px-2 py-1 text-sm border rounded" />
                        <button type="button" onClick={() => removeColumnMapping(i)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded">삭제</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {displayType === 'text-block' && (
                <div className="border-t pt-6 flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목 key</label>
                    <input value={titleKey} onChange={(e) => setTitleKey(e.target.value)} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용 key</label>
                    <input value={contentKey} onChange={(e) => setContentKey(e.target.value)} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
              )}
              {displayType === 'summary-card' && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">지표 매핑 (API 응답 key → 카드)</label>
                    <button type="button" onClick={addMetricMapping} className="px-3 py-1 text-sm bg-primary text-white rounded">+ 추가</button>
                  </div>
                  <div className="space-y-2">
                    {metricMappings.map((m, i) => (
                      <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                        <input placeholder="responseKey" value={m.responseKey} onChange={(e) => updateMetricMapping(i, 'responseKey', e.target.value)} className="flex-1 px-2 py-1 text-sm font-mono border rounded" />
                        <input placeholder="제목" value={m.title} onChange={(e) => updateMetricMapping(i, 'title', e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded" />
                        <select value={m.format} onChange={(e) => updateMetricMapping(i, 'format', e.target.value)} className="px-2 py-1 text-sm border rounded">
                          <option value="number">number</option>
                          <option value="currency">currency</option>
                          <option value="default">default</option>
                        </select>
                        <input placeholder="suffix" value={m.suffix ?? ''} onChange={(e) => updateMetricMapping(i, 'suffix', e.target.value)} className="w-16 px-2 py-1 text-sm border rounded" />
                        <button type="button" onClick={() => removeMetricMapping(i)} className="text-red-600 px-2 py-1 rounded">삭제</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {displayType === 'bar-chart' && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">차트 종류</label>
                  <select value={chartVariant} onChange={(e) => setChartVariant(e.target.value as BarChartVariant)} className="w-full px-4 py-2 border rounded">
                    <option value="horizontal-bar-stacked">가로 바 (스택형)</option>
                    <option value="vertical-bar-stacked">세로 바 (스택형)</option>
                    <option value="vertical-bar-grouped">세로 바 (그룹형)</option>
                  </select>
                </div>
              )}
              <div className="pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">노출 페이지</label>
                <p className="text-xs text-gray-500 mb-2">이 위젯을 표시할 페이지를 선택하세요.</p>
                <div className="flex flex-wrap gap-2">
                  {WIDGET_PAGE_OPTIONS.map((page) => (
                    <label key={page} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedPages.includes(page)} onChange={() => togglePage(page)} className="rounded border-gray-300 text-primary" />
                      <span className="text-sm text-gray-700">{PAGE_NAMES[page]}</span>
                    </label>
                  ))}
                </div>
                {selectedPages.length === 0 && <p className="text-xs text-amber-600 mt-1">최소 1개 페이지를 선택해주세요.</p>}
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  {mode === 'edit' && onCancel && (
                    <button onClick={onCancel} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      취소
                    </button>
                  )}
                  {mode === 'create' && (
                    <button onClick={() => handleDisplayTypeSelect('action-list')} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      초기화
                    </button>
                  )}
                  <button onClick={handleSave} disabled={!!apiParamsError} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50">
                    <Save size={16} />
                    {mode === 'edit' ? '저장' : '위젯 생성'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 위젯 수정 탭 (동일한 API 경로 + 컬럼 매핑 UI)
function WidgetEditTab({
  widget,
  onSave,
  onCancel
}: {
  widget: SavedWidget
  onSave: (widget: SavedWidget) => void
  onCancel: () => void
}) {
  return (
    <WidgetApiForm
      mode="edit"
      editWidget={widget}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}

// 위젯 생성 탭 (API 경로 직접 입력 + 컬럼 매핑)
function WidgetCreateTab({ onWidgetCreated }: { onWidgetCreated: () => void }) {
  return (
    <WidgetApiForm
      mode="create"
      onSave={() => {
        alert('위젯이 생성되었습니다!')
        onWidgetCreated()
      }}
    />
  )
}
