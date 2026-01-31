import { TrendingUp, Users, Calendar, AlertTriangle } from 'lucide-react'
import { ActionListWidget } from '../components/widgets/ActionList'
import { useMaturityData, useNoContactData, useVipRiskData, useDashboardStats } from '../hooks'
import {
  defaultTemplateConfig,
  maturityDataSourceConfig,
  noContactDataSourceConfig,
  vipRiskDataSourceConfig,
  mockMaturityData,
  mockNoContactData,
  mockVipRiskData
} from '../data/mockData'

// 요약 카드 컴포넌트
interface SummaryCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  iconBg: string
  isLoading?: boolean
}

function SummaryCard({ title, value, change, changeType = 'neutral', icon, iconBg, isLoading }: SummaryCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between">
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
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// 금액 포맷팅
function formatAum(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toLocaleString()}억`
  }
  if (value >= 10000) {
    return `${(value / 10000).toLocaleString()}만`
  }
  return value.toLocaleString() + '원'
}

export function Dashboard() {
  // 실제 데이터 hooks
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { data: maturityData, isLoading: maturityLoading, error: maturityError } = useMaturityData()
  const { data: noContactData, isLoading: noContactLoading, error: noContactError } = useNoContactData()
  const { data: vipRiskData, isLoading: vipRiskLoading, error: vipRiskError } = useVipRiskData()

  // 에러 발생 시 목 데이터 사용
  const finalMaturityData = maturityError ? mockMaturityData : maturityData
  const finalNoContactData = noContactError ? mockNoContactData : noContactData
  const finalVipRiskData = vipRiskError ? mockVipRiskData : vipRiskData

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row)
    // TODO: 고객 상세 팝업 열기
  }

  const handleAction = (action: string, row: any) => {
    console.log('Action:', action, 'Row:', row)
    // TODO: 액션 처리 (전화 걸기, 상세 보기 등)
  }

  return (
    <div className="space-y-6">
      {/* 요약 카드 - 5열 그리드 기준 (현재 4개, 각 카드는 1칸 규격) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="관리 고객"
          value={`${stats.totalCustomers}명`}
          change="+3명 (이번 달)"
          changeType="positive"
          icon={<Users size={24} className="text-secondary" />}
          iconBg="bg-secondary/10"
          isLoading={statsLoading}
        />
        <SummaryCard
          title="총 AUM"
          value={formatAum(stats.totalAum)}
          change="+2.4% (전월 대비)"
          changeType="positive"
          icon={<TrendingUp size={24} className="text-green-600" />}
          iconBg="bg-green-100"
          isLoading={statsLoading}
        />
        <SummaryCard
          title="오늘 일정"
          value={`${stats.todaySchedules}건`}
          change="2건 완료"
          changeType="neutral"
          icon={<Calendar size={24} className="text-primary" />}
          iconBg="bg-primary/10"
          isLoading={statsLoading}
        />
        <SummaryCard
          title="긴급 조치"
          value={`${stats.urgentActions}건`}
          change={`VIP ${stats.vipUrgentCount}건 포함`}
          changeType="negative"
          icon={<AlertTriangle size={24} className="text-red-500" />}
          iconBg="bg-red-100"
          isLoading={statsLoading}
        />
      </div>

      {/* 위젯 그리드 - 5열 기준 (3칸 또는 2칸 규격) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* 만기 고객 목록 - 3칸 규격 */}
        <div className="lg:col-span-3">
          <ActionListWidget
            title="만기 고객 목록"
            data={finalMaturityData}
            templateConfig={defaultTemplateConfig}
            dataSourceConfig={maturityDataSourceConfig}
            isLoading={maturityLoading}
            onRowClick={handleRowClick}
            onAction={handleAction}
          />
        </div>

        {/* 장기 미접촉 고객 - 2칸 규격 */}
        <div className="lg:col-span-2">
          <ActionListWidget
            title="장기 미접촉 고객"
            data={finalNoContactData}
            templateConfig={defaultTemplateConfig}
            dataSourceConfig={noContactDataSourceConfig}
            isLoading={noContactLoading}
            onRowClick={handleRowClick}
            onAction={handleAction}
          />
        </div>

        {/* VIP 강등 위험 - 2칸 규격 */}
        <div className="lg:col-span-2">
          <ActionListWidget
            title="VIP 강등 위험 고객"
            data={finalVipRiskData}
            templateConfig={defaultTemplateConfig}
            dataSourceConfig={vipRiskDataSourceConfig}
            isLoading={vipRiskLoading}
            onRowClick={handleRowClick}
            onAction={handleAction}
          />
        </div>

        {/* 오늘의 일정 - 3칸 규격 */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[260px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 일정</h3>
          <div className="space-y-3 flex-1 overflow-auto">
            {[
              { time: '09:30', title: '김철수 고객 방문 상담', type: '상담' },
              { time: '11:00', title: '이영희 고객 포트폴리오 리뷰', type: '리뷰' },
              { time: '14:00', title: '신규 상품 설명회', type: '세미나' },
              { time: '15:30', title: '박민수 고객 전화 상담', type: '상담' },
              { time: '17:00', title: '주간 실적 리뷰 미팅', type: '미팅' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-primary w-12">{item.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
