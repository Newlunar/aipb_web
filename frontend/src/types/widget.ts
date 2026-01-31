export interface WidgetTemplate {
  id: string
  name: string
  type: 'summary-card' | 'action-list' | 'schedule'
  icon: string
  description: string
  gridSize: { width: number; height: number }
}

export interface SavedWidget {
  id: string
  templateId: string
  title: string
  config: any
  createdAt: string
  updatedAt: string
}

export const widgetTemplates: WidgetTemplate[] = [
  {
    id: 'summary-card',
    name: '요약 카드',
    type: 'summary-card',
    icon: '📊',
    description: '주요 지표를 한눈에 보여주는 카드 위젯',
    gridSize: { width: 1, height: 1 }
  },
  {
    id: 'action-list',
    name: '액션리스트',
    type: 'action-list',
    icon: '📋',
    description: '고객 목록 및 액션 아이템을 테이블 형태로 표시',
    gridSize: { width: 3, height: 1 }
  },
  {
    id: 'schedule',
    name: '일정',
    type: 'schedule',
    icon: '📅',
    description: '오늘의 일정을 시간순으로 표시',
    gridSize: { width: 3, height: 1 }
  }
]

// localStorage에서 위젯 목록 불러오기
export function loadSavedWidgets(): SavedWidget[] {
  const saved = localStorage.getItem('widgets')
  return saved ? JSON.parse(saved) : []
}

// localStorage에 위젯 저장
export function saveWidget(widget: Omit<SavedWidget, 'id' | 'createdAt' | 'updatedAt'>): SavedWidget {
  const widgets = loadSavedWidgets()
  const newWidget: SavedWidget = {
    ...widget,
    id: `widget-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  widgets.push(newWidget)
  localStorage.setItem('widgets', JSON.stringify(widgets))
  return newWidget
}

// 위젯 삭제
export function deleteWidget(id: string): void {
  const widgets = loadSavedWidgets().filter(w => w.id !== id)
  localStorage.setItem('widgets', JSON.stringify(widgets))
}

// 위젯 업데이트
export function updateWidget(id: string, updates: Partial<SavedWidget>): SavedWidget | null {
  const widgets = loadSavedWidgets()
  const index = widgets.findIndex(w => w.id === id)
  if (index === -1) return null
  
  widgets[index] = {
    ...widgets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem('widgets', JSON.stringify(widgets))
  return widgets[index]
}
