import { useState, useMemo } from 'react'
import { Phone, MessageSquare, Info, ChevronLeft, ChevronRight, Search, RotateCcw } from 'lucide-react'
import type { ActionListData, ActionListTemplateConfig, ActionListDataSourceConfig, ColumnConfig } from './types'
import { useFilter } from '../../../contexts/FilterContext'

interface ActionListWidgetProps {
  title: string
  data: ActionListData[]
  templateConfig: ActionListTemplateConfig
  dataSourceConfig: ActionListDataSourceConfig
  isLoading?: boolean
  onRowClick?: (row: ActionListData) => void
  onAction?: (action: string, row: ActionListData) => void
}

export function ActionListWidget({
  title,
  data,
  templateConfig,
  dataSourceConfig,
  isLoading = false,
  onRowClick,
  onAction
}: ActionListWidgetProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(dataSourceConfig.default_page_size || 10)
  const [sortField, setSortField] = useState(dataSourceConfig.default_sort.field)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(dataSourceConfig.default_sort.direction)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 전역 고객 그룹 필터 사용
  const { customerGroup } = useFilter()

  // 필터링 및 정렬
  const processedData = useMemo(() => {
    let result = [...data]

    // 전역 고객 그룹 필터 적용
    if (customerGroup && customerGroup !== 'all') {
      result = result.filter(row => row.customer_group === customerGroup)
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(row => 
        row.customer_name.toLowerCase().includes(term) ||
        row.scenario_name.toLowerCase().includes(term)
      )
    }

    // 정렬
    result.sort((a, b) => {
      const aVal = getFieldValue(a, 'event', sortField) || ''
      const bVal = getFieldValue(b, 'event', sortField) || ''
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    return result
  }, [data, customerGroup, searchTerm, sortField, sortDirection])

  // 페이지네이션
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  // 위젯 고정 높이: 5개 리스트 기준 (헤더 56px + 필터 50px + 테이블헤더 40px + 행 36px*5 + 페이지네이션 50px ≈ 260px)
  const WIDGET_HEIGHT = 260

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: WIDGET_HEIGHT }}>
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-200 shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* 필터 영역 */}
      {templateConfig.filter_area.enabled && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-4 shrink-0">
          {templateConfig.filter_area.show_search && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          {templateConfig.filter_area.show_reset && searchTerm && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              초기화
            </button>
          )}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-auto flex-1">
        <table className={`w-full ${templateConfig.grid.stripe ? 'table-stripe' : ''}`}>
          {templateConfig.grid.show_header && (
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {dataSourceConfig.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        <span className="text-primary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {templateConfig.action_area.enabled && templateConfig.action_area.position === 'row' && (
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                    액션
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={dataSourceConfig.columns.length + 1} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    로딩 중...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={dataSourceConfig.columns.length + 1} className="px-4 py-12 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 ${
                    templateConfig.grid.hover_highlight ? 'hover:bg-gray-50' : ''
                  } ${
                    templateConfig.row_click.enabled ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => templateConfig.row_click.enabled && onRowClick?.(row)}
                >
                  {dataSourceConfig.columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 ${
                        templateConfig.grid.row_height === 'compact' ? 'py-2' :
                        templateConfig.grid.row_height === 'comfortable' ? 'py-4' : 'py-3'
                      } text-sm ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <CellRenderer column={col} row={row} />
                    </td>
                  ))}
                  {templateConfig.action_area.enabled && templateConfig.action_area.position === 'row' && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {dataSourceConfig.row_actions.map((action) => (
                          <ActionButton
                            key={action.key}
                            action={action}
                            onClick={(e) => {
                              e.stopPropagation()
                              onAction?.(action.key, row)
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {templateConfig.pagination.enabled && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {templateConfig.pagination.show_total && (
              <span className="text-sm text-gray-600">
                총 <span className="font-medium text-gray-900">{processedData.length}</span>건
              </span>
            )}
            {templateConfig.pagination.show_page_size && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {templateConfig.pagination.page_size_options?.map((size) => (
                  <option key={size} value={size}>{size}개씩</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 셀 렌더러
function CellRenderer({ column, row }: { column: ColumnConfig; row: ActionListData }) {
  const value = getFieldValue(row, column.source, column.field)

  if (!column.format) {
    return <span>{value}</span>
  }

  switch (column.format.type) {
    case 'badge':
      const badgeClass = getBadgeClass(value)
      return <span className={`badge ${badgeClass}`}>{value}</span>

    case 'currency':
      return <span className="font-medium">{formatCurrency(value)}</span>

    case 'date':
      return <span>{formatDate(value)}</span>

    default:
      return <span>{value}</span>
  }
}

// 액션 버튼
function ActionButton({ 
  action, 
  onClick 
}: { 
  action: { key: string; label: string; icon?: string; variant?: string }
  onClick: (e: React.MouseEvent) => void
}) {
  const getIcon = () => {
    switch (action.icon) {
      case 'phone': return <Phone size={14} />
      case 'message-square': return <MessageSquare size={14} />
      case 'info': return <Info size={14} />
      default: return null
    }
  }

  const variantClass = action.variant === 'primary' 
    ? 'bg-primary text-white hover:bg-primary-dark'
    : action.variant === 'secondary'
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'text-gray-600 hover:bg-gray-100'

  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${variantClass}`}
      title={action.label}
    >
      {getIcon()}
    </button>
  )
}

// 유틸리티 함수
function getFieldValue(row: ActionListData, source: string, field: string): any {
  const fieldPath = field.split('.')
  
  if (source === 'customer') {
    if (field === 'name') return row.customer_name
    if (field === 'grade') return row.grade
    if (field === 'customer_group') return row.customer_group
    if (field === 'total_aum') return row.total_aum
    if (field === 'phone') return row.phone
  }
  
  if (source === 'scenario') {
    if (field === 'name') return row.scenario_name
    if (field === 'code') return row.scenario_code
  }
  
  if (source === 'event') {
    if (field === 'event_date') return row.event_date
    if (field === 'status') return row.status
    if (field === 'priority') return row.priority
    
    // event_data.* 처리
    if (fieldPath[0] === 'event_data' && fieldPath.length > 1) {
      return row.event_data?.[fieldPath[1]]
    }
  }
  
  return null
}

function getBadgeClass(value: string): string {
  const lowerValue = value?.toLowerCase()
  if (lowerValue === 'vip' || lowerValue === '1등급') return 'badge-vip'
  if (lowerValue === 'general' || lowerValue === '2등급') return 'badge-general'
  if (lowerValue === 'prospect' || lowerValue === '3등급') return 'badge-prospect'
  if (lowerValue === 'pending') return 'badge-pending'
  if (lowerValue === 'completed') return 'badge-completed'
  if (lowerValue === 'contacted') return 'badge-contacted'
  return 'badge-general'
}

function formatCurrency(value: number): string {
  if (!value) return '-'
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만`
  }
  return value.toLocaleString() + '원'
}

function formatDate(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}
