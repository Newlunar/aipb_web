import { useTextBlockByCode, useFeedData, useWidgetDataByApiPath } from '../../../hooks/useWidgetData'
import type { TextBlockWidgetConfig, SavedWidget } from '../../../types/widget'
import { isApiBasedConfig } from '../../../types/widget'

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let v: unknown = obj
  for (const p of parts) v = (v as Record<string, unknown>)?.[p]
  return v
}

const DEFAULT_CONTENT = `## 오늘의 AI 브리핑

**시장 요약**
- 코스피는 전일 대비 소폭 하락
- 주요 급등/급락 종목 모니터링 중

**WM 액션 포인트**
1. 만기 임박 고객 3건 연락 권장
2. VIP 강등 위험 1건 검토 필요
`

/** 간단한 마크다운 파서: ## ** - 1. 지원 (외부 패키지 없음) */
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listOrdered = false

  const flushList = () => {
    if (listItems.length === 0) return
    const ListTag = listOrdered ? 'ol' : 'ul'
    elements.push(
      <ListTag key={elements.length} className="my-2 pl-5 list-disc">
        {listItems.map((item, i) => (
          <li key={i}>{inlineFormat(item)}</li>
        ))}
      </ListTag>
    )
    listItems = []
  }

  const inlineFormat = (s: string) => {
    const parts: React.ReactNode[] = []
    let remaining = s
    let key = 0
    while (remaining.length > 0) {
      const bold = remaining.match(/\*\*(.+?)\*\*/)
      const italic = remaining.match(/\*(.+?)\*/)
      let match: RegExpMatchArray | null = null
      let replacement: React.ReactNode = null
      if (bold && (!italic || bold.index! <= (italic?.index ?? Infinity))) {
        match = bold
        replacement = <strong key={key++} className="font-semibold text-gray-900">{match[1]}</strong>
      } else if (italic) {
        match = italic
        replacement = <em key={key++}>{match[1]}</em>
      }
      if (match) {
        if (match.index! > 0) {
          parts.push(remaining.slice(0, match.index))
        }
        parts.push(replacement)
        remaining = remaining.slice(match.index! + match[0].length)
      } else {
        parts.push(remaining)
        break
      }
    }
    return <>{parts}</>
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    const ul = line.match(/^-\s+(.+)$/)
    const ol = line.match(/^(\d+)\.\s+(.+)$/)

    if (h2) {
      flushList()
      elements.push(<h2 key={elements.length} className="text-base font-semibold text-gray-900 mt-3 mb-2">{inlineFormat(h2[1])}</h2>)
    } else if (h3) {
      flushList()
      elements.push(<h3 key={elements.length} className="text-sm font-semibold text-gray-800 mt-2 mb-1">{inlineFormat(h3[1])}</h3>)
    } else if (ul) {
      if (listItems.length > 0 && listOrdered) flushList()
      listOrdered = false
      listItems.push(ul[1])
    } else if (ol) {
      if (listItems.length > 0 && !listOrdered) flushList()
      listOrdered = true
      listItems.push(ol[2])
    } else if (line.trim() === '') {
      flushList()
      elements.push(<div key={elements.length} className="h-2" />)
    } else {
      flushList()
      elements.push(<p key={elements.length} className="my-2">{inlineFormat(line)}</p>)
    }
  }
  flushList()

  return <>{elements}</>
}

interface TextBlockWidgetProps {
  widget: SavedWidget
}

export function TextBlockWidget({ widget }: TextBlockWidgetProps) {
  const config = (widget.config || {}) as TextBlockWidgetConfig
  const widgetCode = config.widgetCode ?? (config.dataSource === 'feed' ? 'TB001' : undefined)
  const dataSource = config.dataSource
  const isApiBased = isApiBasedConfig(config) && config.displayType === 'text-block'
  const useCodeApi = !isApiBased && !!widgetCode
  const useDataSource = useCodeApi || !!dataSource || isApiBased

  const feedTypeFilter = config.query?.filters?.find((f: { column: string }) => f.column === 'feed_type')
  const feedTypes = Array.isArray(feedTypeFilter?.value)
    ? (feedTypeFilter.value as string[]).join(',')
    : (feedTypeFilter?.value as string | undefined)

  const titleKey = isApiBased ? (config.titleKey ?? 'title') : ''
  const contentKey = isApiBased ? (config.contentKey ?? 'content') : ''

  const apiData = useWidgetDataByApiPath<unknown[]>({
    apiPath: isApiBased ? config.apiPath : '',
    apiParams: (config as { apiParams?: Record<string, string | number> })?.apiParams,
    skip: !isApiBased,
  })

  const fromCodeApi = useTextBlockByCode({
    widgetCode: 'TB001',
    feedType: feedTypes ?? undefined,
    limit: config.query?.limit ?? 5,
    skip: !useCodeApi,
  })

  const fromFeedData = useFeedData({
    dataSourceId: dataSource ?? 'feed',
    skip: useCodeApi || isApiBased,
    columnMapping: config.columnMapping,
    queryOverride: config.query
  })

  const apiFeedData = isApiBased && Array.isArray(apiData.data)
    ? apiData.data.map((item: unknown) => ({
        title: String(getByPath(item as Record<string, unknown>, titleKey) ?? ''),
        content: String(getByPath(item as Record<string, unknown>, contentKey) ?? ''),
      }))
    : []

  const { data: feedData, isLoading, error } = isApiBased
    ? { data: apiFeedData, isLoading: apiData.isLoading, error: apiData.error }
    : useCodeApi
      ? fromCodeApi
      : fromFeedData

  const staticContent = config.content?.trim() || ''
  const isSample = !useDataSource && !staticContent

  // 데이터소스 사용 시: feed 항목들을 ## 제목\n내용 형태로 합침
  const feedDisplayContent = feedData.length > 0
    ? feedData.map((item: { title?: string; content?: string }) => `## ${item.title ?? ''}\n\n${item.content ?? ''}`).join('\n\n---\n\n')
    : ''

  const displayContent = useDataSource ? feedDisplayContent : (staticContent || DEFAULT_CONTENT)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full min-h-0 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{widget.title}</h3>
        {isSample && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 flex-shrink-0">
            샘플 데이터
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto text-sm text-gray-700">
        {useDataSource && isLoading && (
          <p className="text-gray-500 py-4">로딩 중...</p>
        )}
        {useDataSource && error && (
          <p className="text-red-600 py-4">데이터를 불러오지 못했습니다.</p>
        )}
        {(!useDataSource || (!isLoading && !error)) && (
          displayContent ? (
            <SimpleMarkdown text={displayContent} />
          ) : (
            <p className="text-gray-500 py-4">표시할 피드가 없습니다.</p>
          )
        )}
      </div>
    </div>
  )
}
