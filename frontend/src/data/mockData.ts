import type { ActionListData, ActionListTemplateConfig, ActionListDataSourceConfig } from '../components/widgets/ActionList'

// 기본 템플릿 설정
export const defaultTemplateConfig: ActionListTemplateConfig = {
  size: { width: 2, height: 1 },
  grid: {
    show_header: true,
    row_height: 'normal',
    stripe: true,
    border: true,
    hover_highlight: true
  },
  filter_area: {
    enabled: true,
    position: 'top',
    show_search: true,
    show_reset: true
  },
  pagination: {
    enabled: true,
    position: 'bottom',
    show_total: true,
    show_page_size: true,
    page_size_options: [10, 20, 50]
  },
  action_area: {
    enabled: true,
    position: 'row'
  },
  row_click: {
    enabled: true,
    action: 'popup'
  }
}

// 만기 고객 데이터소스 설정
export const maturityDataSourceConfig: ActionListDataSourceConfig = {
  query: {
    base_table: 'customer_scenario_events',
    scenario_filter: { codes: ['DEPOSIT_MATURITY', 'FUND_MATURITY', 'ELS_MATURITY', 'BOND_MATURITY'] },
    status_filter: ['pending']
  },
  columns: [
    { key: 'customer_name', label: '고객명', source: 'customer', field: 'name', width: '120px', clickable: true },
    { key: 'grade', label: '등급', source: 'customer', field: 'grade', width: '80px', format: { type: 'badge' } },
    { key: 'scenario', label: '시나리오', source: 'scenario', field: 'name', width: '120px' },
    { key: 'event_date', label: '만기일', source: 'event', field: 'event_date', width: '100px', format: { type: 'date' }, sortable: true },
    { key: 'principal', label: '원금', source: 'event', field: 'event_data.principal', width: '120px', align: 'right', format: { type: 'currency' }, sortable: true }
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

// 미접촉 고객 데이터소스 설정
export const noContactDataSourceConfig: ActionListDataSourceConfig = {
  query: {
    base_table: 'customer_scenario_events',
    scenario_filter: { codes: ['LONG_NO_CONTACT'] },
    status_filter: ['pending']
  },
  columns: [
    { key: 'customer_name', label: '고객명', source: 'customer', field: 'name', width: '120px', clickable: true },
    { key: 'grade', label: '등급', source: 'customer', field: 'grade', width: '80px', format: { type: 'badge' } },
    { key: 'total_aum', label: 'AUM', source: 'customer', field: 'total_aum', width: '120px', align: 'right', format: { type: 'currency' }, sortable: true },
    { key: 'days', label: '미접촉', source: 'event', field: 'event_data.days_since_contact', width: '80px', align: 'center', sortable: true }
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

// VIP 강등 위험 데이터소스 설정
export const vipRiskDataSourceConfig: ActionListDataSourceConfig = {
  query: {
    base_table: 'customer_scenario_events',
    scenario_filter: { codes: ['VIP_DOWNGRADE_RISK'] },
    status_filter: ['pending']
  },
  columns: [
    { key: 'customer_name', label: '고객명', source: 'customer', field: 'name', width: '120px', clickable: true },
    { key: 'grade', label: '현재 등급', source: 'customer', field: 'grade', width: '80px', format: { type: 'badge' } },
    { key: 'total_aum', label: '현재 AUM', source: 'customer', field: 'total_aum', width: '120px', align: 'right', format: { type: 'currency' } },
    { key: 'shortfall', label: '부족 금액', source: 'event', field: 'event_data.shortfall', width: '120px', align: 'right', format: { type: 'currency' } }
  ],
  filters: [],
  default_sort: { field: 'event_data.shortfall', direction: 'asc' },
  default_page_size: 10,
  row_actions: [
    { key: 'call', label: '전화', icon: 'phone', type: 'call', variant: 'primary' },
    { key: 'detail', label: '상세', icon: 'info', type: 'popup', variant: 'ghost' }
  ]
}

// 목 데이터: 만기 고객
export const mockMaturityData: ActionListData[] = [
  {
    id: '1',
    customer_id: 'c00000001',
    customer_name: '김철수',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 1250000000,
    phone: '010-1234-5678',
    scenario_code: 'DEPOSIT_MATURITY',
    scenario_name: '예금 만기',
    scenario_color: '#F59E0B',
    event_date: '2026-02-05',
    event_data: { principal: 500000000, interest_rate: 3.5, product_name: '정기예금 1년' },
    status: 'pending',
    priority: 1
  },
  {
    id: '2',
    customer_id: 'c00000002',
    customer_name: '이영희',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 2100000000,
    phone: '010-2345-6789',
    scenario_code: 'FUND_MATURITY',
    scenario_name: '펀드 만기',
    scenario_color: '#3B82F6',
    event_date: '2026-02-08',
    event_data: { principal: 300000000, fund_name: '글로벌 성장 펀드' },
    status: 'pending',
    priority: 1
  },
  {
    id: '3',
    customer_id: 'c00000003',
    customer_name: '박민수',
    customer_group: 'general',
    grade: '2등급',
    total_aum: 450000000,
    phone: '010-3456-7890',
    scenario_code: 'ELS_MATURITY',
    scenario_name: 'ELS 만기',
    scenario_color: '#10B981',
    event_date: '2026-02-10',
    event_data: { principal: 100000000, product_name: 'KB ELS 제245호' },
    status: 'pending',
    priority: 2
  },
  {
    id: '4',
    customer_id: 'c00000004',
    customer_name: '정수진',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 3200000000,
    phone: '010-4567-8901',
    scenario_code: 'DEPOSIT_MATURITY',
    scenario_name: '예금 만기',
    scenario_color: '#F59E0B',
    event_date: '2026-02-12',
    event_data: { principal: 800000000, interest_rate: 4.0, product_name: '특판 정기예금' },
    status: 'pending',
    priority: 1
  },
  {
    id: '5',
    customer_id: 'c00000005',
    customer_name: '최동현',
    customer_group: 'general',
    grade: '2등급',
    total_aum: 320000000,
    phone: '010-5678-9012',
    scenario_code: 'BOND_MATURITY',
    scenario_name: '채권 만기',
    scenario_color: '#8B5CF6',
    event_date: '2026-02-15',
    event_data: { principal: 200000000, bond_name: '국고채 3년물' },
    status: 'pending',
    priority: 2
  },
  {
    id: '6',
    customer_id: 'c00000006',
    customer_name: '강미영',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 1800000000,
    phone: '010-6789-0123',
    scenario_code: 'FUND_MATURITY',
    scenario_name: '펀드 만기',
    scenario_color: '#3B82F6',
    event_date: '2026-02-18',
    event_data: { principal: 500000000, fund_name: '안정형 채권 펀드' },
    status: 'pending',
    priority: 1
  }
]

// 목 데이터: 미접촉 고객
export const mockNoContactData: ActionListData[] = [
  {
    id: '7',
    customer_id: 'c00000007',
    customer_name: '윤서연',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 1500000000,
    phone: '010-7890-1234',
    scenario_code: 'LONG_NO_CONTACT',
    scenario_name: '장기 미접촉',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { days_since_contact: 45, last_contact_type: '방문상담' },
    status: 'pending',
    priority: 1
  },
  {
    id: '8',
    customer_id: 'c00000008',
    customer_name: '한지민',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 2800000000,
    phone: '010-8901-2345',
    scenario_code: 'LONG_NO_CONTACT',
    scenario_name: '장기 미접촉',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { days_since_contact: 62, last_contact_type: '전화상담' },
    status: 'pending',
    priority: 1
  },
  {
    id: '9',
    customer_id: 'c00000009',
    customer_name: '송민호',
    customer_group: 'general',
    grade: '2등급',
    total_aum: 380000000,
    phone: '010-9012-3456',
    scenario_code: 'LONG_NO_CONTACT',
    scenario_name: '장기 미접촉',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { days_since_contact: 35, last_contact_type: '이메일' },
    status: 'pending',
    priority: 2
  },
  {
    id: '10',
    customer_id: 'c00000010',
    customer_name: '임채영',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 4200000000,
    phone: '010-0123-4567',
    scenario_code: 'LONG_NO_CONTACT',
    scenario_name: '장기 미접촉',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { days_since_contact: 78, last_contact_type: '방문상담' },
    status: 'pending',
    priority: 1
  }
]

// 목 데이터: VIP 강등 위험
export const mockVipRiskData: ActionListData[] = [
  {
    id: '11',
    customer_id: 'c00000011',
    customer_name: '오승훈',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 980000000,
    phone: '010-1111-2222',
    scenario_code: 'VIP_DOWNGRADE_RISK',
    scenario_name: 'VIP 강등 위험',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { shortfall: 20000000, threshold: 1000000000, downgrade_date: '2026-03-01' },
    status: 'pending',
    priority: 1
  },
  {
    id: '12',
    customer_id: 'c00000012',
    customer_name: '배수현',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 950000000,
    phone: '010-2222-3333',
    scenario_code: 'VIP_DOWNGRADE_RISK',
    scenario_name: 'VIP 강등 위험',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { shortfall: 50000000, threshold: 1000000000, downgrade_date: '2026-03-01' },
    status: 'pending',
    priority: 1
  },
  {
    id: '13',
    customer_id: 'c00000013',
    customer_name: '조은비',
    customer_group: 'vip',
    grade: '1등급',
    total_aum: 920000000,
    phone: '010-3333-4444',
    scenario_code: 'VIP_DOWNGRADE_RISK',
    scenario_name: 'VIP 강등 위험',
    scenario_color: '#EF4444',
    event_date: '2026-01-30',
    event_data: { shortfall: 80000000, threshold: 1000000000, downgrade_date: '2026-03-01' },
    status: 'pending',
    priority: 1
  }
]
