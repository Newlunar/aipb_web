import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
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
        // 고객 수 및 총 AUM
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id, total_aum, customer_group')

        if (customerError) throw customerError

        const totalCustomers = customerData?.length || 0
        const totalAum = customerData?.reduce((sum, c) => sum + (c.total_aum || 0), 0) || 0

        // 긴급 조치 필요 이벤트 수
        const { data: eventData, error: eventError } = await supabase
          .from('customer_scenario_events')
          .select(`
            id,
            priority,
            customers!inner (customer_group)
          `)
          .eq('status', 'pending')

        if (eventError) throw eventError

        const urgentActions = eventData?.length || 0
        const vipUrgentCount = eventData?.filter(
          (e: any) => e.customers?.customer_group === 'vip'
        ).length || 0

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
  }, [])

  return { stats, isLoading, error }
}
