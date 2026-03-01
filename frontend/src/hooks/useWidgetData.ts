import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { ActionListData } from '../components/widgets/ActionList'
import { getDataSource, type FeedDataSourceConfig } from '../types/datasource'
import {
  getApiPathForCode,
  type ActionListWidgetCode,
  type BarChartWidgetCode,
  type TextBlockWidgetCode,
  DATA_SOURCE_TO_WIDGET_CODE,
} from '../types/widgetApiMapping'

// ----- API 경로 직접 입력 기반 조회 -----

export function useWidgetDataByApiPath<T = unknown>(options: {
  apiPath: string
  apiParams?: Record<string, string | number | undefined | null>
  skip?: boolean
}): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (options.skip || !options.apiPath?.trim()) {
      setData(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const params = options.apiParams
        ? Object.fromEntries(
            Object.entries(options.apiParams).filter(
              ([, v]) => v !== undefined && v !== null && v !== ''
            ) as [string, string | number][]
          )
        : undefined
      const raw = await api.get<T>(options.apiPath, params as Record<string, string | number>)
      setData(raw)
    } catch (err) {
      console.error('Error fetching widget data by API path:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [options.apiPath, options.skip, JSON.stringify(options.apiParams)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading: options.skip ? false : isLoading,
    error,
    refetch: fetchData,
  }
}

/** Bar Chart API 응답 타입 */
export interface BarChartDataResponse {
  data: Array<{ label: string; values: number[] }>
  seriesLabels: string[]
}

interface UseWidgetDataOptions {
  /** WM 사용자 ID; 지정 시 해당 WM 담당 고객의 이벤트만 조회 */
  wmId?: string | null
  scenarioCodes?: string[]
  status?: string[]
  limit?: number
  filters?: Array<{
    column: string
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'ilike' | 'is'
    value: any
  }>
  /** true면 fetch 생략 (다른 훅 결과만 쓸 때 사용) */
  skip?: boolean
}

interface UseWidgetDataResult {
  data: ActionListData[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * 데이터소스 ID 기반 조회 옵션
 */
interface UseDataSourceOptions {
  dataSourceId: string
  /** WM 사용자 ID; 지정 시 해당 WM 담당 고객의 이벤트만 조회 */
  wmId?: string | null
  additionalFilters?: Record<string, any>
}

interface UseDataSourceResult {
  data: ActionListData[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  dataSourceSpec?: ReturnType<typeof getDataSource>
}

export function useWidgetData(options: UseWidgetDataOptions = {}): UseWidgetDataResult {
  const [data, setData] = useState<ActionListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (options.skip) {
      setData([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const params: Record<string, string | number | undefined | null> = {
        wm_id: options.wmId ?? undefined,
        scenario_codes: options.scenarioCodes?.length ? options.scenarioCodes.join(',') : undefined,
        status: options.status?.length ? options.status.join(',') : undefined,
        limit: options.limit ?? undefined,
        filters: options.filters?.length ? JSON.stringify(options.filters) : undefined
      }
      const rawData = await api.get<ActionListData[]>('/api/widgets/action-list/events', params)
      setData(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error('Error fetching widget data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [options.wmId ?? '', JSON.stringify(options)])

  return { data, isLoading, error, refetch: fetchData }
}

// 만기 고객 데이터 hook
export function useMaturityData() {
  return useWidgetData({
    scenarioCodes: ['DEPOSIT_MATURITY', 'FUND_MATURITY', 'ELS_MATURITY', 'BOND_MATURITY'],
    status: ['pending'],
    limit: 50
  })
}

// 미접촉 고객 데이터 hook
export function useNoContactData() {
  return useWidgetData({
    scenarioCodes: ['LONG_NO_CONTACT'],
    status: ['pending'],
    limit: 50
  })
}

// VIP 강등 위험 고객 데이터 hook
export function useVipRiskData() {
  return useWidgetData({
    scenarioCodes: ['VIP_DOWNGRADE_RISK'],
    status: ['pending'],
    limit: 50
  })
}

/**
 * 데이터소스 명세 기반 데이터 조회 Hook (widgetCode API 사용으로 전환)
 * @deprecated widgetCode 기반 useActionListByCode 사용 권장
 */
export function useDataSourceData(options: UseDataSourceOptions): UseDataSourceResult {
  const widgetCode = DATA_SOURCE_TO_WIDGET_CODE[options.dataSourceId] as ActionListWidgetCode | undefined
  const result = useActionListByCode({
    widgetCode: widgetCode ?? 'AL001',
    wmId: options.wmId,
  })
  const dataSourceSpec = getDataSource(options.dataSourceId)
  return { ...result, dataSourceSpec }
}

/**
 * 위젯 코드 기반 액션리스트 데이터 조회
 */
export function useActionListByCode(options: {
  widgetCode: ActionListWidgetCode
  wmId?: string | null
}): UseDataSourceResult {
  const [data, setData] = useState<ActionListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const path = getApiPathForCode(options.widgetCode)
      const rawData = await api.get<ActionListData[]>(path, {
        wm_id: options.wmId ?? undefined,
      })
      setData(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error('Error fetching action list by code:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [options.widgetCode, options.wmId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * 위젯 코드 기반 바 차트 데이터 조회
 */
export function useBarChartByCode(options: {
  widgetCode: BarChartWidgetCode
  wmId?: string | null
}): {
  data: BarChartDataResponse
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const [data, setData] = useState<BarChartDataResponse>({ data: [], seriesLabels: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const path = getApiPathForCode(options.widgetCode)
      const raw = await api.get<BarChartDataResponse>(path, {
        wm_id: options.wmId ?? undefined,
      })
      setData(
        raw && Array.isArray(raw.data)
          ? { data: raw.data, seriesLabels: raw.seriesLabels ?? [] }
          : { data: [], seriesLabels: [] }
      )
    } catch (err) {
      console.error('Error fetching bar chart by code:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [options.widgetCode, options.wmId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * 위젯 코드 기반 텍스트 블록(피드) 데이터 조회
 */
export function useTextBlockByCode(options: {
  widgetCode: TextBlockWidgetCode
  feedType?: string | null
  limit?: number
  skip?: boolean
}): UseFeedDataResult {
  const [data, setData] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (options.skip) {
      setData([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const path = getApiPathForCode(options.widgetCode)
      const rawData = await api.get<Array<{ id: string; title: string; content: string }>>(path, {
        feed_type: options.feedType ?? undefined,
        limit: options.limit ?? 5,
      })
      const items: FeedItem[] = (Array.isArray(rawData) ? rawData : []).map((row) => ({
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        content: String(row.content ?? ''),
      }))
      setData(items)
    } catch (err) {
      console.error('Error fetching text block by code:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [options.widgetCode, options.feedType, options.limit, options.skip])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading: options.skip ? false : isLoading,
    error,
    refetch: fetchData,
  }
}

/** Feed 아이템 (텍스트 블록용) */
export interface FeedItem {
  id: string
  title: string
  content: string
}

interface UseFeedDataOptions {
  dataSourceId: string
  /** true면 fetch 생략 */
  skip?: boolean
  columnMapping?: { title: string; content: string }
  queryOverride?: {
    filters?: Array<{ column: string; operator: string; value: unknown }>
    order?: { field: string; direction: 'asc' | 'desc' }
    limit?: number
  }
}

interface UseFeedDataResult {
  data: FeedItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * feeds 테이블에서 피드 데이터 조회 (텍스트 블록 위젯용)
 */
export function useFeedData(options: UseFeedDataOptions): UseFeedDataResult {
  const [data, setData] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (options.skip) {
      setData([])
      setIsLoading(false)
      return
    }
    const spec = getDataSource(options.dataSourceId)
    if (!spec || spec.category !== 'feed') {
      setData([])
      setIsLoading(false)
      return
    }

    const feedConfig = spec.config as FeedDataSourceConfig
    const q = options.queryOverride ?? {}
    const order = q.order ?? feedConfig.query.order ?? { field: 'published_at', direction: 'desc' }
    const limit = q.limit ?? feedConfig.query.limit ?? 5
    const filters = q.filters ?? feedConfig.query.filters ?? []
    const feedTypeFilter = filters.find((f: { column: string }) => f.column === 'feed_type')
    const feedTypes = Array.isArray(feedTypeFilter?.value)
      ? (feedTypeFilter.value as string[]).join(',')
      : undefined

    setIsLoading(true)
    setError(null)

    try {
      const rawData = await api.get<{ id: string; title: string; content: string }[]>('/api/widgets/text-block/data', {
        data_source: 'feed',
        feed_type: feedTypes,
        limit,
        order_field: order.field,
        order_direction: order.direction
      })
      const items: FeedItem[] = (Array.isArray(rawData) ? rawData : []).map((row) => ({
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        content: String(row.content ?? '')
      }))
      setData(items)
    } catch (err) {
      console.error('Error fetching feed data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [options.skip, options.dataSourceId, JSON.stringify(options.columnMapping), JSON.stringify(options.queryOverride)])

  return { data, isLoading, error, refetch: fetchData }
}
