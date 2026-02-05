import {
  LayoutDashboard,
  Users,
  TrendingUp,
  BookOpen,
  FlaskConical,
  LayoutGrid,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react'
import { useState } from 'react'
import type { ElementType } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

interface MenuItem {
  id: string
  label: string
  icon: ElementType
  path: string
  badge?: number
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, path: '/' },
  { id: 'customers', label: '고객 관리', icon: Users, path: '/customers' },
  { id: 'agents', label: 'Agent 관리', icon: Bot, path: '/agents' },
  { id: 'strategy', label: '투자전략', icon: TrendingUp, path: '/strategy' },
  { id: 'knowledge', label: '지식관리', icon: BookOpen, path: '/knowledge' },
  { id: 'lab', label: '실험실', icon: FlaskConical, path: '/lab' },
  { id: 'widgets', label: '위젯설정', icon: LayoutGrid, path: '/widgets' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  // 아이콘 크기 통일 (24px)
  const iconSize = 24

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${collapsed ? 'w-14' : 'w-52'}
      `}
    >
      {/* 로고 영역 */}
      <div className={`flex items-center border-b border-gray-200 ${collapsed ? 'justify-center px-2 h-16' : 'justify-between px-4 py-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">AI자산관리비서</span>
              <span className="font-bold text-lg text-gray-900 leading-tight">투자전략 Web</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 py-4">
        <ul className={`space-y-1 ${collapsed ? 'px-1' : 'px-2'}`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    w-full flex items-center rounded-lg transition-colors
                    ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}
                    ${isActive
                      ? 'bg-gray-100 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
                        <IconComponent size={iconSize} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-base">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-sm rounded-full bg-primary text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 하단 설정 */}
      <div className={`border-t border-gray-200 ${collapsed ? 'p-1' : 'p-2'}`}>
        <button
          onClick={() => navigate('/settings')}
          className={`
            w-full flex items-center rounded-lg transition-colors
            ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}
            text-gray-600 hover:bg-gray-50 hover:text-gray-900
          `}
          title={collapsed ? '설정' : undefined}
        >
          <Settings size={iconSize} />
          {!collapsed && <span className="text-base">설정</span>}
        </button>
      </div>
    </aside>
  )
}
