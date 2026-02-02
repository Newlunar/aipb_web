import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 지정 테이블에서 wm_id + card_type 필터로 조회
 * card_type별 value(메인 숫자), description(부가설명/change) 반환
 * 테이블은 config.table로 지정 가능 (기본: summary_card_settings)
 */
export interface SummaryCardSettingRow {
  value: string
  value_type?: string
  description?: string | null
}

export type SummaryCardSettingsMap = Record<string, SummaryCardSettingRow>

interface UseSummaryCardSettingsResult {
  /** card_type → { value, description } (value=메인 숫자, description=부가설명/change) */
  settingsByCardType: SummaryCardSettingsMap
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const DEFAULT_TABLE = 'summary_card_settings'

export function useSummaryCardSettings(
  wmId: string | null,
  tableName?: string | null
): UseSummaryCardSettingsResult {
  const table = tableName || DEFAULT_TABLE
  const [settingsByCardType, setSettingsByCardType] = useState<SummaryCardSettingsMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!wmId) {
      setSettingsByCardType({})
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from(table)
        .select('card_type, value, value_type, description')
        .eq('wm_id', wmId)

      if (fetchError) throw fetchError

      const map: SummaryCardSettingsMap = {}
      ;(data ?? []).forEach((row: { card_type: string; value: string; value_type?: string; description?: string | null }) => {
        map[row.card_type] = {
          value: row.value,
          value_type: row.value_type,
          description: row.description ?? undefined
        }
      })
      setSettingsByCardType(map)
    } catch (err) {
      console.error(`Failed to fetch ${table}:`, err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setSettingsByCardType({})
    } finally {
      setIsLoading(false)
    }
  }, [wmId, table])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settingsByCardType, isLoading, error, refetch: fetchSettings }
}
