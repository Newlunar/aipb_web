import {
  type BarChartWidgetConfig,
  type BarChartVariant,
  type BarChartDataItem,
  type SavedWidget
} from '../../../types/widget'
import { mockBarChartMonthlyAum, mockBarChartMonthlyAumSeries } from '../../../data/mockData'

const SERIES_COLORS = [
  'bg-[#F47920]',   // primary
  'bg-[#002B5B]',   // secondary
  'bg-[#00A0E9]',   // accent
  'bg-emerald-500',
  'bg-amber-500'
]

interface BarChartWidgetProps {
  widget: SavedWidget
}

function getMaxValue(items: BarChartDataItem[], stacked: boolean): number {
  if (items.length === 0) return 0
  if (stacked) {
    return Math.max(...items.map((d) => d.values.reduce((a, b) => a + b, 0)))
  }
  return Math.max(...items.flatMap((d) => d.values))
}

/** 가로 바 스택형: 각 행 = 라벨, 가로 막대가 값 합으로 스택 */
function HorizontalBarStacked({
  data,
  seriesLabels,
  maxVal: _maxVal
}: {
  data: BarChartDataItem[]
  seriesLabels: string[]
  maxVal: number
}) {
  return (
    <div className="space-y-3 flex-1 min-h-0 flex flex-col">
      {data.map((item, i) => {
        const total = item.values.reduce((a, b) => a + b, 0)
        return (
          <div key={i} className="flex items-center gap-3 min-w-0">
            <span className="text-sm text-gray-600 w-20 flex-shrink-0 truncate" title={item.label}>
              {item.label}
            </span>
            <div className="flex-1 min-w-0 h-6 bg-gray-100 rounded overflow-hidden flex">
              {item.values.map((v, j) => {
                const pct = total > 0 ? (v / total) * 100 : 0
                return (
                  <div
                    key={j}
                    className={`${SERIES_COLORS[j % SERIES_COLORS.length]} flex-shrink-0 transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${seriesLabels[j] ?? `시리즈 ${j + 1}`}: ${v}`}
                  />
                )
              })}
            </div>
            <span className="text-sm font-medium text-gray-800 w-12 text-right flex-shrink-0">
              {total.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** 세로 바 스택형: 각 열 = 라벨, 세로 막대가 값 합으로 스택 */
function VerticalBarStacked({
  data,
  seriesLabels,
  maxVal
}: {
  data: BarChartDataItem[]
  seriesLabels: string[]
  maxVal: number
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 flex items-end justify-around gap-2 px-2 min-h-[120px]">
        {data.map((item, i) => {
          const total = item.values.reduce((a, b) => a + b, 0)
          const heightPct = maxVal > 0 ? (total / maxVal) * 100 : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center min-w-0">
              <div
                className="w-full rounded-t flex flex-col-reverse overflow-hidden flex-1 min-h-0"
                style={{ height: `${heightPct}%`, minHeight: total > 0 ? 4 : 0 }}
              >
                {item.values.map((v, j) => {
                  const pct = total > 0 ? (v / total) * 100 : 0
                  return (
                    <div
                      key={j}
                      className={`${SERIES_COLORS[j % SERIES_COLORS.length]} flex-shrink-0 w-full`}
                      style={{ height: `${pct}%`, minHeight: v > 0 ? 2 : 0 }}
                      title={`${seriesLabels[j] ?? `시리즈 ${j + 1}`}: ${v}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-around gap-2 px-2 mt-2">
        {data.map((item, i) => (
          <span key={i} className="text-xs text-gray-600 truncate flex-1 text-center min-w-0" title={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** 세로 바 그룹형: 각 열 = 라벨, 시리즈별로 나란히 막대 */
function VerticalBarGrouped({
  data,
  seriesLabels,
  maxVal
}: {
  data: BarChartDataItem[]
  seriesLabels: string[]
  maxVal: number
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 flex items-end justify-around gap-1 px-2 min-h-[120px]">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex gap-0.5 items-end justify-center min-w-0">
            {item.values.map((v, j) => {
              const heightPct = maxVal > 0 ? (v / maxVal) * 100 : 0
              return (
                <div
                  key={j}
                  className="flex-1 min-w-[8px] max-w-[24px] flex flex-col justify-end rounded-t"
                  title={`${seriesLabels[j] ?? `시리즈 ${j + 1}`}: ${v}`}
                >
                  <div
                    className={`w-full ${SERIES_COLORS[j % SERIES_COLORS.length]} rounded-t transition-all`}
                    style={{ height: `${heightPct}%`, minHeight: v > 0 ? 4 : 0 }}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-around gap-1 px-2 mt-2">
        {data.map((item, i) => (
          <span key={i} className="text-xs text-gray-600 truncate flex-1 text-center min-w-0" title={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  const config = (widget.config || {}) as BarChartWidgetConfig
  const variant: BarChartVariant = config.chartVariant ?? 'vertical-bar-stacked'
  const rawData = config.data ?? []
  const rawSeriesLabels = config.seriesLabels ?? []
  const hasSavedData = rawData.length > 0 && rawData.every((d) => d?.label != null && Array.isArray(d?.values))
  const data = hasSavedData ? rawData : mockBarChartMonthlyAum
  const seriesLabels = hasSavedData ? rawSeriesLabels : mockBarChartMonthlyAumSeries

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[200px] flex items-center justify-center text-gray-500">
        <p>표시할 데이터가 없습니다. 위젯 설정에서 리스트 데이터를 입력하세요.</p>
      </div>
    )
  }

  const stacked = variant !== 'vertical-bar-grouped'
  const maxVal = getMaxValue(data, stacked)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full min-h-[200px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{widget.title}</h3>
        {!hasSavedData && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 flex-shrink-0">샘플 데이터</span>
        )}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {variant === 'horizontal-bar-stacked' && (
          <HorizontalBarStacked data={data} seriesLabels={seriesLabels} maxVal={maxVal} />
        )}
        {variant === 'vertical-bar-stacked' && (
          <VerticalBarStacked data={data} seriesLabels={seriesLabels} maxVal={maxVal} />
        )}
        {variant === 'vertical-bar-grouped' && (
          <VerticalBarGrouped data={data} seriesLabels={seriesLabels} maxVal={maxVal} />
        )}
      </div>
      {seriesLabels.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
          {seriesLabels.map((name, j) => (
            <span key={j} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className={`w-3 h-3 rounded ${SERIES_COLORS[j % SERIES_COLORS.length]}`} />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
