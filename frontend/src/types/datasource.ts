import type { ActionListDataSourceConfig } from '../components/widgets/ActionList'

/**
 * 데이터소스 명세
 * 위젯에서 사용할 수 있는 데이터의 원천을 정의
 */
export interface DataSourceSpec {
  id: string                              // 데이터소스 고유 ID
  name: string                            // 표시명
  description: string                     // 설명
  category: 'customer-event' | 'metric' | 'schedule' // 카테고리
  applicableTemplates: string[]           // 이 데이터소스를 사용할 수 있는 템플릿 ID들
  config: ActionListDataSourceConfig      // 실제 데이터소스 설정
}

/**
 * 데이터소스 레지스트리
 * 모든 사용 가능한 데이터소스를 한 곳에서 관리
 */
export const DATA_SOURCE_REGISTRY: Record<string, DataSourceSpec> = {
  // 만기 고객 데이터소스
  'maturity': {
    id: 'maturity',
    name: '만기 고객',
    description: '예금, 펀드, ELS, 채권 등의 만기가 도래하는 고객 목록',
    category: 'customer-event',
    applicableTemplates: ['action-list'],
    config: {
      query: {
        base_table: 'customer_scenario_events',
        filters: [
          {
            column: 'status',
            operator: 'in',
            value: ['pending']
          }
        ]
      },
      columns: [
        {
          key: 'customer_name',
          label: '고객명',
          source: 'customer',
          field: 'name',
          width: '120px',
          clickable: true
        },
        {
          key: 'grade',
          label: '등급',
          source: 'customer',
          field: 'grade',
          width: '80px',
          format: { type: 'badge' }
        },
        {
          key: 'scenario',
          label: '시나리오',
          source: 'scenario',
          field: 'name',
          width: '120px'
        },
        {
          key: 'event_date',
          label: '만기일',
          source: 'event',
          field: 'event_date',
          width: '100px',
          format: { type: 'date' },
          sortable: true
        },
        {
          key: 'principal',
          label: '원금',
          source: 'event',
          field: 'event_data.principal',
          width: '120px',
          align: 'right',
          format: { type: 'currency' },
          sortable: true
        }
      ],
      filters: [
        {
          key: 'customer_group',
          label: '고객 그룹',
          type: 'select',
          options: [
            { value: 'all', label: '전체' },
            { value: 'vip', label: '주요고객' },
            { value: 'general', label: '일반' }
          ],
          default_value: 'all',
          target: { source: 'customer', field: 'customer_group' }
        }
      ],
      default_sort: { field: 'event_date', direction: 'asc' },
      default_page_size: 10,
      row_actions: [
        { key: 'call', label: '전화', icon: 'phone', type: 'call', variant: 'primary' },
        { key: 'detail', label: '상세', icon: 'info', type: 'popup', variant: 'ghost' }
      ]
    }
  },

  // 장기 미접촉 고객 데이터소스
  'no-contact': {
    id: 'no-contact',
    name: '장기 미접촉 고객',
    description: '일정 기간 이상 연락이 없는 고객 목록',
    category: 'customer-event',
    applicableTemplates: ['action-list'],
    config: {
      query: {
        base_table: 'customer_scenario_events',
        scenario_filter: { codes: ['LONG_NO_CONTACT'] },
        filters: [
          {
            column: 'status',
            operator: 'in',
            value: ['pending']
          },
          {
            column: 'event_data->days_since_contact',
            operator: 'gte',
            value: 60
          }
        ]
      },
      columns: [
        {
          key: 'customer_name',
          label: '고객명',
          source: 'customer',
          field: 'name',
          width: '120px',
          clickable: true
        },
        {
          key: 'grade',
          label: '등급',
          source: 'customer',
          field: 'grade',
          width: '80px',
          format: { type: 'badge' }
        },
        {
          key: 'total_aum',
          label: 'AUM',
          source: 'customer',
          field: 'total_aum',
          width: '120px',
          align: 'right',
          format: { type: 'currency' },
          sortable: true
        },
        {
          key: 'days',
          label: '미접촉',
          source: 'event',
          field: 'event_data.days_since_contact',
          width: '80px',
          align: 'center',
          sortable: true
        }
      ],
      filters: [
        {
          key: 'customer_group',
          label: '고객 그룹',
          type: 'select',
          options: [
            { value: 'all', label: '전체' },
            { value: 'vip', label: '주요고객' },
            { value: 'general', label: '일반' }
          ],
          default_value: 'all',
          target: { source: 'customer', field: 'customer_group' }
        }
      ],
      default_sort: { field: 'event_data.days_since_contact', direction: 'desc' },
      default_page_size: 10,
      row_actions: [
        { key: 'call', label: '전화', icon: 'phone', type: 'call', variant: 'primary' },
        { key: 'sms', label: '문자', icon: 'message-square', type: 'message', variant: 'secondary' }
      ]
    }
  },

  // VIP 강등 위험 고객 데이터소스
  'vip-risk': {
    id: 'vip-risk',
    name: 'VIP 강등 위험',
    description: 'VIP 등급 유지 기준에 미달할 위험이 있는 고객 목록',
    category: 'customer-event',
    applicableTemplates: ['action-list'],
    config: {
      query: {
        base_table: 'customer_scenario_events',
        scenario_filter: { codes: ['VIP_DOWNGRADE_RISK'] },
        filters: [
          {
            column: 'status',
            operator: 'in',
            value: ['pending']
          },
          {
            column: 'customers.customer_group',
            operator: 'in',
            value: ['vip', 'vvip']
          }
        ]
      },
      columns: [
        {
          key: 'customer_name',
          label: '고객명',
          source: 'customer',
          field: 'name',
          width: '120px',
          clickable: true
        },
        {
          key: 'grade',
          label: '현재 등급',
          source: 'customer',
          field: 'grade',
          width: '80px',
          format: { type: 'badge' }
        },
        {
          key: 'total_aum',
          label: '현재 AUM',
          source: 'customer',
          field: 'total_aum',
          width: '120px',
          align: 'right',
          format: { type: 'currency' }
        },
        {
          key: 'shortfall',
          label: '부족 금액',
          source: 'event',
          field: 'event_data.shortfall',
          width: '120px',
          align: 'right',
          format: { type: 'currency' }
        }
      ],
      filters: [],
      default_sort: { field: 'event_data.shortfall', direction: 'asc' },
      default_page_size: 10,
      row_actions: [
        { key: 'call', label: '전화', icon: 'phone', type: 'call', variant: 'primary' },
        { key: 'detail', label: '상세', icon: 'info', type: 'popup', variant: 'ghost' }
      ]
    }
  },

  // 요약 지표용 데이터소스들
  'metric-customers': {
    id: 'metric-customers',
    name: '관리 고객 수',
    description: '담당 WM의 총 관리 고객 수',
    category: 'metric',
    applicableTemplates: ['summary-card'],
    config: {} as any // 요약 카드는 별도 로직 사용
  },

  'metric-aum': {
    id: 'metric-aum',
    name: '총 AUM',
    description: '담당 고객의 총 운용자산',
    category: 'metric',
    applicableTemplates: ['summary-card'],
    config: {} as any
  },

  'metric-schedules': {
    id: 'metric-schedules',
    name: '오늘 일정',
    description: '오늘의 예정된 일정 건수',
    category: 'metric',
    applicableTemplates: ['summary-card'],
    config: {} as any
  },

  'metric-urgent': {
    id: 'metric-urgent',
    name: '긴급 조치',
    description: '긴급 처리가 필요한 이벤트 건수',
    category: 'metric',
    applicableTemplates: ['summary-card'],
    config: {} as any
  }
}

/**
 * 데이터소스 목록 조회
 */
export function getDataSources(): DataSourceSpec[] {
  return Object.values(DATA_SOURCE_REGISTRY)
}

/**
 * ID로 데이터소스 조회
 */
export function getDataSource(id: string): DataSourceSpec | undefined {
  return DATA_SOURCE_REGISTRY[id]
}

/**
 * 템플릿에서 사용 가능한 데이터소스 조회
 */
export function getDataSourcesForTemplate(templateId: string): DataSourceSpec[] {
  return getDataSources().filter(ds =>
    ds.applicableTemplates.includes(templateId)
  )
}

/**
 * 카테고리별 데이터소스 조회
 */
export function getDataSourcesByCategory(category: DataSourceSpec['category']): DataSourceSpec[] {
  return getDataSources().filter(ds => ds.category === category)
}
