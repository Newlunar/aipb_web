import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ActionListData } from '../components/widgets/ActionList'

interface UseWidgetDataOptions {
  scenarioCodes?: string[]
  status?: string[]
  limit?: number
}

interface UseWidgetDataResult {
  data: ActionListData[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useWidgetData(options: UseWidgetDataOptions = {}): UseWidgetDataResult {
  const [data, setData] = useState<ActionListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. 먼저 시나리오 코드로 시나리오 ID 조회
      let scenarioIds: string[] = []
      
      if (options.scenarioCodes && options.scenarioCodes.length > 0) {
        const { data: scenarios, error: scenarioError } = await supabase
          .from('scenarios')
          .select('id, code')
          .in('code', options.scenarioCodes)
        
        if (scenarioError) throw scenarioError
        scenarioIds = scenarios?.map(s => s.id) || []
        
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

      // 상태 필터
      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status)
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
  }, [JSON.stringify(options)])

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
