import type { ActionListData, ActionListTemplateConfig, ActionListDataSourceConfig } from '../components/widgets/ActionList'
import type { BarChartDataItem } from '../types/widget'
import { getDataSource } from '../types/datasource'

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

// 데이터소스 설정은 이제 types/datasource.ts의 DATA_SOURCE_REGISTRY에서 관리됩니다
// 레거시 호환성을 위해 여기서 re-export
export const maturityDataSourceConfig: ActionListDataSourceConfig =
  getDataSource('maturity')?.config || {} as ActionListDataSourceConfig

export const noContactDataSourceConfig: ActionListDataSourceConfig =
  getDataSource('no-contact')?.config || {} as ActionListDataSourceConfig

export const vipRiskDataSourceConfig: ActionListDataSourceConfig =
  getDataSource('vip-risk')?.config || {} as ActionListDataSourceConfig

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

// ----- 바 차트용 목 데이터 (리스트형) -----

/** 월별 AUM 추이 (억 원): 예금, 펀드, 주식 */
export const mockBarChartMonthlyAum: BarChartDataItem[] = [
  { label: '1월', values: [120, 85, 45] },
  { label: '2월', values: [135, 92, 52] },
  { label: '3월', values: [128, 98, 58] },
  { label: '4월', values: [142, 105, 62] },
  { label: '5월', values: [138, 110, 68] },
  { label: '6월', values: [155, 118, 75] }
]
export const mockBarChartMonthlyAumSeries = ['예금', '펀드', '주식']

/** 고객등급별 이벤트 건수: 만기, 미접촉, VIP위험 */
export const mockBarChartEventByGrade: BarChartDataItem[] = [
  { label: 'VIP', values: [4, 3, 3] },
  { label: '일반', values: [2, 1, 0] },
  { label: '우량', values: [1, 0, 0] }
]
export const mockBarChartEventByGradeSeries = ['만기', '장기미접촉', 'VIP강등위험']

/** 시나리오 유형별 건수 (가로 바용): 라벨 = 시나리오명, 값 = 건수 */
export const mockBarChartScenarioCount: BarChartDataItem[] = [
  { label: '예금 만기', values: [5] },
  { label: '펀드 만기', values: [3] },
  { label: 'ELS 만기', values: [1] },
  { label: '장기 미접촉', values: [4] },
  { label: 'VIP 강등 위험', values: [3] }
]
export const mockBarChartScenarioCountSeries = ['건수']

/** 상품별 AUM 비중 (억): 정기예금, MMDA, 펀드, ELS, 채권 */
export const mockBarChartProductAum: BarChartDataItem[] = [
  { label: '1월', values: [320, 180, 250, 90, 120] },
  { label: '2월', values: [335, 195, 265, 95, 125] },
  { label: '3월', values: [328, 202, 272, 98, 130] }
]
export const mockBarChartProductAumSeries = ['정기예금', 'MMDA', '펀드', 'ELS', '채권']

// ----- Agent 목 데이터 -----

export interface AgentData {
  id: string
  name: string
  type: 'ai' | 'human' | 'hybrid'
  status: 'active' | 'inactive' | 'maintenance'
  description: string
  capabilities: string[]
  lastActive: string
  tasksCompleted: number
  successRate: number
  avgResponseTime: number // 초 단위
  createdAt: string
}

export const mockAgentData: AgentData[] = [
  {
    id: 'agent-001',
    name: '고객 상담 AI',
    type: 'ai',
    status: 'active',
    description: '고객 문의 응대 및 기본 상담을 담당하는 AI 에이전트입니다.',
    capabilities: ['고객문의 응대', '상품 안내', 'FAQ 응답', '상담 예약'],
    lastActive: '2026-02-04T14:30:00',
    tasksCompleted: 1524,
    successRate: 94.2,
    avgResponseTime: 2.3,
    createdAt: '2025-06-15'
  },
  {
    id: 'agent-002',
    name: '포트폴리오 분석 AI',
    type: 'ai',
    status: 'active',
    description: '고객 포트폴리오를 분석하고 투자 제안을 생성하는 AI 에이전트입니다.',
    capabilities: ['포트폴리오 분석', '리스크 평가', '투자 제안', '시장 분석'],
    lastActive: '2026-02-04T14:25:00',
    tasksCompleted: 892,
    successRate: 97.8,
    avgResponseTime: 5.7,
    createdAt: '2025-07-20'
  },
  {
    id: 'agent-003',
    name: '문서 처리 AI',
    type: 'ai',
    status: 'active',
    description: '계약서 및 금융 문서를 자동으로 처리하는 AI 에이전트입니다.',
    capabilities: ['문서 분류', 'OCR 처리', '데이터 추출', '문서 검증'],
    lastActive: '2026-02-04T14:20:00',
    tasksCompleted: 3241,
    successRate: 99.1,
    avgResponseTime: 1.8,
    createdAt: '2025-05-10'
  },
  {
    id: 'agent-004',
    name: '일정 관리 AI',
    type: 'ai',
    status: 'maintenance',
    description: '상담 일정 조율 및 알림을 관리하는 AI 에이전트입니다.',
    capabilities: ['일정 조율', '알림 발송', '충돌 감지', '리마인더'],
    lastActive: '2026-02-04T10:00:00',
    tasksCompleted: 756,
    successRate: 91.5,
    avgResponseTime: 0.8,
    createdAt: '2025-08-05'
  },
  {
    id: 'agent-005',
    name: '리스크 모니터링 AI',
    type: 'ai',
    status: 'active',
    description: '실시간 시장 리스크를 모니터링하고 알림을 발송하는 AI 에이전트입니다.',
    capabilities: ['실시간 모니터링', '이상 탐지', '알림 발송', '리포트 생성'],
    lastActive: '2026-02-04T14:35:00',
    tasksCompleted: 2156,
    successRate: 98.5,
    avgResponseTime: 0.5,
    createdAt: '2025-04-22'
  },
  {
    id: 'agent-006',
    name: '고객 분류 AI',
    type: 'ai',
    status: 'inactive',
    description: '고객을 세그먼트별로 분류하고 타겟팅 전략을 제안하는 AI 에이전트입니다.',
    capabilities: ['고객 세그먼테이션', '행동 분석', '타겟팅 제안', '캠페인 최적화'],
    lastActive: '2026-01-28T16:00:00',
    tasksCompleted: 445,
    successRate: 88.3,
    avgResponseTime: 8.2,
    createdAt: '2025-09-12'
  },
  {
    id: 'agent-007',
    name: '자동 리포팅 AI',
    type: 'ai',
    status: 'active',
    description: '정기 리포트를 자동 생성하고 배포하는 AI 에이전트입니다.',
    capabilities: ['리포트 생성', '데이터 시각화', '자동 배포', '맞춤형 요약'],
    lastActive: '2026-02-04T09:00:00',
    tasksCompleted: 1823,
    successRate: 96.7,
    avgResponseTime: 12.5,
    createdAt: '2025-03-18'
  },
  {
    id: 'agent-008',
    name: '컴플라이언스 검토 AI',
    type: 'hybrid',
    status: 'active',
    description: '규제 준수 여부를 자동으로 검토하는 하이브리드 에이전트입니다.',
    capabilities: ['규제 검토', '위반 탐지', '보고서 작성', '가이드라인 검증'],
    lastActive: '2026-02-04T13:45:00',
    tasksCompleted: 678,
    successRate: 99.4,
    avgResponseTime: 15.3,
    createdAt: '2025-10-01'
  }
]
