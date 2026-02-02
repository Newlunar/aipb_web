import { useMemo } from 'react'
import { ActionListWidget } from './ActionList'
import { useDataSourceData, useWidgetData } from '../../hooks/useWidgetData'
import { useUser } from '../../contexts/UserContext'
import { defaultTemplateConfig } from '../../data/mockData'
import { getDataSource } from '../../types/datasource'
import type { SavedWidget } from '../../types/widget'
import type { ActionListDataSourceConfig, ColumnConfig } from './ActionList'

const DEFAULT_DATA_SOURCE_CONFIG: ActionListDataSourceConfig = {
  query: {
    base_table: 'customer_scenario_events',
    scenario_filter: { codes: [] }
  },
  columns: [],
  filters: [],
  default_sort: { field: 'event_date', direction: 'asc' },
  default_page_size: 10,
  row_actions: [
    { key: 'call', label: '전화', icon: 'phone', type: 'call', variant: 'primary' },
    { key: 'detail', label: '상세', icon: 'info', type: 'popup', variant: 'ghost' }
  ]
}

/**
 * 위젯 config의 columns를 ActionList ColumnConfig 형식으로 정규화
 */
function normalizeColumns(cols: any[]): ColumnConfig[] {
  return (cols || []).map((col: any) => ({
    key: col.key || 'col',
    label: col.label || col.key,
    source: (col.source || 'customer') as ColumnConfig['source'],
    field: col.field || '',
    width: col.width,
    align: col.align,
    format: col.format,
    sortable: col.sortable,
    filterable: col.filterable,
    clickable: col.clickable
  }))
}

/**
 * SavedWidget config에서 ActionListDataSourceConfig 생성
 */
function buildDataSourceConfig(widget: SavedWidget): ActionListDataSourceConfig {
  const { config } = widget
  const dataSourceId = config?.dataSource
  const spec = dataSourceId ? getDataSource(dataSourceId) : undefined
  const baseConfig = spec?.config as ActionListDataSourceConfig | undefined

  const query = config?.query || baseConfig?.query || DEFAULT_DATA_SOURCE_CONFIG.query
  const columns = config?.columns?.length
    ? normalizeColumns(config.columns)
    : (baseConfig?.columns?.length
        ? baseConfig.columns
        : DEFAULT_DATA_SOURCE_CONFIG.columns)
  const default_sort = baseConfig?.default_sort || DEFAULT_DATA_SOURCE_CONFIG.default_sort
  const default_page_size = baseConfig?.default_page_size ?? 10
  const row_actions = baseConfig?.row_actions || DEFAULT_DATA_SOURCE_CONFIG.row_actions
  const filters = baseConfig?.filters ?? []

  return {
    query: typeof query === 'object' ? query : DEFAULT_DATA_SOURCE_CONFIG.query,
    columns,
    filters,
    default_sort,
    default_page_size,
    row_actions
  }
}

interface DynamicActionListWidgetProps {
  widget: SavedWidget
  onRowClick?: (row: any) => void
  onAction?: (action: string, row: any) => void
}

/**
 * 저장된 위젯 설정에 따라 데이터를 조회하고 ActionListWidget을 렌더링
 */
export function DynamicActionListWidget({
  widget,
  onRowClick,
  onAction
}: DynamicActionListWidgetProps) {
  const { currentUser } = useUser()
  const wmId = currentUser?.id ?? null

  const dataSourceConfig = useMemo(() => buildDataSourceConfig(widget), [widget])
  const dataSourceId = widget.config?.dataSource

  const useKnown =
    dataSourceId === 'maturity' ||
    dataSourceId === 'no-contact' ||
    dataSourceId === 'vip-risk'

  const queryOptions = useMemo(() => {
    if (useKnown) return { skip: true as const, wmId }
    const q = widget.config?.query
    if (!q) return { skip: true as const, wmId }
    return {
      wmId,
      scenarioCodes: q.scenario_filter?.codes,
      status: q.status_filter,
      filters: q.filters,
      limit: 50
    }
  }, [useKnown, widget.config?.query, wmId])

  const fromDataSource = useDataSourceData({
    dataSourceId: dataSourceId || 'maturity',
    wmId
  })
  const fromWidgetData = useWidgetData(queryOptions)

  const { data, isLoading, error } = useKnown ? fromDataSource : fromWidgetData
  const displayData = error ? [] : data

  return (
    <ActionListWidget
      title={widget.title}
      data={displayData}
      templateConfig={defaultTemplateConfig}
      dataSourceConfig={dataSourceConfig}
      isLoading={isLoading}
      onRowClick={onRowClick}
      onAction={onAction}
    />
  )
}
