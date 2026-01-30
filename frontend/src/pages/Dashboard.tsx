import { TrendingUp, Users, Calendar, AlertTriangle } from 'lucide-react'
import { ActionListWidget } from '../components/widgets/ActionList'
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
}

function SummaryCard({ title, value, change, changeType = 'neutral', icon, iconBg }: SummaryCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
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

export function Dashboard() {
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
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">오늘의 주요 업무와 고객 현황을 확인하세요.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="관리 고객"
          value="128명"
          change="+3명 (이번 달)"
          changeType="positive"
          icon={<Users size={24} className="text-secondary" />}
          iconBg="bg-secondary/10"
        />
        <SummaryCard
          title="총 AUM"
          value="1,250억"
          change="+2.4% (전월 대비)"
          changeType="positive"
          icon={<TrendingUp size={24} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <SummaryCard
          title="오늘 일정"
          value="5건"
          change="2건 완료"
          changeType="neutral"
          icon={<Calendar size={24} className="text-primary" />}
          iconBg="bg-primary/10"
        />
        <SummaryCard
          title="긴급 조치"
          value="8건"
          change="VIP 3건 포함"
          changeType="negative"
          icon={<AlertTriangle size={24} className="text-red-500" />}
          iconBg="bg-red-100"
        />
      </div>

      {/* 위젯 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 만기 고객 목록 */}
        <ActionListWidget
          title="만기 고객 목록"
          data={mockMaturityData}
          templateConfig={defaultTemplateConfig}
          dataSourceConfig={maturityDataSourceConfig}
          onRowClick={handleRowClick}
          onAction={handleAction}
        />

        {/* 장기 미접촉 고객 */}
        <ActionListWidget
          title="장기 미접촉 고객"
          data={mockNoContactData}
          templateConfig={defaultTemplateConfig}
          dataSourceConfig={noContactDataSourceConfig}
          onRowClick={handleRowClick}
          onAction={handleAction}
        />
      </div>

      {/* VIP 강등 위험 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionListWidget
          title="VIP 강등 위험 고객"
          data={mockVipRiskData}
          templateConfig={defaultTemplateConfig}
          dataSourceConfig={vipRiskDataSourceConfig}
          onRowClick={handleRowClick}
          onAction={handleAction}
        />

        {/* 오늘의 일정 (플레이스홀더) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 일정</h3>
          <div className="space-y-3">
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
