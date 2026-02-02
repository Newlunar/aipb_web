import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ActionListData } from '../components/widgets/ActionList'
import { getDataSource } from '../types/datasource'

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
      // 0. WM 지정 시 해당 WM 담당 고객 ID 목록 조회
      let customerIdsForWm: string[] | null = null
      if (options.wmId) {
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('id')
          .eq('wm_id', options.wmId)
        if (custError) throw custError
        customerIdsForWm = (custData ?? []).map((c: { id: string }) => c.id)
        if (customerIdsForWm.length === 0) {
          setData([])
          setIsLoading(false)
          return
        }
      }

      // 1. 먼저 시나리오 코드로 시나리오 ID 조회
      let scenarioIds: string[] = []
      
      if (options.scenarioCodes && options.scenarioCodes.length > 0) {
        const { data: scenarios, error: scenarioError } = await supabase
          .from('scenarios')
          .select('id, code')
          .in('code', options.scenarioCodes)
        
        if (scenarioError) throw scenarioError
        scenarioIds = (scenarios ?? []).map((s: { id: string }) => s.id)
        
        // 해당 시나리오가 없으면 빈 배열 반환
        if (scenarioIds.length === 0) {
          setData([])
          setIsLoading(false)
          return
        }
      }

      // 2. 이벤트 데이터 조회
      let query = supabase
        .from('customer_scenario_events')
        .select(`
          id,
          customer_id,
          scenario_id,
          account_id,
          event_date,
          event_data,
          status,
          priority,
          assigned_wm_id,
          notes,
          created_at,
          customers (
            id,
            name,
            phone,
            email,
            customer_group,
            grade,
            total_aum
          ),
          scenarios (
            id,
            code,
            name,
            category,
            color,
            icon
          )
        `)

      // 시나리오 ID 필터
      if (scenarioIds.length > 0) {
        query = query.in('scenario_id', scenarioIds)
      }

      // WM 담당 고객만 필터
      if (customerIdsForWm && customerIdsForWm.length > 0) {
        query = query.in('customer_id', customerIdsForWm)
      }

      // 상태 필터
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status)
      }

      // 동적 필터 적용
      if (options.filters && Array.isArray(options.filters)) {
        options.filters.forEach((filter) => {
          const { column, operator, value } = filter

          if (!column || !operator || value === undefined) {
            console.warn('Invalid filter:', filter)
            return
          }

          switch (operator) {
            case 'eq':
              query = query.eq(column, value)
              break
            case 'neq':
              query = query.neq(column, value)
              break
            case 'gt':
              query = query.gt(column, value)
              break
            case 'gte':
              query = query.gte(column, value)
              break
            case 'lt':
              query = query.lt(column, value)
              break
            case 'lte':
              query = query.lte(column, value)
              break
            case 'in':
              if (Array.isArray(value)) {
                query = query.in(column, value)
              } else {
                console.warn('Invalid value for "in" operator, expected array:', filter)
              }
              break
            case 'like':
              query = query.like(column, value)
              break
            case 'ilike':
              query = query.ilike(column, value)
              break
            case 'is':
              query = query.is(column, value)
              break
            default:
              console.warn('Unknown filter operator:', operator)
          }
        })
      }

      // 정렬
      query = query.order('event_date', { ascending: true })
      
      // 제한
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: rawData, error: queryError } = await query

      if (queryError) {
        throw queryError
      }

      // 데이터 변환
      const transformedData: ActionListData[] = (rawData || [])
        .filter((item: any) => item.customers && item.scenarios) // null 체크
        .map((item: any) => ({
          id: item.id,
          customer_id: item.customer_id,
          customer_name: item.customers?.name || '',
          customer_group: item.customers?.customer_group || 'general',
          grade: item.customers?.grade || '',
          total_aum: item.customers?.total_aum || 0,
          phone: item.customers?.phone || '',
          scenario_code: item.scenarios?.code || '',
          scenario_name: item.scenarios?.name || '',
          scenario_color: item.scenarios?.color || '#6B7280',
          event_date: item.event_date,
          event_data: item.event_data || {},
          status: item.status,
          priority: item.priority
        }))

      setData(transformedData)
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
 * 데이터소스 명세 기반 데이터 조회 Hook
 *
 * @example
 * const { data, isLoading, dataSourceSpec } = useDataSourceData({
 *   dataSourceId: 'maturity'
 * })
 */
export function useDataSourceData(options: UseDataSourceOptions): UseDataSourceResult {
  const [data, setData] = useState<ActionListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 데이터소스 명세 가져오기
  const dataSourceSpec = getDataSource(options.dataSourceId)

  const fetchData = async () => {
    if (!dataSourceSpec) {
      setError(new Error(`데이터소스를 찾을 수 없습니다: ${options.dataSourceId}`))
      setIsLoading(false)
      return
    }

    // 메트릭 타입은 별도 처리 필요 (추후 구현)
    if (dataSourceSpec.category === 'metric' || dataSourceSpec.category === 'schedule') {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const config = dataSourceSpec.config

      // 0. WM 지정 시 해당 WM 담당 고객 ID 목록 조회
      let customerIdsForWm: string[] | null = null
      if (options.wmId) {
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('id')
          .eq('wm_id', options.wmId)
        if (custError) throw custError
        customerIdsForWm = (custData ?? []).map((c: { id: string }) => c.id)
        if (customerIdsForWm.length === 0) {
          setData([])
          setIsLoading(false)
          return
        }
      }

      // 1. 시나리오 코드 → ID 변환
      let scenarioIds: string[] = []
      if (config.query.scenario_filter?.codes) {
        const { data: scenarios, error: scenarioError } = await supabase
          .from('scenarios')
          .select('id, code')
          .in('code', config.query.scenario_filter.codes)

        if (scenarioError) throw scenarioError
        scenarioIds = (scenarios ?? []).map((s: { id: string }) => s.id)

        if (scenarioIds.length === 0) {
          setData([])
          setIsLoading(false)
          return
        }
      }

      // 2. 이벤트 데이터 조회
      let query = supabase
        .from(config.query.base_table)
        .select(`
          id,
          customer_id,
          scenario_id,
          account_id,
          event_date,
          event_data,
          status,
          priority,
          assigned_wm_id,
          notes,
          created_at,
          customers (
            id,
            name,
            phone,
            email,
            customer_group,
            grade,
            total_aum
          ),
          scenarios (
            id,
            code,
            name,
            category,
            color,
            icon
          )
        `)

      // 동적 필터 적용
      if (config.query.filters && Array.isArray(config.query.filters)) {
        config.query.filters.forEach((filter: any) => {
          const { column, operator, value } = filter

          // 필터 값 검증
          if (!column || !operator || value === undefined) {
            console.warn('Invalid filter:', filter)
            return
          }

          // 연산자별 쿼리 적용
          switch (operator) {
            case 'eq':
              query = query.eq(column, value)
              break
            case 'neq':
              query = query.neq(column, value)
              break
            case 'gt':
              query = query.gt(column, value)
              break
            case 'gte':
              query = query.gte(column, value)
              break
            case 'lt':
              query = query.lt(column, value)
              break
            case 'lte':
              query = query.lte(column, value)
              break
            case 'in':
              if (Array.isArray(value)) {
                query = query.in(column, value)
              } else {
                console.warn('Invalid value for "in" operator, expected array:', filter)
              }
              break
            case 'like':
              query = query.like(column, value)
              break
            case 'ilike':
              query = query.ilike(column, value)
              break
            case 'is':
              query = query.is(column, value)
              break
            default:
              console.warn('Unknown filter operator:', operator)
          }
        })
      }

      // 레거시 호환성: scenario_filter와 status_filter 지원
      // (기존 데이터소스가 새 구조로 마이그레이션될 때까지 유지)
      if (scenarioIds.length > 0) {
        query = query.in('scenario_id', scenarioIds)
      }

      if (config.query.status_filter) {
        query = query.in('status', config.query.status_filter)
      }

      // WM 담당 고객만 필터
      if (customerIdsForWm && customerIdsForWm.length > 0) {
        query = query.in('customer_id', customerIdsForWm)
      }

      // 정렬
      const sortField = config.default_sort?.field || 'event_date'
      const sortDirection = config.default_sort?.direction === 'desc' ? false : true
      query = query.order(sortField, { ascending: sortDirection })

      // 제한
      const limit = config.default_page_size ? config.default_page_size * 5 : 50
      query = query.limit(limit)

      const { data: rawData, error: queryError } = await query

      if (queryError) throw queryError

      // 3. 데이터 변환
      const transformedData: ActionListData[] = (rawData || [])
        .filter((item: any) => item.customers && item.scenarios)
        .map((item: any) => ({
          id: item.id,
          customer_id: item.customer_id,
          customer_name: item.customers?.name || '',
          customer_group: item.customers?.customer_group || 'general',
          grade: item.customers?.grade || '',
          total_aum: item.customers?.total_aum || 0,
          phone: item.customers?.phone || '',
          scenario_code: item.scenarios?.code || '',
          scenario_name: item.scenarios?.name || '',
          scenario_color: item.scenarios?.color || '#6B7280',
          event_date: item.event_date,
          event_data: item.event_data || {},
          status: item.status,
          priority: item.priority
        }))

      setData(transformedData)
    } catch (err) {
      console.error('Error fetching data source data:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [options.dataSourceId, options.wmId ?? '', JSON.stringify(options.additionalFilters)])

  return { data, isLoading, error, refetch: fetchData, dataSourceSpec }
}
