/**
 * 위젯 코드 기반 API 매핑 (백엔드 widget_registry와 동기화)
 * 데이터소스 대신 widgetCode를 리액트 인터페이스에 연결
 */

export type ActionListWidgetCode = 'AL001' | 'AL002' | 'AL003'
export type BarChartWidgetCode = 'BC001' | 'BC002' | 'BC003'
export type TextBlockWidgetCode = 'TB001'
export type SummaryCardWidgetCode = 'SC001' | 'SC002'

export type WidgetCode =
  | ActionListWidgetCode
  | BarChartWidgetCode
  | TextBlockWidgetCode
  | SummaryCardWidgetCode

/** 위젯 코드 → API 경로 매핑 */
export const WIDGET_API_PATHS: Record<WidgetCode, string> = {
  // Summary Card
  SC001: '/api/widgets/summary-card/SC001/data',
  SC002: '/api/widgets/summary-card/SC002/data',
  // Action List
  AL001: '/api/widgets/action-list/AL001/data',
  AL002: '/api/widgets/action-list/AL002/data',
  AL003: '/api/widgets/action-list/AL003/data',
  // Bar Chart
  BC001: '/api/widgets/bar-chart/BC001/data',
  BC002: '/api/widgets/bar-chart/BC002/data',
  BC003: '/api/widgets/bar-chart/BC003/data',
  // Text Block
  TB001: '/api/widgets/text-block/TB001/data',
}

/** 위젯 코드별 메타 정보 (백엔드 WIDGET_CODE_REGISTRY와 동기화) */
export interface WidgetCodeInfo {
  code: string
  template: string
  title: string
  description?: string
  data_source?: string
  variant?: string
}

export const WIDGET_CODE_REGISTRY: Record<WidgetCode, WidgetCodeInfo> = {
  SC001: {
    code: 'SC001',
    template: 'summary-card',
    variant: 'stats',
    title: '요약 지표',
    description: '관리 고객, AUM, 긴급 조치 등',
  },
  SC002: {
    code: 'SC002',
    template: 'summary-card',
    variant: 'settings',
    title: '요약 카드 설정',
    description: 'card_type별 value, description',
  },
  AL001: {
    code: 'AL001',
    template: 'action-list',
    data_source: 'maturity',
    title: '만기 고객 목록',
    description: '예금/펀드/ELS/채권 만기',
  },
  AL002: {
    code: 'AL002',
    template: 'action-list',
    data_source: 'no-contact',
    title: '장기 미접촉 고객',
    description: '연락 없는 고객',
  },
  AL003: {
    code: 'AL003',
    template: 'action-list',
    data_source: 'vip-risk',
    title: 'VIP 강등 위험 고객',
    description: 'VIP 기준 미달 위험',
  },
  BC001: {
    code: 'BC001',
    template: 'bar-chart',
    data_source: 'scenario-count',
    title: '시나리오별 건수',
    description: '시나리오 유형별 pending 건수',
  },
  BC002: {
    code: 'BC002',
    template: 'bar-chart',
    data_source: 'event-by-grade',
    title: '등급별 이벤트',
    description: 'VIP/일반별 만기·미접촉·VIP위험 건수',
  },
  BC003: {
    code: 'BC003',
    template: 'bar-chart',
    data_source: 'monthly-aum',
    title: '월별 AUM 추이',
    description: '예금/펀드/주식 월별',
  },
  TB001: {
    code: 'TB001',
    template: 'text-block',
    data_source: 'feed',
    title: '피드/브리핑',
    description: '뉴스, 리서치, 시그널 등',
  },
}

/** 위젯 코드로 API 경로 조회 */
export function getApiPathForCode(code: WidgetCode): string {
  return WIDGET_API_PATHS[code]
}

/** template별 사용 가능한 위젯 코드 목록 */
export function getWidgetCodesByTemplate(
  template: 'summary-card' | 'action-list' | 'bar-chart' | 'text-block'
): WidgetCode[] {
  return (Object.keys(WIDGET_CODE_REGISTRY) as WidgetCode[]).filter(
    (c) => WIDGET_CODE_REGISTRY[c].template === template
  )
}

/** 기존 dataSource → widgetCode 호환 매핑 (마이그레이션용) */
export const DATA_SOURCE_TO_WIDGET_CODE: Record<string, WidgetCode> = {
  maturity: 'AL001',
  'no-contact': 'AL002',
  'vip-risk': 'AL003',
  'scenario-count': 'BC001',
  'event-by-grade': 'BC002',
  'monthly-aum': 'BC003',
  feed: 'TB001',
}

/** widgetCode → dataSource (UI display config 조회용) */
export const WIDGET_CODE_TO_DATA_SOURCE: Record<WidgetCode, string> = {
  SC001: 'stats',
  SC002: 'settings',
  AL001: 'maturity',
  AL002: 'no-contact',
  AL003: 'vip-risk',
  BC001: 'scenario-count',
  BC002: 'event-by-grade',
  BC003: 'monthly-aum',
  TB001: 'feed',
}
