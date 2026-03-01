export type PageType = 'dashboard' | 'customers' | 'agents' | 'strategy' | 'knowledge' | 'lab' | 'widgets' | 'settings'

export interface WidgetTemplate {
  id: string
  name: string
  type: 'summary-card' | 'action-list' | 'schedule' | 'bar-chart' | 'text-block'
  icon: string
  description: string
  gridSize: { width: number; height: number }
  /** 바차트 전용: 선택 가능한 비율 (2:1 가로넓음, 1:2 세로길음) */
  sizePresets?: { width: number; height: number }[]
}

export interface SavedWidget {
  id: string
  /** 표현 타입 (action-list, bar-chart 등). templateId로도 사용 */
  templateId: string
  title: string
  config: any
  pages?: PageType[] // 위젯이 노출되는 페이지 목록
  createdAt: string
  updatedAt: string
}

// ----- API 기반 위젯 config (템플릿 선택 대신 API 경로 직접 입력) -----

export type WidgetDisplayType = 'action-list' | 'bar-chart' | 'text-block' | 'summary-card' | 'schedule'

/** API 응답 key → 컬럼 매핑 및 표현 스타일 */
export interface ColumnMappingDef {
  /** API 응답의 key (점 표기 지원: event_data.principal) */
  responseKey: string
  /** 컬럼 헤더 라벨 */
  label: string
  /** 표현 스타일 */
  format?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'progress'
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  clickable?: boolean
}

/** API 기반 위젯 공통 config */
export interface ApiWidgetConfigBase {
  /** API 경로 (직접 입력) */
  apiPath: string
  /** API 쿼리 파라미터 (예: wm_id) */
  apiParams?: Record<string, string | number>
  gridWidth?: number
  gridRows?: number
}

/** action-list: 배열 응답 → 테이블 행 */
export interface ActionListApiConfig extends ApiWidgetConfigBase {
  displayType: 'action-list'
  columnMappings: ColumnMappingDef[]
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
  pageSize?: number
}

/** bar-chart: { data, seriesLabels } 고정 구조 */
export interface BarChartApiConfig extends ApiWidgetConfigBase {
  displayType: 'bar-chart'
  chartVariant?: BarChartVariant
  labelKey?: string
  valuesKey?: string
}

/** text-block: 배열 [{ id, title, content }] */
export interface TextBlockApiConfig extends ApiWidgetConfigBase {
  displayType: 'text-block'
  titleKey?: string
  contentKey?: string
}

/** summary-card: { [key]: value } 또는 stats 객체 */
export interface SummaryCardApiConfig extends ApiWidgetConfigBase {
  displayType: 'summary-card'
  metricMappings: Array<{
    responseKey: string
    title: string
    format?: 'number' | 'currency' | 'default'
    icon?: SummaryCardIconName
    iconBg?: string
    suffix?: string
  }>
}

export type ApiWidgetConfig = ActionListApiConfig | BarChartApiConfig | TextBlockApiConfig | SummaryCardApiConfig

/** config가 API 기반인지 확인 */
export function isApiBasedConfig(config: unknown): config is ApiWidgetConfig {
  if (!config || typeof config !== 'object') return false
  const path = (config as Record<string, unknown>).apiPath
  return typeof path === 'string' && path.length > 0
}

// ----- 요약 카드 위젯 (summary-card) config 타입 -----
export type SummaryCardChangeType = 'positive' | 'negative' | 'neutral'
export type SummaryCardValueFormat = 'number' | 'currency' | 'default'
export type SummaryCardIconName =
  | 'Users'
  | 'TrendingUp'
  | 'Calendar'
  | 'AlertTriangle'
  | 'DollarSign'
  | 'Target'

export interface SummaryCardItemDef {
  metricId: string
  title: string
  change?: string
  changeType?: SummaryCardChangeType
  icon?: SummaryCardIconName
  iconBg?: string
  format?: SummaryCardValueFormat
  suffix?: string
}

export interface SummaryCardWidgetConfig {
  /** 부가설명 등 값을 가져올 테이블 이름 (예: summary_card_settings). 변경 가능. */
  table?: string
  /** 페이지 그리드에서 차지할 열 수 (1~5). 2면 2+3 배치 시 action-list(3) 옆에 붙음. */
  gridWidth?: number
  gridCols?: number
  gridRows?: number
  cards: SummaryCardItemDef[]
  order?: number
}

// ----- 바 차트 위젯 (bar-chart) 타입 -----
/** 차트 종류: 가로 바 스택형, 세로 바 스택형, 세로 바 그룹형 */
export type BarChartVariant = 'horizontal-bar-stacked' | 'vertical-bar-stacked' | 'vertical-bar-grouped'

/** 리스트형 입력: 각 항목은 라벨 + 시리즈 값 배열 */
export interface BarChartDataItem {
  label: string
  values: number[]
}

export interface BarChartWidgetConfig {
  /** 위젯 코드 (BC001|BC002|BC003) - API 매핑 키 */
  widgetCode?: 'BC001' | 'BC002' | 'BC003'
  /** 차트 종류 */
  chartVariant?: BarChartVariant
  /** 비율 선택: 2:1(가로 넓음) 또는 1:2(세로 길음) → gridWidth/gridRows 반영 */
  gridWidth?: number
  gridRows?: number
  /** 시리즈 이름 (범례용, values 순서와 매칭) */
  seriesLabels?: string[]
  /** 리스트형 데이터 (수동 입력 시, widgetCode 미사용) */
  data?: BarChartDataItem[]
  order?: number
}

// ----- 텍스트 블록 위젯 (text-block) 타입 -----
export interface TextBlockColumnMapping {
  /** feeds 테이블에서 제목에 매핑할 컬럼명 */
  title: string
  /** feeds 테이블에서 내용에 매핑할 컬럼명 */
  content: string
}

export interface TextBlockWidgetConfig {
  /** 마크다운 형식 텍스트 내용 (데이터소스 미사용 시) */
  content?: string
  /** 위젯 코드 (TB001) - API 매핑 키. 지정 시 /api/widgets/text-block/TB001/data 호출 */
  widgetCode?: 'TB001'
  /** 데이터소스 ID (feed 등). 레거시 - widgetCode 우선 */
  dataSource?: string
  /** 제목·내용 컬럼 매핑 (데이터소스 사용 시) */
  columnMapping?: TextBlockColumnMapping
  /** 쿼리 필터 오버라이드 (선택, 데이터소스 기본값 사용 시 생략) */
  query?: {
    filters?: Array<{ column: string; operator: string; value: unknown }>
    order?: { field: string; direction: 'asc' | 'desc' }
    limit?: number
  }
  /** 그리드 너비 (1~5) */
  gridWidth?: number
  /** 그리드 행 수 (1~4), 세로 길이 조절 */
  gridRows?: number
  order?: number
}

export const METRIC_ID_TO_STATS_KEY: Record<string, string> = {
  'metric-customers': 'totalCustomers',
  'metric-aum': 'totalAum',
  'metric-schedules': 'todaySchedules',
  'metric-urgent': 'urgentActions',
  'metric-vip-urgent': 'vipUrgentCount'
}

// 페이지 이름 매핑 (사이드바·위젯 노출 페이지와 동일)
export const PAGE_NAMES: Record<PageType, string> = {
  dashboard: '대시보드',
  customers: '고객관리',
  agents: 'Agent 관리',
  strategy: '투자전략',
  knowledge: '지식관리',
  lab: '실험실',
  widgets: '위젯설정',
  settings: '설정'
}

/** 위젯 노출 페이지 선택용 목록: 고객관리, 투자전략, 지식관리, 실험실 */
export const WIDGET_PAGE_OPTIONS: PageType[] = [
  'customers',
  'agents',
  'strategy',
  'knowledge',
  'lab'
]

export const widgetTemplates: WidgetTemplate[] = [
  {
    id: 'summary-card',
    name: '요약 카드',
    type: 'summary-card',
    icon: '📊',
    description: '주요 지표를 한눈에 보여주는 카드 위젯 (카드 가로·세로 개수 기준)',
    gridSize: { width: 2, height: 1 }
  },
  {
    id: 'action-list',
    name: '액션리스트',
    type: 'action-list',
    icon: '📋',
    description: '고객 목록 및 액션 아이템을 테이블 형태로 표시',
    gridSize: { width: 3, height: 1 }
  },
  {
    id: 'schedule',
    name: '일정',
    type: 'schedule',
    icon: '📅',
    description: '오늘의 일정을 시간순으로 표시',
    gridSize: { width: 3, height: 1 }
  },
  {
    id: 'bar-chart',
    name: '바 차트',
    type: 'bar-chart',
    icon: '📊',
    description: '가로/세로 바 차트 (스택형·그룹형). 2:1 또는 1:2 비율 선택',
    gridSize: { width: 2, height: 1 },
    sizePresets: [
      { width: 2, height: 1 }, // 2:1 가로 넓음
      { width: 1, height: 2 }   // 1:2 세로 길음
    ]
  },
  {
    id: 'text-block',
    name: '텍스트 블록',
    type: 'text-block',
    icon: '📝',
    description: '마크다운 형식의 텍스트/AI 브리핑 표시',
    gridSize: { width: 2, height: 1 }
  }
]

const WIDGET_PAGE_SELECTION_KEY = 'widgetPageSelection'

/** 페이지별로 배치할 위젯 ID 목록(순서) 조회. null이면 선택 없음 → 해당 페이지용 전체 위젯 표시 */
export function getPageWidgetSelection(page: PageType): string[] | null {
  try {
    const raw = localStorage.getItem(WIDGET_PAGE_SELECTION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Record<string, string[]>
    const ids = data[page]
    return Array.isArray(ids) ? ids : null
  } catch {
    return null
  }
}

/** 페이지별 배치 위젯 ID 목록(순서) 저장 */
export function setPageWidgetSelection(page: PageType, widgetIds: string[]): void {
  try {
    const raw = localStorage.getItem(WIDGET_PAGE_SELECTION_KEY)
    const data = (raw ? JSON.parse(raw) : {}) as Record<string, string[]>
    data[page] = widgetIds
    localStorage.setItem(WIDGET_PAGE_SELECTION_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

// localStorage에서 위젯 목록 불러오기
export function loadSavedWidgets(): SavedWidget[] {
  const saved = localStorage.getItem('widgets')
  return saved ? JSON.parse(saved) : []
}

// localStorage에 위젯 저장
export function saveWidget(widget: Omit<SavedWidget, 'id' | 'createdAt' | 'updatedAt'>): SavedWidget {
  const widgets = loadSavedWidgets()
  const newWidget: SavedWidget = {
    ...widget,
    id: `widget-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  widgets.push(newWidget)
  localStorage.setItem('widgets', JSON.stringify(widgets))
  return newWidget
}

// 위젯 삭제
export function deleteWidget(id: string): void {
  const widgets = loadSavedWidgets().filter(w => w.id !== id)
  localStorage.setItem('widgets', JSON.stringify(widgets))
}

// 위젯 업데이트
export function updateWidget(id: string, updates: Partial<SavedWidget>): SavedWidget | null {
  const widgets = loadSavedWidgets()
  const index = widgets.findIndex(w => w.id === id)
  if (index === -1) return null

  widgets[index] = {
    ...widgets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem('widgets', JSON.stringify(widgets))
  return widgets[index]
}

// 초기 위젯 데이터 생성
export function initializeDefaultWidgets(): void {
  const existing = loadSavedWidgets()

  // 이미 위젯이 있으면 초기화하지 않음
  if (existing.length > 0) return

  const defaultWidgets: Omit<SavedWidget, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      templateId: 'summary-card',
      title: '요약 지표',
      config: {
        table: 'summary_card_settings',
        gridWidth: 2,
        gridCols: 2,
        gridRows: 2,
        order: 0,
        cards: [
          {
            metricId: 'metric-customers',
            title: '관리 고객1',
            change: '+3명 (이번 달)',
            changeType: 'positive',
            icon: 'Users',
            iconBg: 'bg-secondary/10',
            format: 'number',
            suffix: '명'
          },
          {
            metricId: 'metric-aum',
            title: '총 AUM',
            change: '+2.4% (전월 대비)',
            changeType: 'positive',
            icon: 'TrendingUp',
            iconBg: 'bg-green-100',
            format: 'currency'
          },
          {
            metricId: 'metric-schedules',
            title: '오늘 일정',
            change: '2건 완료',
            changeType: 'neutral',
            icon: 'Calendar',
            iconBg: 'bg-primary/10',
            format: 'number',
            suffix: '건'
          }
        ]
      },
      pages: ['customers']
    },
    {
      templateId: 'action-list',
      title: '만기 고객 목록',
      config: {
        widgetCode: 'AL001',
        gridWidth: 3,
        order: 1
      },
      pages: ['customers']
    },
    {
      templateId: 'action-list',
      title: '장기 미접촉 고객',
      config: {
        widgetCode: 'AL002',
        gridWidth: 2,
        order: 2
      },
      pages: ['customers']
    },
    {
      templateId: 'action-list',
      title: 'VIP 강등 위험 고객',
      config: {
        widgetCode: 'AL003',
        gridWidth: 2,
        order: 3
      },
      pages: ['customers']
    },
    {
      templateId: 'schedule',
      title: '오늘의 일정',
      config: {
        gridWidth: 3,
        order: 4
      },
      pages: ['customers']
    }
  ]

  defaultWidgets.forEach(widget => saveWidget(widget))
}
