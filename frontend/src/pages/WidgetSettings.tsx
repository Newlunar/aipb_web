import { useState } from 'react'
import { Plus, LayoutGrid, Trash2, Edit } from 'lucide-react'
import { widgetTemplates, loadSavedWidgets, saveWidget, deleteWidget, type WidgetTemplate, type SavedWidget } from '../types/widget'

type Tab = 'create' | 'list'

export function WidgetSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [savedWidgets, setSavedWidgets] = useState<SavedWidget[]>(loadSavedWidgets())

  const refreshWidgets = () => {
    setSavedWidgets(loadSavedWidgets())
  }

  return (
    <div className="space-y-6">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 text-base font-medium transition-colors relative ${
              activeTab === 'list'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={20} />
              위젯 목록
            </div>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-base font-medium transition-colors relative ${
              activeTab === 'create'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus size={20} />
              위젯 생성
            </div>
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="py-4">
        {activeTab === 'list' && (
          <WidgetListTab widgets={savedWidgets} onRefresh={refreshWidgets} />
        )}
        {activeTab === 'create' && (
          <WidgetCreateTab onWidgetCreated={refreshWidgets} />
        )}
      </div>
    </div>
  )
}

// 위젯 목록 탭
function WidgetListTab({ widgets, onRefresh }: { widgets: SavedWidget[]; onRefresh: () => void }) {
  const handleDelete = (id: string) => {
    if (confirm('이 위젯을 삭제하시겠습니까?')) {
      deleteWidget(id)
      onRefresh()
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <LayoutGrid size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg">저장된 위젯이 없습니다</p>
        <p className="text-sm mt-2">새로운 위젯을 생성해보세요.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((widget) => {
        const template = widgetTemplates.find(t => t.id === widget.templateId)
        return (
          <div
            key={widget.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{template?.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                  <p className="text-sm text-gray-500">{template?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              생성일: {new Date(widget.createdAt).toLocaleDateString('ko-KR')}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(widget.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                삭제
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Edit size={16} />
                수정
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 위젯 생성 탭
function WidgetCreateTab({ onWidgetCreated }: { onWidgetCreated: () => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null)
  const [widgetTitle, setWidgetTitle] = useState('')
  const [widgetConfig, setWidgetConfig] = useState<any>({})

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template)
    setWidgetTitle('')
    setWidgetConfig({})
  }

  const handleSave = () => {
    if (!selectedTemplate || !widgetTitle.trim()) {
      alert('템플릿과 위젯 제목을 입력해주세요.')
      return
    }

    saveWidget({
      templateId: selectedTemplate.id,
      title: widgetTitle,
      config: widgetConfig
    })

    alert('위젯이 생성되었습니다!')
    setSelectedTemplate(null)
    setWidgetTitle('')
    setWidgetConfig({})
    onWidgetCreated()
  }

  return (
    <div className="space-y-6">
      {/* 1단계: 템플릿 선택 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 템플릿 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {widgetTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-6 text-left border-2 rounded-lg transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                크기: {template.gridSize.width}칸 × {template.gridSize.height}칸
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2단계: 위젯 설정 */}
      {selectedTemplate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 위젯 설정</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위젯 제목 *
              </label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="예: 만기 고객 목록"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* 템플릿별 추가 설정 */}
            {selectedTemplate.type === 'action-list' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 소스
                </label>
                <select
                  value={widgetConfig.dataSource || ''}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, dataSource: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">선택하세요</option>
                  <option value="maturity">만기 고객</option>
                  <option value="no-contact">장기 미접촉 고객</option>
                  <option value="vip-risk">VIP 강등 위험</option>
                </select>
              </div>
            )}

            {selectedTemplate.type === 'summary-card' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  표시 지표
                </label>
                <select
                  value={widgetConfig.metric || ''}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, metric: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">선택하세요</option>
                  <option value="customers">관리 고객</option>
                  <option value="aum">총 AUM</option>
                  <option value="schedules">오늘 일정</option>
                  <option value="urgent">긴급 조치</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      {selectedTemplate && (
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            위젯 저장
          </button>
        </div>
      )}
    </div>
  )
}
