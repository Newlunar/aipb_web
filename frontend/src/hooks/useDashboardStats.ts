import { useState, useEffect } from 'react'
import { api } from '../lib/api'
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
        const data = await api.get<{
          totalCustomers: number
          totalAum: number
          todaySchedules: number
          urgentActions: number
          vipUrgentCount: number
        }>('/api/widgets/summary-card/stats', { wm_id: wmId ?? undefined })

        setStats({
          totalCustomers: data.totalCustomers ?? 0,
          totalAum: data.totalAum ?? 0,
          todaySchedules: data.todaySchedules ?? 5,
          urgentActions: data.urgentActions ?? 0,
          vipUrgentCount: data.vipUrgentCount ?? 0
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
