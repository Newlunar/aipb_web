import { Bell, Users, User, ChevronDown, RefreshCw } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useFilter } from '../../contexts/FilterContext'
import { useUser } from '../../contexts/UserContext'

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
  userName: userNameProp,
  userRole: userRoleProp,
  notificationCount = 3,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { customerGroup, setCustomerGroup } = useFilter()
  const { currentUser, users, setCurrentUserById, isLoading, refetchUsers } = useUser()

  const userName = userNameProp ?? currentUser?.name ?? '사용자'
  const userRole = userRoleProp ?? currentUser?.role ?? '-'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectUser = (userId: string) => {
    setCurrentUserById(userId)
    setShowUserMenu(false)
  }

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
        <button
          type="button"
          className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-xs bg-white text-primary font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 사용자 */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[140px]"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left truncate">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs text-white/70">
                {currentUser ? `${currentUser.id} · ${userRole}` : userRole}
              </div>
            </div>
            <ChevronDown size={16} className="text-white/70 shrink-0" />
          </button>

          {/* 드롭다운: 유저 변경 + 메뉴 */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">유저 변경</span>
                <button
                  type="button"
                  onClick={() => refetchUsers()}
                  className="p-1 text-gray-400 hover:text-primary rounded"
                  title="목록 새로고침"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">불러오는 중...</div>
                ) : users.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    등록된 사용자가 없습니다.
                  </div>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        currentUser?.id === u.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {u.id} · {u.role}
                        </div>
                      </div>
                      {currentUser?.id === u.id && (
                        <span className="text-xs text-primary font-medium shrink-0">선택됨</span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  내 프로필
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  환경설정
                </button>
                <hr className="my-1" />
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
