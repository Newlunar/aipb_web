import { useMemo } from 'react'
import { ActionListWidget } from './ActionList'
import { useActionListByCode, useWidgetData, useWidgetDataByApiPath } from '../../hooks/useWidgetData'
import { useUser } from '../../contexts/UserContext'
import { defaultTemplateConfig } from '../../data/mockData'
import { getDataSource } from '../../types/datasource'
import {
  WIDGET_CODE_TO_DATA_SOURCE,
  type ActionListWidgetCode,
  DATA_SOURCE_TO_WIDGET_CODE,
} from '../../types/widgetApiMapping'
import type { SavedWidget, ColumnMappingDef } from '../../types/widget'
import type { ActionListDataSourceConfig, ColumnConfig } from './ActionList'
import { isApiBasedConfig } from '../../types/widget'

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
 * API 기반 columnMappings를 ActionList ColumnConfig로 변환
 */
function columnMappingsToConfig(mappings: ColumnMappingDef[]): ColumnConfig[] {
  return (mappings || []).map((m) => ({
    key: m.responseKey,
    label: m.label,
    source: 'api' as const,
    field: m.responseKey,
    width: m.width,
    align: m.align,
    format: m.format ? { type: m.format, options: {} } : undefined,
    sortable: m.sortable,
    clickable: m.clickable
  }))
}

/**
 * SavedWidget config에서 ActionListDataSourceConfig 생성
 * widgetCode 우선, 없으면 dataSource(레거시) 사용
 */
function buildDataSourceConfig(widget: SavedWidget): ActionListDataSourceConfig {
  const { config } = widget
  const widgetCode = config?.widgetCode as ActionListWidgetCode | undefined
  const dataSourceId = config?.dataSource ?? (widgetCode ? WIDGET_CODE_TO_DATA_SOURCE[widgetCode] : undefined)
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
 * widgetCode 기반 API 호출: /api/widgets/action-list/{AL001|AL002|AL003}/data
 */
export function DynamicActionListWidget({
  widget,
  onRowClick,
  onAction
}: DynamicActionListWidgetProps) {
  const { currentUser } = useUser()
  const wmId = currentUser?.id ?? null
  const config = widget.config

  const isApiBased = isApiBasedConfig(config) && config.displayType === 'action-list'

  // API 기반: apiPath + columnMappings
  const apiPath = isApiBased ? config.apiPath : ''
  const apiParams = useMemo(() => {
    if (!isApiBased) return undefined
    const base = config.apiParams ?? {}
    return wmId ? { ...base, wm_id: wmId } : base
  }, [isApiBased, config.apiParams, wmId])
  const apiData = useWidgetDataByApiPath<unknown[]>({
    apiPath,
    apiParams,
    skip: !isApiBased
  })
  const apiConfig = useMemo((): ActionListDataSourceConfig | null => {
    if (!isApiBased || !config.columnMappings?.length) return null
    return {
      query: DEFAULT_DATA_SOURCE_CONFIG.query,
      columns: columnMappingsToConfig(config.columnMappings),
      filters: [],
      default_sort: config.defaultSort ?? { field: config.columnMappings[0]?.responseKey ?? '', direction: 'asc' },
      default_page_size: config.pageSize ?? 10,
      row_actions: DEFAULT_DATA_SOURCE_CONFIG.row_actions
    }
  }, [isApiBased, config.columnMappings, config.defaultSort, config.pageSize])

  // 데이터소스/코드 기반 (레거시)
  const dataSourceConfig = useMemo(() => buildDataSourceConfig(widget), [widget])
  const widgetCode = widget.config?.widgetCode as ActionListWidgetCode | undefined
  const dataSourceId = widget.config?.dataSource

  const effectiveWidgetCode = widgetCode ?? (dataSourceId ? (DATA_SOURCE_TO_WIDGET_CODE[dataSourceId] as ActionListWidgetCode) : 'AL001')
  const useCodeApi =
    !isApiBased && (effectiveWidgetCode === 'AL001' || effectiveWidgetCode === 'AL002' || effectiveWidgetCode === 'AL003')

  const queryOptions = useMemo(() => {
    if (useCodeApi || isApiBased) return { skip: true as const, wmId }
    const q = widget.config?.query
    if (!q) return { skip: true as const, wmId }
    return {
      wmId,
      scenarioCodes: q.scenario_filter?.codes,
      status: q.status_filter,
      filters: q.filters,
      limit: 50
    }
  }, [useCodeApi, isApiBased, widget.config?.query, wmId])

  const fromCodeApi = useActionListByCode({ widgetCode: effectiveWidgetCode, wmId })
  const fromWidgetData = useWidgetData(queryOptions)

  const { data, isLoading, error } = isApiBased
    ? { data: (apiData.data ?? []) as import('./ActionList').ActionListData[], isLoading: apiData.isLoading, error: apiData.error }
    : useCodeApi
      ? fromCodeApi
      : fromWidgetData
  const displayData = error ? [] : data
  const effectiveConfig = isApiBased && apiConfig ? apiConfig : dataSourceConfig

  return (
    <ActionListWidget
      title={widget.title}
      data={displayData}
      templateConfig={defaultTemplateConfig}
      dataSourceConfig={effectiveConfig}
      isLoading={isLoading}
      onRowClick={onRowClick}
      onAction={onAction}
    />
  )
}
