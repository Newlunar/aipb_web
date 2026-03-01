import { Users, TrendingUp, Calendar, AlertTriangle, DollarSign, Target } from 'lucide-react'
import { useSummaryCardSettings } from '../../../hooks/useSummaryCardSettings'
import { useUser } from '../../../contexts/UserContext'
import { useWidgetDataByApiPath } from '../../../hooks/useWidgetData'
import {
  type SummaryCardWidgetConfig,
  type SummaryCardItemDef,
  type SummaryCardIconName,
  type SavedWidget
} from '../../../types/widget'
import { isApiBasedConfig } from '../../../types/widget'

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let v: unknown = obj
  for (const p of parts) v = (v as Record<string, unknown>)?.[p]
  return v
}

function formatMetricValue(val: unknown, format?: string, suffix?: string): string {
  const num = Number(val)
  if (Number.isNaN(num)) return String(val ?? '-')
  if (format === 'currency') {
    if (num >= 100_000_000) return `${(num / 100_000_000).toLocaleString()}억`
    if (num >= 10_000) return `${(num / 10_000).toLocaleString()}만`
    return num.toLocaleString() + '원'
  }
  if (format === 'number' && suffix) return `${num.toLocaleString()}${suffix}`
  return num.toLocaleString()
}

const ICON_MAP: Record<SummaryCardIconName, React.ComponentType<{ size?: number; className?: string }>> = {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign,
  Target
}

/** summary_card_settings.value (문자열) + value_type/card format에 따라 표시 문자열 반환 */
function formatCardValueFromTable(
  valueStr: string,
  valueType: string | undefined,
  format: SummaryCardItemDef['format'],
  suffix?: string
): string {
  const num = Number(valueStr)
  if (Number.isNaN(num)) return valueStr
  if (format === 'currency' || valueType === 'currency') {
    if (num >= 100_000_000) return `${(num / 100_000_000).toLocaleString()}억`
    if (num >= 10_000) return `${(num / 10_000).toLocaleString()}만`
    return num.toLocaleString() + '원'
  }
  if ((format === 'number' || valueType === 'number') && suffix) return `${num.toLocaleString()}${suffix}`
  return valueStr
}

interface SummaryCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  iconBg: string
  isLoading?: boolean
}

function SummaryCardItem({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBg,
  isLoading
}: SummaryCardProps) {
  const changeColor =
    changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500'

  return (
    <div className="w-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {change && !isLoading && (
            <p className={`text-sm mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
    </div>
  )
}

interface SummaryCardWidgetProps {
  widget: SavedWidget
}

/**
 * 요약 카드 위젯
 * value = summary_card_settings.value, change = summary_card_settings.description
 */
export function SummaryCardWidget({ widget }: SummaryCardWidgetProps) {
  const { currentUser } = useUser()
  const config = (widget.config || {}) as SummaryCardWidgetConfig
  const isApiBased = isApiBasedConfig(config) && config.displayType === 'summary-card'
  const tableName = config.table ?? 'summary_card_settings'
  const { settingsByCardType, isLoading } = useSummaryCardSettings(currentUser?.id ?? null, tableName)

  const baseApiParams = (config as { apiParams?: Record<string, string | number> })?.apiParams ?? {}
  const apiParams = isApiBased && currentUser?.id ? { ...baseApiParams, wm_id: currentUser.id } : baseApiParams
  const apiData = useWidgetDataByApiPath<Record<string, unknown>>({
    apiPath: isApiBased ? config.apiPath : '',
    apiParams,
    skip: !isApiBased,
  })

  const cards = config.cards ?? []
  const metricMappings = isApiBased ? (config.metricMappings ?? []) : []
  const effectiveCards: Array<{
    metricId?: string
    title: string
    value?: string
    change?: string
    changeType?: SummaryCardItemDef['changeType']
    icon?: SummaryCardItemDef['icon']
    iconBg?: string
    format?: SummaryCardItemDef['format']
    suffix?: string
  }> = isApiBased
    ? metricMappings.map((m) => {
        const raw = apiData.data ? getByPath(apiData.data, m.responseKey) : undefined
        return {
          title: m.title,
          value: formatMetricValue(raw, m.format, m.suffix),
          icon: m.icon,
          iconBg: m.iconBg,
        }
      })
    : cards
  const gridCols = config.gridCols ?? config.gridWidth ?? 4

  if (effectiveCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full min-h-0 flex items-center justify-center text-center text-gray-500">
        <p>표시할 카드가 없습니다. 위젯 설정에서 카드를 추가하세요.</p>
      </div>
    )
  }

  const gridClass =
    gridCols === 1
      ? 'grid-cols-1'
      : gridCols === 2
        ? 'grid-cols-2'
        : gridCols === 3
          ? 'grid-cols-2 md:grid-cols-3'
          : gridCols === 4
            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
            : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'

  const displayLoading = isApiBased ? apiData.isLoading : isLoading

  return (
    <div className={`min-w-0 h-full min-h-0 grid ${gridClass} gap-4 [&>*]:min-w-0 [&>*]:max-w-full`}>
      {effectiveCards.map((card, index) => {
        const row = !isApiBased && card.metricId ? settingsByCardType[card.metricId] : undefined
        const valueStr = row?.value ?? card.value ?? '-'
        const value = !isApiBased && row?.value != null
          ? formatCardValueFromTable(valueStr, row.value_type, (card as SummaryCardItemDef).format, (card as SummaryCardItemDef).suffix)
          : (card.value ?? '-')
        const change = (row?.description ?? (card as SummaryCardItemDef).change) || undefined
        const IconComponent = (card.icon && ICON_MAP[card.icon]) ? ICON_MAP[card.icon] : Users
        const iconBg = card.iconBg ?? 'bg-primary/10'

        return (
          <SummaryCardItem
            key={`${widget.id}-${index}-${card.metricId ?? index}`}
            title={card.title}
            value={value}
            change={change}
            changeType={(card as SummaryCardItemDef).changeType}
            icon={<IconComponent size={24} className="text-primary" />}
            iconBg={iconBg}
            isLoading={displayLoading}
          />
        )
      })}
    </div>
  )
}
