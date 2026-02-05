import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, GripVertical, Pin, PinOff } from 'lucide-react'
import { widgetTemplates, type SavedWidget } from '../../types/widget'
import { DynamicActionListWidget } from './DynamicActionListWidget'
import { SummaryCardWidget } from './SummaryCard'
import { BarChartWidget } from './BarChart'

interface WidgetGridProps {
    widgets: SavedWidget[]
    isEditLayout: boolean
    onMove?: (index: number, direction: 'up' | 'down') => void
    onTogglePin?: (id: string) => void
    onRowClick?: (row: any) => void
    onAction?: (action: string, row: any) => void
}

export function WidgetGrid({
    widgets,
    isEditLayout,
    onMove,
    onTogglePin,
    onRowClick,
    onAction
}: WidgetGridProps) {

    // 기본 로깅 (prop이 없을 경우)
    const handleRowClick = onRowClick ?? ((row) => console.log('Row clicked:', row))
    const handleAction = onAction ?? ((action, row) => console.log('Action:', action, 'Row:', row))

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 auto-rows-min">
            {widgets.map((widget, index) => {
                const template = widgetTemplates.find((t) => t.id === widget.templateId)
                const span = widget.config?.gridWidth ?? template?.gridSize?.width ?? 3
                const rows = widget.config?.gridRows ?? template?.gridSize?.height ?? 1

                // Grid span/row 계산
                const safeSpan = Math.min(5, Math.max(1, Number(span) || 3))
                const safeRows = Math.min(4, Math.max(1, Number(rows) || 1))

                const colSpanClass =
                    safeSpan === 1 ? 'lg:col-span-1' :
                        safeSpan === 2 ? 'lg:col-span-2' :
                            safeSpan === 4 ? 'lg:col-span-4' :
                                safeSpan === 5 ? 'lg:col-span-5' :
                                    'lg:col-span-3'

                const rowSpanStyle = safeRows > 1 ? ({ gridRow: `span ${safeRows}` } as React.CSSProperties) : undefined

                // 핀 상태 확인
                const isPinned = widget.pages?.includes('dashboard')

                // 위젯 내용 렌더링
                const widgetContent = (() => {
                    // 커스텀 헤더가 없는 위젯(차트 등)에 핀 버튼을 어떻게 넣을지 고민 필요.
                    // 현재 구조상 각 위젯 컴포넌트(DynamicActionListWidget 등)가 자체 헤더를 가질 수도 있고 아닐 수도 있음.
                    // 통일성을 위해 WidgetGrid 레벨에서 '컨테이너'를 씌우고 그 위에 핀을 띄우는 방식(오버레이) or 
                    // 각 위젯이 'headerRight' prop을 받아서 렌더링하는 방식이 있음.
                    // 여기서는 'isEditLayout' 오버레이와 유사하게, 우측 상단에 핀 버튼을 항상 노출하거나(호버시),
                    // 헤더 옆에 붙이는 방식을 사용.

                    let content: ReactNode = null

                    if (widget.templateId === 'action-list') {
                        content = (
                            <DynamicActionListWidget
                                widget={widget}
                                onRowClick={handleRowClick}
                                onAction={handleAction}
                            />
                        )
                    } else if (widget.templateId === 'schedule') {
                        // 임시 스케줄 위젯
                        content = (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                                </div>
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
                    } else if (widget.templateId === 'summary-card') {
                        content = <SummaryCardWidget widget={widget} />
                    } else if (widget.templateId === 'bar-chart') {
                        content = <BarChartWidget widget={widget} />
                    }

                    return content
                })()

                return (
                    <div key={widget.id} className={`${colSpanClass} relative min-w-0 group`} style={rowSpanStyle}>
                        {/* 핀 버튼 (우측 상단, 편집모드가 아닐 때도 노출되어야 접근 가능) */}
                        {/* 단, 위젯 내부 UI와 겹치지 않게 주의. 보통 헤더 영역에 위치함. 
                여기서는 절대 위치로 우측 상단에 띄우되, 위젯들이 보통 padding이 있으므로 괜찮을 듯. 
                SummaryCard는 꽉 차있을 수 있음. */}

                        {!isEditLayout && onTogglePin && (
                            <button
                                onClick={() => onTogglePin(widget.id)}
                                className={`
                  absolute top-3 right-3 z-10 p-1.5 rounded-full shadow-sm border transition-all opacity-0 group-hover:opacity-100
                  ${isPinned
                                        ? 'bg-primary text-white border-primary opacity-100'
                                        : 'bg-white text-gray-400 border-gray-200 hover:text-primary hover:border-primary'
                                    }
                `}
                                title={isPinned ? "대시보드에서 제거" : "대시보드에 고정"}
                            >
                                {isPinned ? <Pin size={14} fill="currentColor" /> : <Pin size={14} />}
                            </button>
                        )}

                        {isEditLayout ? (
                            <div className="relative h-full rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-2">
                                <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
                                    <button
                                        type="button"
                                        onClick={() => onMove?.(index, 'up')}
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
                                        onClick={() => onMove?.(index, 'down')}
                                        disabled={index === widgets.length - 1}
                                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                                        title="아래로"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                                <div className="opacity-70 pointer-events-none h-full">
                                    {widgetContent}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full">
                                {widgetContent}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
