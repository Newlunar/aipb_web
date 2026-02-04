import { useState, useMemo } from 'react'
import { Search, Filter, Bot, User, Cpu, CheckCircle, XCircle, Wrench, Clock, Zap, Target } from 'lucide-react'
import { mockAgentData, type AgentData } from '../data/mockData'

type AgentStatus = 'all' | 'active' | 'inactive' | 'maintenance'
type AgentType = 'all' | 'ai' | 'human' | 'hybrid'

const statusConfig = {
  active: { label: '활성', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inactive: { label: '비활성', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  maintenance: { label: '점검중', color: 'bg-yellow-100 text-yellow-700', icon: Wrench }
}

const typeConfig = {
  ai: { label: 'AI', color: 'bg-blue-100 text-blue-700', icon: Bot },
  human: { label: '휴먼', color: 'bg-purple-100 text-purple-700', icon: User },
  hybrid: { label: '하이브리드', color: 'bg-indigo-100 text-indigo-700', icon: Cpu }
}

function AgentCard({ agent }: { agent: AgentData }) {
  const status = statusConfig[agent.status]
  const type = typeConfig[agent.type]
  const StatusIcon = status.icon
  const TypeIcon = type.icon

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center`}>
            <TypeIcon size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${type.color}`}>
              {type.label}
            </span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
          <StatusIcon size={14} />
          {status.label}
        </span>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

      {/* 능력 태그 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.capabilities.slice(0, 3).map((cap, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Zap size={14} />
          </div>
          <p className="text-lg font-semibold text-gray-900">{agent.tasksCompleted.toLocaleString()}</p>
          <p className="text-xs text-gray-500">완료 작업</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Target size={14} />
          </div>
          <p className="text-lg font-semibold text-gray-900">{agent.successRate}%</p>
          <p className="text-xs text-gray-500">성공률</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
            <Clock size={14} />
          </div>
          <p className="text-lg font-semibold text-gray-900">{agent.avgResponseTime}s</p>
          <p className="text-xs text-gray-500">평균 응답</p>
        </div>
      </div>

      {/* 마지막 활동 */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
        <Clock size={12} />
        마지막 활동: {formatDate(agent.lastActive)}
      </div>
    </div>
  )
}

export function Agents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AgentStatus>('all')
  const [typeFilter, setTypeFilter] = useState<AgentType>('all')

  const filteredAgents = useMemo(() => {
    return mockAgentData.filter((agent) => {
      // 검색어 필터
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesName = agent.name.toLowerCase().includes(term)
        const matchesDescription = agent.description.toLowerCase().includes(term)
        const matchesCapabilities = agent.capabilities.some(cap => cap.toLowerCase().includes(term))
        if (!matchesName && !matchesDescription && !matchesCapabilities) return false
      }

      // 상태 필터
      if (statusFilter !== 'all' && agent.status !== statusFilter) return false

      // 타입 필터
      if (typeFilter !== 'all' && agent.type !== typeFilter) return false

      return true
    })
  }, [searchTerm, statusFilter, typeFilter])

  // 통계 계산
  const stats = useMemo(() => {
    const total = mockAgentData.length
    const active = mockAgentData.filter(a => a.status === 'active').length
    const avgSuccess = mockAgentData.reduce((sum, a) => sum + a.successRate, 0) / total
    const totalTasks = mockAgentData.reduce((sum, a) => sum + a.tasksCompleted, 0)
    return { total, active, avgSuccess: avgSuccess.toFixed(1), totalTasks }
  }, [])

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">전체 Agent</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">활성 Agent</p>
          <p className="text-2xl font-bold text-green-900">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <p className="text-sm text-purple-600 font-medium">평균 성공률</p>
          <p className="text-2xl font-bold text-purple-900">{stats.avgSuccess}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <p className="text-sm text-orange-600 font-medium">총 완료 작업</p>
          <p className="text-2xl font-bold text-orange-900">{stats.totalTasks.toLocaleString()}</p>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 검색 */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Agent 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AgentStatus)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="maintenance">점검중</option>
          </select>
        </div>

        {/* 타입 필터 */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AgentType)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">전체 타입</option>
          <option value="ai">AI</option>
          <option value="human">휴먼</option>
          <option value="hybrid">하이브리드</option>
        </select>
      </div>

      {/* 결과 수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-gray-900">{filteredAgents.length}</span>개의 Agent
        </p>
      </div>

      {/* Agent 그리드 */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Bot size={48} className="mx-auto mb-4 opacity-50" />
          <p>검색 결과가 없습니다.</p>
          <p className="text-sm mt-1">검색어나 필터를 변경해보세요.</p>
        </div>
      )}
    </div>
  )
}
