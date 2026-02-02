import { useEffect, useState, useMemo } from 'react'
import { GripVertical, ChevronUp, ChevronDown, Check, LayoutGrid, Settings2, X } from 'lucide-react'
import { DynamicActionListWidget } from '../components/widgets/DynamicActionListWidget'
import { SummaryCardWidget } from '../components/widgets/SummaryCard'
import { BarChartWidget } from '../components/widgets/BarChart'
import {
  initializeDefaultWidgets,
  loadSavedWidgets,
  widgetTemplates,
  getPageWidgetSelection,
  setPageWidgetSelection,
  type SavedWidget,
  type PageType
} from '../types/widget'

const CUSTOMERS_PAGE: PageType = 'customers'

/** 고객관리 페이지용 위젯만 필터 (customer 용으로만 만든 위젯) */
function getAvailableWidgetsForCustomers(): SavedWidget[] {
  return loadSavedWidgets()
    .filter((w) => !w.pages || w.pages.length === 0 || w.pages.includes('customers'))
    .sort((a, b) => (a.config?.order ?? 999) - (b.config?.order ?? 999))
}

/** 위젯 선택 모달: 리스트에서 선택·순서 지정 후 배치 */
function WidgetSelectModal({
  availableWidgets,
  initialSelectedIds,
  onSave,
  onClose
}: {
  availableWidgets: SavedWidget[]
  initialSelectedIds: string[]
  onSave: (widgetIds: string[]) => void
  onClose: () => void
}) {
  const validInitial = initialSelectedIds.filter((id) => availableWidgets.some((w) => w.id === id))
  const [selectedIds, setSelectedIds] = useState<string[]>(validInitial.length > 0 ? validInitial : availableWidgets.map((w) => w.id))

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const move = (index: number, direction: 'up' | 'down') => {
    const next = direction === 'up' ? index - 1 : index + 1
    if (next < 0 || next >= selectedIds.length) return
    setSelectedIds((prev) => {
      const arr = [...prev]
      ;[arr[index], arr[next]] = [arr[next], arr[index]]
      return arr
    })
  }

  const selectedOrdered = selectedIds.map((id) => availableWidgets.find((w) => w.id === id)).filter(Boolean) as SavedWidget[]
  const unselected = availableWidgets.filter((w) => !selectedIds.includes(w.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">위젯 선택</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>
        <p className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          고객관리 페이지에 표시할 위젯을 선택하고 순서를 정하세요.
        </p>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedOrdered.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">배치할 위젯 (순서)</p>
              <ul className="space-y-1">
                {selectedOrdered.map((w, i) => (
                  <li key={w.id} className="flex items-center gap-2 py-2 px-3 bg-primary/5 rounded-lg border border-primary/20">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggle(w.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-900">{w.title}</span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => move(i, 'up')} disabled={i === 0} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40">
                        <ChevronUp size={16} />
                      </button>
                      <button type="button" onClick={() => move(i, 'down')} disabled={i === selectedOrdered.length - 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {unselected.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">선택 해제된 위젯</p>
              <ul className="space-y-1">
                {unselected.map((w) => (
                  <li key={w.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggle(w.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="flex-1 text-sm text-gray-600">{w.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            취소
          </button>
          <button
            type="button"
            onClick={() => onSave(selectedIds)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  )
}

export function Customers() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isEditLayout, setIsEditLayout] = useState(false)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)

  useEffect(() => {
    initializeDefaultWidgets()
  }, [])

  const availableWidgets = useMemo(() => getAvailableWidgetsForCustomers(), [refreshKey])
  const selectionIds = getPageWidgetSelection(CUSTOMERS_PAGE)

  // 배치할 위젯: 선택이 있으면 선택된 ID 순서로, 없으면 전체(기본 순서)
  const pageWidgets = useMemo(() => {
    if (selectionIds && selectionIds.length > 0) {
      const byId = new Map(availableWidgets.map((w) => [w.id, w]))
      return selectionIds.map((id) => byId.get(id)).filter(Boolean) as SavedWidget[]
    }
    return availableWidgets
  }, [availableWidgets, selectionIds, refreshKey])

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row)
  }

  const handleAction = (action: string, row: any) => {
    console.log('Action:', action, 'Row:', row)
  }

  // 위젯 순서 변경: 선택 목록 순서도 함께 갱신
  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= pageWidgets.length) return
    const ids = pageWidgets.map((w) => w.id)
    ;[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]]
    setPageWidgetSelection(CUSTOMERS_PAGE, ids)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* 위젯 재배치·선택 툴바 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">위젯</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSelectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings2 size={18} />
            위젯 선택
          </button>
          <button
            type="button"
            onClick={() => setIsEditLayout((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditLayout
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

      {/* 위젯 선택 모달 */}
      {isSelectModalOpen && (
        <WidgetSelectModal
          availableWidgets={availableWidgets}
          initialSelectedIds={selectionIds ?? availableWidgets.map((w) => w.id)}
          onSave={(ids) => {
            setPageWidgetSelection(CUSTOMERS_PAGE, ids)
            setRefreshKey((k) => k + 1)
            setIsSelectModalOpen(false)
          }}
          onClose={() => setIsSelectModalOpen(false)}
        />
      )}

      {/* 저장된 위젯 그리드 - 5열 기준, 간격 고정 gap-6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 auto-rows-min">
        {pageWidgets.map((widget, index) => {
          const template = widgetTemplates.find((t) => t.id === widget.templateId)
          const span = widget.config?.gridWidth ?? template?.gridSize?.width ?? 3
          const rows = widget.config?.gridRows ?? template?.gridSize?.height ?? 1
          const safeSpan = Math.min(5, Math.max(1, Number(span) || 3))
          const safeRows = Math.min(4, Math.max(1, Number(rows) || 1))
          const colSpanClass = safeSpan === 1 ? 'lg:col-span-1' : safeSpan === 2 ? 'lg:col-span-2' : safeSpan === 4 ? 'lg:col-span-4' : safeSpan === 5 ? 'lg:col-span-5' : 'lg:col-span-3'
          const rowSpanStyle = safeRows > 1 ? ({ gridRow: `span ${safeRows}` } as React.CSSProperties) : undefined

          const widgetContent = (() => {
            if (widget.templateId === 'action-list') {
              return (
                <DynamicActionListWidget
                  widget={widget}
                  onRowClick={handleRowClick}
                  onAction={handleAction}
                />
              )
            }
            if (widget.templateId === 'schedule') {
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[260px] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
                  <div className="space-y-3 flex-1 overflow-auto">
                    {[
                      { time: '09:30', title: '김철수 고객 방문 상담', type: '상담' },
                      { time: '11:00', title: '이영희 고객 포트폴리오 리뷰', type: '리뷰' },
                      { time: '14:00', title: '신규 상품 설명회', type: '세미나' },
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
            if (widget.templateId === 'summary-card') {
              return <SummaryCardWidget widget={widget} />
            }
            if (widget.templateId === 'bar-chart') {
              return <BarChartWidget widget={widget} />
            }
            return null
          })()

          return (
            <div key={widget.id} className={`${colSpanClass} relative min-w-0`} style={rowSpanStyle}>
              {isEditLayout ? (
                <div className="relative rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-2">
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => handleMoveWidget(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                      title="위로"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <span className="flex items-center px-1.5 text-xs text-gray-500">
                      <GripVertical size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveWidget(index, 'down')}
                      disabled={index === pageWidgets.length - 1}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                      title="아래로"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                  <div className={isEditLayout ? 'opacity-95' : ''}>
                    {widgetContent}
                  </div>
                </div>
              ) : (
                widgetContent
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
