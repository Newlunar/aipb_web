import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../contexts/UserContext'

export interface DashboardStats {
  totalCustomers: number
  totalAum: number
  todaySchedules: number
  urgentActions: number
  vipUrgentCount: number
}

interface UseDashboardStatsResult {
  stats: DashboardStats
  isLoading: boolean
  error: Error | null
}

export function useDashboardStats(): UseDashboardStatsResult {
  const { currentUser } = useUser()
  const wmId = currentUser?.id ?? null

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalAum: 0,
    todaySchedules: 0,
    urgentActions: 0,
    vipUrgentCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // WM이 없으면 0으로
        if (!wmId) {
          setStats({
            totalCustomers: 0,
            totalAum: 0,
            todaySchedules: 0,
            urgentActions: 0,
            vipUrgentCount: 0
          })
          setIsLoading(false)
          return
        }

        // 고객 수 및 총 AUM (wm_id 기준)
        const customerQuery = supabase
          .from('customers')
          .select('id, total_aum, customer_group')
          .eq('wm_id', wmId)

        const { data: customerData, error: customerError } = await customerQuery

        if (customerError) throw customerError

        const totalCustomers = customerData?.length || 0
        const totalAum = (customerData ?? []).reduce((sum, c: { id: string; total_aum?: number }) => sum + (c.total_aum || 0), 0)
        const customerIds = (customerData ?? []).map((c: { id: string }) => c.id)

        // 긴급 조치 필요 이벤트 수 (담당 WM 고객의 pending 이벤트)
        let urgentActions = 0
        let vipUrgentCount = 0
        if (customerIds.length > 0) {
          const { data: eventData, error: eventError } = await supabase
            .from('customer_scenario_events')
            .select(`
              id,
              customer_id,
              customers!inner (customer_group)
            `)
            .eq('status', 'pending')
            .in('customer_id', customerIds)

          if (eventError) throw eventError

          urgentActions = eventData?.length ?? 0
          vipUrgentCount =
            eventData?.filter((e: { customers?: { customer_group?: string } }) => e.customers?.customer_group === 'vip').length ?? 0
        }

        setStats({
          totalCustomers,
          totalAum,
          todaySchedules: 5, // TODO: 실제 일정 테이블 연동
          urgentActions,
          vipUrgentCount
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [wmId])

  return { stats, isLoading, error }
}
