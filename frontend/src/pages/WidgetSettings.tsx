import { useState } from 'react'
import { Plus, LayoutGrid, Trash2, Edit, Calendar, Users, AlertTriangle, X, Save, Eye, BarChart3 } from 'lucide-react'
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
  type SummaryCardItemDef,
  type SummaryCardIconName,
  type SummaryCardValueFormat,
  type SummaryCardChangeType,
  type BarChartWidgetConfig,
  type BarChartVariant
} from '../types/widget'
import { getDataSourcesForTemplate, getDataSource, type DataSourceSpec } from '../types/datasource'
import {
  mockBarChartMonthlyAum,
  mockBarChartMonthlyAumSeries,
  mockBarChartEventByGrade,
  mockBarChartEventByGradeSeries,
  mockBarChartScenarioCount,
  mockBarChartScenarioCountSeries,
  mockBarChartProductAum,
  mockBarChartProductAumSeries
} from '../data/mockData'
import { BarChartWidget } from '../components/widgets/BarChart'

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

  // 데이터소스 이름 매핑
  const getDataSourceName = (dataSourceId: string): string => {
    const spec = getDataSource(dataSourceId)
    return spec?.name || dataSourceId
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
                      {widget.config.query?.base_table && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                          {widget.config.query.base_table}
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

  // 컬럼 정보: 위젯에 저장된 컬럼 사용
  const columns = widget.config.columns || []

  // 쿼리 정보
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
          {query && (
            <div className="col-span-2">
              <dt className="text-xs text-gray-500 mb-1">데이터 테이블</dt>
              <dd className="text-sm font-medium text-gray-900 font-mono">
                {query.base_table || '(미지정)'}
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

          {/* 쿼리 설정 요약 */}
          {widget.config.query && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-blue-600 font-medium">테이블:</span>{' '}
                  <span className="text-blue-900 font-mono">{widget.config.query.base_table}</span>
                </div>
                {widget.config.query.scenario_filter?.codes && (
                  <div>
                    <span className="text-blue-600 font-medium">시나리오:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.scenario_filter.codes.join(', ')}
                    </span>
                  </div>
                )}
                {widget.config.query.status_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">상태:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.status_filter.join(', ')}
                    </span>
                  </div>
                )}
                {widget.config.query.customer_group_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">고객 그룹:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.customer_group_filter.join(', ')}
                    </span>
                  </div>
                )}
                {widget.config.query.account_type_filter && (
                  <div>
                    <span className="text-blue-600 font-medium">계좌 타입:</span>{' '}
                    <span className="text-blue-900">
                      {widget.config.query.account_type_filter.join(', ')}
                    </span>
                  </div>
                )}
                {widget.config.query.filters && Array.isArray(widget.config.query.filters) && widget.config.query.filters.length > 0 && (
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
                    <td className="px-3 py-2 font-mono text-blue-600">{col.key}</td>
                    <td className="px-3 py-2 text-gray-900">{col.label}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        col.source === 'customer' ? 'bg-purple-100 text-purple-700' :
                        col.source === 'event' ? 'bg-green-100 text-green-700' :
                        col.source === 'scenario' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {col.source}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-600">{col.field}</td>
                    <td className="px-3 py-2">
                      {col.format?.type && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {col.format.type}
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

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
      <LayoutGrid size={48} className="mx-auto mb-2" />
      <p>미리보기를 준비중입니다</p>
    </div>
  )
}


// 위젯 수정 탭
function WidgetEditTab({
  widget,
  onSave,
  onCancel
}: {
  widget: SavedWidget
  onSave: (widget: SavedWidget) => void
  onCancel: () => void
}) {
  const template = widgetTemplates.find(t => t.id === widget.templateId)
  const [widgetTitle, setWidgetTitle] = useState(widget.title)
  const [widgetConfig, setWidgetConfig] = useState(widget.config)
  const [selectedPages, setSelectedPages] = useState<PageType[]>(
    widget.pages && widget.pages.length > 0 ? widget.pages : ['customers']
  )

  const togglePage = (page: PageType) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    )
  }

  // 쿼리 설정 초기화
  const baseDataSource = widgetConfig.dataSource
    ? getDataSource(widgetConfig.dataSource)
    : null

  // 쿼리 설정을 JSON 문자열로 관리
  const initialQuery = widgetConfig.query || baseDataSource?.config.query || {
    base_table: 'customer_scenario_events',
    scenario_filter: {
      codes: []
    },
    filters: [
      {
        column: 'status',
        operator: 'eq',
        value: 'pending'
      }
    ]
  }

  const [queryJson, setQueryJson] = useState(JSON.stringify(initialQuery, null, 2))
  const [queryError, setQueryError] = useState<string | null>(null)

  // 컬럼 설정 (커스터마이징된 컬럼 또는 기본 컬럼)
  const [columns, setColumns] = useState<any[]>(
    widgetConfig.columns || baseDataSource?.config.columns || []
  )

  // 템플릿 초기화 (기본 데이터소스에서 로드)
  const handleLoadTemplate = (dataSourceId: string) => {
    const dataSource = getDataSource(dataSourceId)
    if (dataSource?.config) {
      // 쿼리 설정 초기화
      setQueryJson(JSON.stringify(dataSource.config.query, null, 2))
      setQueryError(null)
      // 컬럼 초기화
      if (dataSource.config.columns) {
        setColumns(dataSource.config.columns.map(col => ({ ...col, filterable: false })))
      }
    }
  }

  // JSON 쿼리 변경 핸들러
  const handleQueryJsonChange = (value: string) => {
    setQueryJson(value)
    try {
      JSON.parse(value)
      setQueryError(null)
    } catch (e) {
      setQueryError('유효하지 않은 JSON 형식입니다')
    }
  }

  // 컬럼 추가
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        key: `col_${columns.length + 1}`,
        label: '새 컬럼',
        source: 'customer',
        field: '',
        sortable: false,
        filterable: false,
        format: { type: 'text' }
      }
    ])
  }

  // 컬럼 삭제
  const handleDeleteColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  // 컬럼 업데이트
  const handleColumnChange = (index: number, field: string, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const handleSave = () => {
    if (!widgetTitle.trim()) {
      alert('위젯 제목을 입력해주세요.')
      return
    }

    const pagesToSave: PageType[] = selectedPages.length > 0 ? selectedPages : (['customers'] as PageType[])

    if (template?.type === 'summary-card') {
      onSave({
        ...widget,
        title: widgetTitle,
        config: {
          table: widgetConfig.table ?? 'summary_card_settings',
          gridCols: widgetConfig.gridCols ?? 4,
          gridRows: widgetConfig.gridRows ?? 1,
          cards: (widgetConfig.cards ?? []).map((c: SummaryCardItemDef) => ({
            metricId: c.metricId,
            title: c.title,
            change: c.change || undefined,
            changeType: c.changeType,
            icon: c.icon,
            iconBg: c.iconBg,
            format: c.format,
            suffix: c.suffix || undefined
          }))
        },
        pages: pagesToSave
      })
      return
    }

    if (template?.type === 'bar-chart') {
      const { _presetKey, ...rest } = widgetConfig as BarChartWidgetConfig & { _presetKey?: string }
      const dataCopy = Array.isArray(rest.data)
        ? rest.data.map((item: { label?: string; values?: number[] }) => ({
            label: String(item?.label ?? ''),
            values: Array.isArray(item?.values) ? [...item.values] : []
          }))
        : []
      onSave({
        ...widget,
        title: widgetTitle,
        config: {
          chartVariant: rest.chartVariant ?? 'vertical-bar-stacked',
          gridWidth: rest.gridWidth ?? 2,
          gridRows: rest.gridRows ?? 1,
          seriesLabels: Array.isArray(rest.seriesLabels) ? [...rest.seriesLabels] : [],
          data: dataCopy
        },
        pages: pagesToSave
      })
      return
    }

    // action-list: JSON 유효성 검증
    let query: any
    try {
      query = JSON.parse(queryJson)
    } catch (e) {
      alert('쿼리 JSON 형식이 올바르지 않습니다. 수정 후 다시 시도해주세요.')
      return
    }
    if (!query.base_table) {
      alert('base_table은 필수 항목입니다.')
      return
    }

    onSave({
      ...widget,
      title: widgetTitle,
      config: {
        ...widgetConfig,
        query,
        columns
      },
      pages: pagesToSave
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 pb-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{template?.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">위젯 수정</h2>
              <p className="text-sm text-gray-500 mt-1">{template?.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* 레이아웃 미리보기 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Eye size={16} />
          레이아웃 미리보기
        </h3>

        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
          {/* 위젯 헤더 */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">{widgetTitle || '위젯 제목'}</h4>
          </div>

          {/* 위젯 콘텐츠 - 레이아웃만 표시 */}
          <div className="p-4">
            {/* 테이블 레이아웃 미리보기 */}
            {template?.type === 'action-list' && columns.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          {col.label}
                          {col.sortable && <span className="ml-1 text-gray-400">↕</span>}
                          {col.filterable && <span className="ml-1 text-blue-500">⊙</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-4 py-3 text-gray-400 italic text-xs">
                          샘플 데이터
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-4 py-3 text-gray-400 italic text-xs">
                          샘플 데이터
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      {columns.map((col, idx) => (
                        <td key={idx} className="px-4 py-3 text-gray-400 italic text-xs">
                          샘플 데이터
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {template?.type === 'summary-card' && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700">
                  요약 카드 <strong>{(widgetConfig.cards ?? []).length}개</strong>
                  {' '}(그리드 {widgetConfig.gridCols ?? 4} × {widgetConfig.gridRows ?? 1})
                </p>
                {(widgetConfig.cards ?? []).length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    {(widgetConfig.cards ?? []).slice(0, 5).map((c: SummaryCardItemDef, i: number) => (
                      <li key={i}>• {c.title || '(제목 없음)'} — {c.metricId || '(카드 타입 미선택)'}</li>
                    ))}
                    {(widgetConfig.cards ?? []).length > 5 && (
                      <li className="text-gray-400">… 외 {(widgetConfig.cards ?? []).length - 5}개</li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {template?.type === 'action-list' && columns.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                컬럼을 추가하면 미리보기가 표시됩니다
              </div>
            )}

            {template?.type === 'bar-chart' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[280px]">
                <BarChartWidget
                  widget={{
                    ...widget,
                    title: widgetTitle || widget.title,
                    config: widgetConfig
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기본 설정 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 설정</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              위젯 제목 *
            </label>
            <input
              type="text"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="예: 만기 고객 목록"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              노출 페이지
            </label>
            <p className="text-xs text-gray-500 mb-2">
              이 위젯을 표시할 페이지를 선택하세요.
            </p>
            <div className="flex flex-wrap gap-2">
              {WIDGET_PAGE_OPTIONS.map((page) => (
                <label
                  key={page}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(page)}
                    onChange={() => togglePage(page)}
                    className="rounded border-gray-300 text-primary"
                  />
                  <span className="text-sm text-gray-700">{PAGE_NAMES[page]}</span>
                </label>
              ))}
            </div>
            {selectedPages.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">최소 1개 페이지를 선택해주세요. (미선택 시 고객관리만 적용)</p>
              )}
            </div>

          {/* 그리드 너비 (페이지에서 차지할 칸 수) - 액션리스트/요약카드 */}
          {(template?.type === 'action-list' || template?.type === 'summary-card') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                그리드 너비 (페이지 칸 수)
              </label>
              <select
                value={widgetConfig.gridWidth ?? template?.gridSize?.width ?? (template?.type === 'summary-card' ? 2 : 3)}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, gridWidth: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="1">1칸 (좁음)</option>
                <option value="2">2칸 (중간)</option>
                <option value="3">3칸 (넓음)</option>
                <option value="4">4칸 (매우 넓음)</option>
                <option value="5">5칸 (전체 너비)</option>
              </select>
            </div>
          )}

          {/* 바 차트: 비율(2:1 / 1:2) + 차트 종류 + 데이터 프리셋 (생성/수정 공통) */}
          {template?.type === 'bar-chart' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  위젯 비율 (사이즈)
                </label>
                <select
                  value={
                    (widgetConfig.gridRows ?? 1) >= 2
                      ? '1:2'
                      : '2:1'
                  }
                  onChange={(e) => {
                    const ratio = e.target.value
                    if (ratio === '2:1') {
                      setWidgetConfig({ ...widgetConfig, gridWidth: 2, gridRows: 1 })
                    } else {
                      setWidgetConfig({ ...widgetConfig, gridWidth: 1, gridRows: 2 })
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="2:1">2:1 (가로 넓음 · 2칸 × 1행)</option>
                  <option value="1:2">1:2 (세로 길음 · 1칸 × 2행)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  차트 종류
                </label>
                <select
                  value={(widgetConfig as BarChartWidgetConfig).chartVariant ?? 'vertical-bar-stacked'}
                  onChange={(e) =>
                    setWidgetConfig({
                      ...widgetConfig,
                      chartVariant: e.target.value as BarChartVariant
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="horizontal-bar-stacked">가로 바 차트 (스택형)</option>
                  <option value="vertical-bar-stacked">세로 바 차트 (스택형)</option>
                  <option value="vertical-bar-grouped">세로 바 차트 (그룹형)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 (목 데이터 프리셋)
                </label>
                <select
                  value={(widgetConfig as BarChartWidgetConfig & { _presetKey?: string })._presetKey ?? 'monthly-aum'}
                  onChange={(e) => {
                    const key = e.target.value
                    const next: BarChartWidgetConfig & { _presetKey?: string } = { ...widgetConfig, _presetKey: key }
                    if (key === 'monthly-aum') {
                      next.data = mockBarChartMonthlyAum
                      next.seriesLabels = mockBarChartMonthlyAumSeries
                    } else if (key === 'event-by-grade') {
                      next.data = mockBarChartEventByGrade
                      next.seriesLabels = mockBarChartEventByGradeSeries
                    } else if (key === 'scenario-count') {
                      next.data = mockBarChartScenarioCount
                      next.seriesLabels = mockBarChartScenarioCountSeries
                    } else if (key === 'product-aum') {
                      next.data = mockBarChartProductAum
                      next.seriesLabels = mockBarChartProductAumSeries
                    }
                    setWidgetConfig(next)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="monthly-aum">월별 AUM 추이 (예금/펀드/주식)</option>
                  <option value="event-by-grade">고객등급별 이벤트 건수</option>
                  <option value="scenario-count">시나리오 유형별 건수</option>
                  <option value="product-aum">상품별 AUM 비중</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  리스트형 데이터: 라벨 + 시리즈 값 배열. 추후 데이터소스 연동 가능.
                </p>
              </div>
            </>
          )}

          {/* 요약카드: 그리드 */}
          {template?.type === 'summary-card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 테이블 (value, description) *
                </label>
                <input
                  type="text"
                  value={widgetConfig.table ?? 'summary_card_settings'}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, table: e.target.value.trim() || undefined })}
                  placeholder="예: summary_card_settings"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  테이블: value = 메인 숫자, description = 부가설명(change). wm_id, card_type 필요. 변경 가능.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그리드 가로 개수 (gridCols) *
                  </label>
                  <select
                    value={String(widgetConfig.gridCols ?? 4)}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, gridCols: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}칸</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그리드 세로 개수 (gridRows) *
                  </label>
                  <select
                    value={String(widgetConfig.gridRows ?? 1)}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, gridRows: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n}행</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* 템플릿 불러오기 (선택사항) */}
          {template?.type === 'action-list' && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                템플릿 불러오기 (선택)
              </label>
              <div className="flex gap-2">
                <select
                  onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  defaultValue=""
                >
                  <option value="">기본 템플릿에서 불러오기...</option>
                  {getDataSourcesForTemplate(template.id)
                    .filter(ds => ds.category === 'customer-event')
                    .map(ds => (
                      <option key={ds.id} value={ds.id}>
                        {ds.name}
                      </option>
                    ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                기본 템플릿을 선택하면 쿼리와 컬럼 설정이 자동으로 채워집니다
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 쿼리 설정 (JSON 에디터) */}
      {template?.type === 'action-list' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">쿼리 설정 (JSON)</h3>
            <button
              onClick={() => {
                const formatted = JSON.stringify(JSON.parse(queryJson), null, 2)
                setQueryJson(formatted)
              }}
              disabled={queryError !== null}
              className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              포맷 정리
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query JSON *
              </label>
              <textarea
                value={queryJson}
                onChange={(e) => handleQueryJsonChange(e.target.value)}
                className={`w-full px-4 py-3 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  queryError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
                rows={15}
                spellCheck={false}
              />
              {queryError && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {queryError}
                </p>
              )}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 <strong>필터 사용법:</strong> <code>filters</code> 배열에 동적 필터를 추가할 수 있습니다.
                  자세한 내용은 <code>frontend/FILTER_GUIDE.md</code> 문서를 참조하세요.
                </p>
              </div>
            </div>

            {/* 템플릿 예시 - 1개만 유지 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-xs font-semibold text-blue-900 mb-2">쿼리 JSON 템플릿 예시 (동적 필터)</h4>
              <details className="mt-3">
                <summary className="text-xs font-medium text-blue-800 cursor-pointer hover:text-blue-900">
                  customer_scenario_events - 기본 예시
                </summary>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
{`{
  "base_table": "customer_scenario_events",
  "scenario_filter": {
    "codes": ["DEPOSIT_MATURITY", "FUND_MATURITY"]
  },
  "filters": [
    {
      "column": "status",
      "operator": "in",
      "value": ["pending", "contacted"]
    }
  ]
}`}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* 컬럼 설정 그리드 */}
      {template?.type === 'action-list' && columns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">컬럼 설정</h3>
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              컬럼 추가
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">키</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">라벨</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">소스</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">필드 경로</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">포맷</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">정렬</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">필터</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {columns.map((col, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.key}
                        onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={col.source}
                        onChange={(e) => handleColumnChange(index, 'source', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="customer">customer</option>
                        <option value="event">event</option>
                        <option value="scenario">scenario</option>
                        <option value="account">account</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={col.field}
                        onChange={(e) => handleColumnChange(index, 'field', e.target.value)}
                        placeholder="예: name, event_data.principal"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={col.format?.type || 'text'}
                        onChange={(e) => handleColumnChange(index, 'format', { type: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="text">없음</option>
                        <option value="currency">currency</option>
                        <option value="date">date</option>
                        <option value="badge">badge</option>
                        <option value="number">number</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={col.sortable || false}
                        onChange={(e) => handleColumnChange(index, 'sortable', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={col.filterable || false}
                        onChange={(e) => handleColumnChange(index, 'filterable', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDeleteColumn(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-900 mb-2">컬럼 설정 가이드</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>필드 경로</strong>: 데이터베이스에서 가져올 필드 (예: name, event_data.principal)</li>
              <li>• <strong>포맷</strong>: 화면 표시 형식 (currency: 금액, date: 날짜, badge: 뱃지)</li>
              <li>• <strong>정렬</strong>: 사용자가 컬럼 헤더를 클릭하여 정렬 가능</li>
              <li>• <strong>필터</strong>: 컬럼별로 필터링 기능 활성화</li>
            </ul>
          </div>
        </div>
      )}

      {/* 요약카드: 카드 설정 */}
      {template?.type === 'summary-card' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">카드 설정</h3>
            <button
              type="button"
              onClick={() => setWidgetConfig({
                ...widgetConfig,
                cards: [...(widgetConfig.cards ?? []), {
                  metricId: '',
                  title: '',
                  change: '',
                  changeType: 'neutral' as SummaryCardChangeType,
                  icon: 'Users' as SummaryCardIconName,
                  format: 'default' as SummaryCardValueFormat,
                  suffix: ''
                }]
              })}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              카드 추가
            </button>
          </div>

          {(widgetConfig.cards ?? []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">카드 타입</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">제목</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">description (부가설명, DB 없을 때만)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">변동 타입</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">아이콘</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">포맷</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">접미사</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(widgetConfig.cards ?? []).map((card: SummaryCardItemDef, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={card.metricId}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, metricId: e.target.value.trim() }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          placeholder="테이블에서 가져올 값 (예: metric-customers)"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                          title="테이블의 card_type 컬럼 값으로 부가설명 조회"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, title: e.target.value }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          placeholder="카드 제목"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={card.change ?? ''}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, change: e.target.value || undefined }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          placeholder="테이블.description 없을 때만 사용 (value=메인 숫자, description=부가설명)"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={card.changeType ?? 'neutral'}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, changeType: e.target.value as SummaryCardChangeType }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="neutral">neutral</option>
                          <option value="positive">positive</option>
                          <option value="negative">negative</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={card.icon ?? 'Users'}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, icon: e.target.value as SummaryCardIconName }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          {(['Users', 'TrendingUp', 'Calendar', 'AlertTriangle', 'DollarSign', 'Target'] as SummaryCardIconName[]).map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={card.format ?? 'default'}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, format: e.target.value as SummaryCardValueFormat }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="default">default</option>
                          <option value="number">number</option>
                          <option value="currency">currency</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={card.suffix ?? ''}
                          onChange={(e) => {
                            const cards = [...(widgetConfig.cards ?? [])]
                            cards[index] = { ...card, suffix: e.target.value || undefined }
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          placeholder="명, 건"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const cards = (widgetConfig.cards ?? []).filter((_: SummaryCardItemDef, i: number) => i !== index)
                            setWidgetConfig({ ...widgetConfig, cards })
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
              "카드 추가" 버튼으로 표시할 카드를 추가하세요
            </div>
          )}
        </div>
      )}

      {/* 설정 요약 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">설정 요약</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-700 mb-1">위젯 제목</dt>
              <dd className="text-gray-900">{widgetTitle || '(미입력)'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700 mb-1">노출 페이지</dt>
              <dd className="text-gray-900">
                {selectedPages.length > 0
                  ? selectedPages.map((p) => PAGE_NAMES[p]).join(', ')
                  : '고객관리 (미선택 시 기본)'}
              </dd>
            </div>
            {template?.type === 'summary-card' ? (
              <>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">그리드 너비 (페이지 칸 수)</dt>
                  <dd className="text-gray-900">{widgetConfig.gridWidth ?? 2}칸</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">데이터 테이블 (value, description)</dt>
                  <dd className="text-gray-900 font-mono text-xs">{widgetConfig.table ?? 'summary_card_settings'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">그리드</dt>
                  <dd className="text-gray-900">{widgetConfig.gridCols ?? 4} × {widgetConfig.gridRows ?? 1}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">카드 개수</dt>
                  <dd className="text-gray-900">{(widgetConfig.cards ?? []).length}개</dd>
                </div>
              </>
            ) : template?.type === 'bar-chart' ? (
              <>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">사이즈 (비율)</dt>
                  <dd className="text-gray-900">
                    {(widgetConfig.gridRows ?? 1) >= 2 ? '1:2 (1칸 × 2행)' : '2:1 (2칸 × 1행)'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">차트 종류</dt>
                  <dd className="text-gray-900">
                    {(widgetConfig as BarChartWidgetConfig).chartVariant === 'horizontal-bar-stacked'
                      ? '가로 바 (스택형)'
                      : (widgetConfig as BarChartWidgetConfig).chartVariant === 'vertical-bar-grouped'
                        ? '세로 바 (그룹형)'
                        : '세로 바 (스택형)'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">데이터</dt>
                  <dd className="text-gray-900">{(widgetConfig.data ?? []).length}개 항목 (리스트형)</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">그리드 너비</dt>
                  <dd className="text-gray-900">{widgetConfig.gridWidth || template?.gridSize.width}칸</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">데이터 테이블</dt>
                  <dd className="text-gray-900 font-mono text-xs">
                    {(() => {
                      try {
                        const query = JSON.parse(queryJson)
                        return query.base_table || '(미지정)'
                      } catch {
                        return '(유효하지 않은 JSON)'
                      }
                    })()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700 mb-1">컬럼 개수</dt>
                  <dd className="text-gray-900">{columns.length}개</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-medium text-gray-700 mb-1">쿼리 필터</dt>
                  <dd className="text-gray-900 font-mono text-xs max-h-20 overflow-y-auto">
                    {(() => {
                      try {
                        const query = JSON.parse(queryJson)
                        const { base_table, ...filters } = query
                        return Object.keys(filters).length > 0
                          ? JSON.stringify(filters, null, 2)
                          : '(필터 없음)'
                      } catch {
                        return '(유효하지 않은 JSON)'
                      }
                    })()}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* 저장/취소 버튼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={template?.type === 'action-list' && queryError !== null}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            저장
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

// 위젯 생성 탭
function WidgetCreateTab({ onWidgetCreated }: { onWidgetCreated: () => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null)
  const [widgetTitle, setWidgetTitle] = useState('')
  const [widgetConfig, setWidgetConfig] = useState<any>({})
  const [selectedPages, setSelectedPages] = useState<PageType[]>(['customers'])

  // 쿼리 설정을 JSON 문자열로 관리
  const initialQuery = {
    base_table: 'customer_scenario_events', 
    filters: [
      {
        column: 'status',
        operator: 'eq',
        value: 'pending'
      }
    ]
  }

  const [queryJson, setQueryJson] = useState(JSON.stringify(initialQuery, null, 2))
  const [queryError, setQueryError] = useState<string | null>(null)

  // 컬럼 설정
  const [columns, setColumns] = useState<any[]>([])

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template)
    setWidgetTitle('')
    setSelectedPages(['customers'])
    if (template.type === 'summary-card') {
      setWidgetConfig({ table: 'summary_card_settings', gridWidth: 2, gridCols: 4, gridRows: 1, cards: [] })
    } else if (template.type === 'bar-chart') {
      const preset = template.sizePresets?.[0] ?? { width: 2, height: 1 }
      setWidgetConfig({
        chartVariant: 'vertical-bar-stacked',
        gridWidth: preset.width,
        gridRows: preset.height,
        seriesLabels: mockBarChartMonthlyAumSeries,
        data: mockBarChartMonthlyAum
      })
    } else {
      setWidgetConfig({})
    }
    setQueryJson(JSON.stringify(initialQuery, null, 2))
    setQueryError(null)
    setColumns([])
  }

  const togglePage = (page: PageType) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    )
  }

  // 템플릿 초기화 (기본 데이터소스에서 로드)
  const handleLoadTemplate = (dataSourceId: string) => {
    const dataSource = getDataSource(dataSourceId)
    if (dataSource?.config) {
      // 쿼리 설정 초기화
      setQueryJson(JSON.stringify(dataSource.config.query, null, 2))
      setQueryError(null)
      // 컬럼 초기화
      if (dataSource.config.columns) {
        setColumns(dataSource.config.columns.map(col => ({ ...col, filterable: false })))
      }
    }
  }

  // JSON 쿼리 변경 핸들러
  const handleQueryJsonChange = (value: string) => {
    setQueryJson(value)
    try {
      JSON.parse(value)
      setQueryError(null)
    } catch (e) {
      setQueryError('유효하지 않은 JSON 형식입니다')
    }
  }

  // 컬럼 추가
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        key: `col_${columns.length + 1}`,
        label: '새 컬럼',
        source: 'customer',
        field: '',
        sortable: false,
        filterable: false,
        format: { type: 'text' }
      }
    ])
  }

  // 컬럼 삭제
  const handleDeleteColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  // 컬럼 업데이트
  const handleColumnChange = (index: number, field: string, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const handleSave = () => {
    if (!selectedTemplate || !widgetTitle.trim()) {
      alert('템플릿과 위젯 제목을 입력해주세요.')
      return
    }

    const pagesToSave: PageType[] = selectedPages.length > 0 ? selectedPages : (['customers'] as PageType[])

    if (selectedTemplate.type === 'summary-card') {
      saveWidget({
        templateId: selectedTemplate.id,
        title: widgetTitle,
        config: {
          table: widgetConfig.table ?? 'summary_card_settings',
          gridWidth: widgetConfig.gridWidth ?? 2,
          gridCols: widgetConfig.gridCols ?? 4,
          gridRows: widgetConfig.gridRows ?? 1,
          cards: (widgetConfig.cards ?? []).map((c: SummaryCardItemDef) => ({
            metricId: c.metricId,
            title: c.title,
            change: c.change || undefined,
            changeType: c.changeType,
            icon: c.icon,
            iconBg: c.iconBg,
            format: c.format,
            suffix: c.suffix || undefined
          }))
        },
        pages: pagesToSave
      })
    } else if (selectedTemplate.type === 'bar-chart') {
      const { _presetKey, ...barConfig } = widgetConfig as BarChartWidgetConfig & { _presetKey?: string }
      const dataCopy = Array.isArray(barConfig.data)
        ? barConfig.data.map((item: { label?: string; values?: number[] }) => ({
            label: String(item?.label ?? ''),
            values: Array.isArray(item?.values) ? [...item.values] : []
          }))
        : []
      saveWidget({
        templateId: selectedTemplate.id,
        title: widgetTitle,
        config: {
          chartVariant: barConfig.chartVariant ?? 'vertical-bar-stacked',
          gridWidth: barConfig.gridWidth ?? 2,
          gridRows: barConfig.gridRows ?? 1,
          seriesLabels: Array.isArray(barConfig.seriesLabels) ? [...barConfig.seriesLabels] : [],
          data: dataCopy
        },
        pages: pagesToSave
      })
    } else {
      // action-list: JSON 유효성 검증
      let query: any
      try {
        query = JSON.parse(queryJson)
      } catch (e) {
        alert('쿼리 JSON 형식이 올바르지 않습니다. 수정 후 다시 시도해주세요.')
        return
      }
      if (!query.base_table) {
        alert('base_table은 필수 항목입니다.')
        return
      }
      saveWidget({
        templateId: selectedTemplate.id,
        title: widgetTitle,
        config: {
          ...widgetConfig,
          query,
          columns
        },
        pages: pagesToSave
      })
    }

    alert('위젯이 생성되었습니다!')
    setSelectedTemplate(null)
    setWidgetTitle('')
    setWidgetConfig({})
    setSelectedPages(['customers'])
    setQueryJson(JSON.stringify(initialQuery, null, 2))
    setColumns([])
    onWidgetCreated()
  }

  return (
    <div className="flex gap-6 h-full">
      {/* 좌측: 템플릿 리스트 */}
      <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">템플릿 선택</h3>
            <p className="text-sm text-gray-500 mt-1">
              총 {widgetTemplates.length}개
            </p>
          </div>

          {/* 템플릿 리스트 */}
          <div className="flex-1 overflow-y-auto">
            {widgetTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${
                        isSelected ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {template.gridSize.width}칸 × {template.gridSize.height}칸
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 우측: 위젯 설정 */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {selectedTemplate ? (
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedTemplate.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            {/* 설정 폼 - 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위젯 제목 *
              </label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="예: 만기 고객 목록"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                노출 페이지
              </label>
              <p className="text-xs text-gray-500 mb-2">
                이 위젯을 표시할 페이지를 선택하세요. 하나 이상 선택해야 해당 페이지에 노출됩니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {WIDGET_PAGE_OPTIONS.map((page) => (
                  <label
                    key={page}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page)}
                      onChange={() => togglePage(page)}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="text-sm text-gray-700">{PAGE_NAMES[page]}</span>
                  </label>
                ))}
              </div>
              {selectedPages.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">최소 1개 페이지를 선택해주세요. (미선택 시 고객관리만 적용)</p>
              )}
            </div>

            {/* 템플릿별 추가 설정 */}
            {selectedTemplate.type === 'action-list' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그리드 너비
                  </label>
                  <select
                    value={widgetConfig.gridWidth || selectedTemplate.gridSize.width}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, gridWidth: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="1">1칸 (좁음)</option>
                    <option value="2">2칸 (중간)</option>
                    <option value="3">3칸 (넓음)</option>
                    <option value="4">4칸 (매우 넓음)</option>
                    <option value="5">5칸 (전체 너비)</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    템플릿 불러오기 (선택)
                  </label>
                  <select
                    onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    defaultValue=""
                  >
                    <option value="">기본 템플릿에서 불러오기...</option>
                    {getDataSourcesForTemplate(selectedTemplate.id)
                      .filter(ds => ds.category === 'customer-event')
                      .map(ds => (
                        <option key={ds.id} value={ds.id}>
                          {ds.name}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    기본 템플릿을 선택하면 쿼리와 컬럼 설정이 자동으로 채워집니다
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Query JSON *
                    </label>
                    <button
                      onClick={() => {
                        try {
                          const formatted = JSON.stringify(JSON.parse(queryJson), null, 2)
                          setQueryJson(formatted)
                        } catch (e) {}
                      }}
                      disabled={queryError !== null}
                      className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      포맷 정리
                    </button>
                  </div>
                  <textarea
                    value={queryJson}
                    onChange={(e) => handleQueryJsonChange(e.target.value)}
                    className={`w-full px-4 py-3 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      queryError
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    rows={12}
                    spellCheck={false}
                  />
                  {queryError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {queryError}
                    </p>
                  )}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 mb-2">
                      💡 <strong>필터 사용법:</strong> <code>filters</code> 배열에 동적 필터를 추가할 수 있습니다.
                      자세한 내용은 <code>frontend/FILTER_GUIDE.md</code> 문서를 참조하세요.
                    </p>
                    <details className="mt-2">
                      <summary className="text-xs font-medium text-blue-800 cursor-pointer hover:text-blue-900">
                        customer_scenario_events - 기본 예시
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
{`{
  "base_table": "customer_scenario_events",
  "scenario_filter": {
    "codes": ["DEPOSIT_MATURITY", "FUND_MATURITY"]
  },
  "filters": [
    {
      "column": "status",
      "operator": "in",
      "value": ["pending", "contacted"]
    }
  ]
}`}
                      </pre>
                    </details>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      컬럼 설정
                    </label>
                    <button
                      onClick={handleAddColumn}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      컬럼 추가
                    </button>
                  </div>

                  {columns.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">키</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">라벨</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">소스</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">필드</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">포맷</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-500 border-b">정렬</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-500 border-b">필터</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-500 border-b">삭제</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {columns.map((col, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={col.key}
                                  onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={col.label}
                                  onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={col.source}
                                  onChange={(e) => handleColumnChange(index, 'source', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="customer">customer</option>
                                  <option value="event">event</option>
                                  <option value="scenario">scenario</option>
                                  <option value="account">account</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={col.field}
                                  onChange={(e) => handleColumnChange(index, 'field', e.target.value)}
                                  placeholder="name"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={col.format?.type || 'text'}
                                  onChange={(e) => handleColumnChange(index, 'format', { type: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="text">없음</option>
                                  <option value="currency">currency</option>
                                  <option value="date">date</option>
                                  <option value="badge">badge</option>
                                  <option value="number">number</option>
                                </select>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={col.sortable || false}
                                  onChange={(e) => handleColumnChange(index, 'sortable', e.target.checked)}
                                  className="rounded border-gray-300 text-primary"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={col.filterable || false}
                                  onChange={(e) => handleColumnChange(index, 'filterable', e.target.checked)}
                                  className="rounded border-gray-300 text-primary"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  onClick={() => handleDeleteColumn(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                      "컬럼 추가" 버튼 클릭 또는 "템플릿 불러오기" 사용
                    </div>
                  )}
                </div>

                {/* 레이아웃 미리보기 */}
                {columns.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">레이아웃 미리보기</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {columns.map((col, idx) => (
                              <th key={idx} className="px-3 py-2 text-left font-medium text-gray-600">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            {columns.map((col, idx) => (
                              <td key={idx} className="px-3 py-2 text-gray-400">
                                샘플 데이터
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-100">
                            {columns.map((col, idx) => (
                              <td key={idx} className="px-3 py-2 text-gray-400">
                                샘플 데이터
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 설정 요약 */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">설정 요약</h4>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">위젯 제목</dt>
                        <dd className="text-gray-900">{widgetTitle || '(미입력)'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">그리드 너비</dt>
                        <dd className="text-gray-900">{widgetConfig.gridWidth || selectedTemplate.gridSize.width}칸</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">데이터 테이블</dt>
                        <dd className="text-gray-900 font-mono text-xs">
                          {(() => {
                            try {
                              const query = JSON.parse(queryJson)
                              return query.base_table || '(미지정)'
                            } catch {
                              return '(유효하지 않은 JSON)'
                            }
                          })()}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">컬럼 개수</dt>
                        <dd className="text-gray-900">{columns.length}개</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-medium text-gray-700 mb-1">쿼리 필터</dt>
                        <dd className="text-gray-900 font-mono text-xs max-h-20 overflow-y-auto">
                          {(() => {
                            try {
                              const query = JSON.parse(queryJson)
                              const { base_table, ...filters } = query
                              return Object.keys(filters).length > 0
                                ? JSON.stringify(filters, null, 2)
                                : '(필터 없음)'
                            } catch {
                              return '(유효하지 않은 JSON)'
                            }
                          })()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            )}

            {selectedTemplate.type === 'bar-chart' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위젯 비율 (사이즈)
                  </label>
                  <select
                    value={(widgetConfig.gridRows ?? 1) >= 2 ? '1:2' : '2:1'}
                    onChange={(e) => {
                      if (e.target.value === '2:1') {
                        setWidgetConfig({ ...widgetConfig, gridWidth: 2, gridRows: 1 })
                      } else {
                        setWidgetConfig({ ...widgetConfig, gridWidth: 1, gridRows: 2 })
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="2:1">2:1 (가로 넓음 · 2칸 × 1행)</option>
                    <option value="1:2">1:2 (세로 길음 · 1칸 × 2행)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    차트 종류
                  </label>
                  <select
                    value={(widgetConfig as BarChartWidgetConfig).chartVariant ?? 'vertical-bar-stacked'}
                    onChange={(e) =>
                      setWidgetConfig({ ...widgetConfig, chartVariant: e.target.value as BarChartVariant })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="horizontal-bar-stacked">가로 바 차트 (스택형)</option>
                    <option value="vertical-bar-stacked">세로 바 차트 (스택형)</option>
                    <option value="vertical-bar-grouped">세로 바 차트 (그룹형)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    데이터 (목 데이터 프리셋)
                  </label>
                  <select
                    value={(widgetConfig as BarChartWidgetConfig & { _presetKey?: string })._presetKey ?? 'monthly-aum'}
                    onChange={(e) => {
                      const key = e.target.value
                      const next: BarChartWidgetConfig & { _presetKey?: string } = { ...widgetConfig, _presetKey: key }
                      if (key === 'monthly-aum') {
                        next.data = mockBarChartMonthlyAum
                        next.seriesLabels = mockBarChartMonthlyAumSeries
                      } else if (key === 'event-by-grade') {
                        next.data = mockBarChartEventByGrade
                        next.seriesLabels = mockBarChartEventByGradeSeries
                      } else if (key === 'scenario-count') {
                        next.data = mockBarChartScenarioCount
                        next.seriesLabels = mockBarChartScenarioCountSeries
                      } else if (key === 'product-aum') {
                        next.data = mockBarChartProductAum
                        next.seriesLabels = mockBarChartProductAumSeries
                      }
                      setWidgetConfig(next)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="monthly-aum">월별 AUM 추이 (예금/펀드/주식)</option>
                    <option value="event-by-grade">고객등급별 이벤트 건수</option>
                    <option value="scenario-count">시나리오 유형별 건수</option>
                    <option value="product-aum">상품별 AUM 비중</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    리스트형 데이터. 추후 데이터소스 연동 가능.
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">미리보기</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[280px]">
                    <BarChartWidget
                      widget={{
                        id: 'preview',
                        templateId: 'bar-chart',
                        title: widgetTitle || '바 차트',
                        config: widgetConfig,
                        createdAt: '',
                        updatedAt: ''
                      }}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">설정 요약</h4>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">위젯 제목</dt>
                        <dd className="text-gray-900">{widgetTitle || '(미입력)'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">사이즈</dt>
                        <dd className="text-gray-900">
                          {(widgetConfig.gridRows ?? 1) >= 2 ? '1:2 (1칸 × 2행)' : '2:1 (2칸 × 1행)'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">차트 종류</dt>
                        <dd className="text-gray-900">
                          {(widgetConfig as BarChartWidgetConfig).chartVariant === 'horizontal-bar-stacked'
                            ? '가로 바 (스택형)'
                            : (widgetConfig as BarChartWidgetConfig).chartVariant === 'vertical-bar-grouped'
                              ? '세로 바 (그룹형)'
                              : '세로 바 (스택형)'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">데이터</dt>
                        <dd className="text-gray-900">{(widgetConfig.data ?? []).length}개 항목</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            )}

            {selectedTemplate.type === 'summary-card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    데이터 테이블 (value, description) *
                  </label>
                  <input
                    type="text"
                    value={widgetConfig.table ?? 'summary_card_settings'}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, table: e.target.value.trim() || undefined })}
                    placeholder="예: summary_card_settings"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    테이블: value = 메인 숫자, description = 부가설명(change). wm_id, card_type 필요. 변경 가능.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그리드 너비 (페이지 칸 수)
                  </label>
                  <select
                    value={widgetConfig.gridWidth ?? selectedTemplate.gridSize.width ?? 2}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, gridWidth: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="1">1칸 (좁음)</option>
                    <option value="2">2칸 (중간)</option>
                    <option value="3">3칸 (넓음)</option>
                    <option value="4">4칸 (매우 넓음)</option>
                    <option value="5">5칸 (전체 너비)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      그리드 가로 개수 (gridCols) *
                    </label>
                    <select
                      value={String(widgetConfig.gridCols ?? 4)}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, gridCols: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}칸</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      그리드 세로 개수 (gridRows) *
                    </label>
                    <select
                      value={String(widgetConfig.gridRows ?? 1)}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, gridRows: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n}>{n}행</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      카드 설정 *
                    </label>
                    <button
                      type="button"
                      onClick={() => setWidgetConfig({
                        ...widgetConfig,
                        cards: [...(widgetConfig.cards ?? []), {
                          metricId: '',
                          title: '',
                          change: '',
                          changeType: 'neutral' as SummaryCardChangeType,
                          icon: 'Users' as SummaryCardIconName,
                          format: 'default' as SummaryCardValueFormat,
                          suffix: ''
                        }]
                      })}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      카드 추가
                    </button>
                  </div>

                  {(widgetConfig.cards ?? []).length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">카드 타입</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">제목</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">description (부가설명, DB 없을 때만)</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">변동 타입</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">아이콘</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">포맷</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-500 border-b">접미사</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-500 border-b">삭제</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(widgetConfig.cards ?? []).map((card: SummaryCardItemDef, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={card.metricId}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, metricId: e.target.value.trim() }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  placeholder="테이블에서 가져올 값 (예: metric-customers)"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                  title="테이블의 card_type 컬럼 값으로 부가설명 조회"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, title: e.target.value }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  placeholder="카드 제목"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={card.change ?? ''}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, change: e.target.value || undefined }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  placeholder="테이블.description 없을 때만 사용 (value=메인 숫자, description=부가설명)"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={card.changeType ?? 'neutral'}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, changeType: e.target.value as SummaryCardChangeType }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="neutral">neutral</option>
                                  <option value="positive">positive</option>
                                  <option value="negative">negative</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={card.icon ?? 'Users'}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, icon: e.target.value as SummaryCardIconName }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  {(['Users', 'TrendingUp', 'Calendar', 'AlertTriangle', 'DollarSign', 'Target'] as SummaryCardIconName[]).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  value={card.format ?? 'default'}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, format: e.target.value as SummaryCardValueFormat }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                >
                                  <option value="default">default</option>
                                  <option value="number">number</option>
                                  <option value="currency">currency</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={card.suffix ?? ''}
                                  onChange={(e) => {
                                    const cards = [...(widgetConfig.cards ?? [])]
                                    cards[index] = { ...card, suffix: e.target.value || undefined }
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  placeholder="명, 건"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cards = (widgetConfig.cards ?? []).filter((_: SummaryCardItemDef, i: number) => i !== index)
                                    setWidgetConfig({ ...widgetConfig, cards })
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                      "카드 추가" 버튼으로 표시할 카드를 추가하세요
                    </div>
                  )}
                </div>

                {/* 요약카드 설정 요약 */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">설정 요약</h4>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">위젯 제목</dt>
                        <dd className="text-gray-900">{widgetTitle || '(미입력)'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">그리드 너비 (페이지 칸 수)</dt>
                        <dd className="text-gray-900">{widgetConfig.gridWidth ?? 2}칸</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">데이터 테이블 (value, description)</dt>
                        <dd className="text-gray-900 font-mono text-xs">{widgetConfig.table ?? 'summary_card_settings'}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">그리드</dt>
                        <dd className="text-gray-900">{widgetConfig.gridCols ?? 4} × {widgetConfig.gridRows ?? 1}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700 mb-1">카드 개수</dt>
                        <dd className="text-gray-900">{(widgetConfig.cards ?? []).length}개</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </>
            )}
              </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedTemplate?.type === 'action-list' && queryError !== null}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  위젯 생성
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <LayoutGrid size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">템플릿을 선택하세요</p>
              <p className="text-sm mt-2">좌측에서 생성할 위젯 템플릿을 선택해주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
