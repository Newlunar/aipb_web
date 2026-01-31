import { Bell, Users, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useFilter } from '../../contexts/FilterContext'

interface HeaderProps {
  title?: string
  subtitle?: string
  userName?: string
  userRole?: string
  notificationCount?: number
}

const customerGroupOptions = [
  { value: 'all', label: '전체 고객' },
  { value: 'vip', label: 'VIP 고객' },
  { value: 'major', label: '주요 고객' },
  { value: 'general', label: '일반 고객' },
  { value: 'prospect', label: '잠재 고객' },
]

export function Header({ 
  title = '대시보드',
  subtitle = '오늘의 주요 업무와 고객 현황을 확인하세요.',
  userName = '김미래', 
  userRole = 'WM',
  notificationCount = 3 
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { customerGroup, setCustomerGroup } = useFilter()

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-6">
      {/* 페이지 타이틀 + 부제 */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <span className="text-sm text-white/70">{subtitle}</span>
      </div>

      {/* 고객 그룹 필터 */}
      <div className="flex items-center gap-3">
        <Users size={18} className="text-white/70" />
        <select
          value={customerGroup}
          onChange={(e) => setCustomerGroup(e.target.value)}
          className="px-3 py-1.5 text-sm font-medium border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 text-white min-w-[140px]"
        >
          {customerGroupOptions.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 오른쪽 영역 */}
      <div className="flex items-center gap-4">
        {/* 알림 */}
        <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-xs bg-white text-primary font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 사용자 */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">{userName}</div>
              <div className="text-xs text-white/70">{userRole}</div>
            </div>
            <ChevronDown size={16} className="text-white/70" />
          </button>

          {/* 드롭다운 메뉴 */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                내 프로필
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                환경설정
              </button>
              <hr className="my-1" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
