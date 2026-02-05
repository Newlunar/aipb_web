import { useState, useEffect } from 'react'
import { LayoutGrid, Settings2, Check } from 'lucide-react'
import {
    initializeDefaultWidgets,
    PAGE_NAMES,
    type PageType
} from '../../types/widget'
import { usePageWidgets } from '../../hooks/usePageWidgets'
import { WidgetSelectModal } from '../widgets/WidgetSelectModal'
import { WidgetGrid } from '../widgets/WidgetGrid'

interface CommonPageLayoutProps {
    pageType: PageType
    title?: string
}

export function CommonPageLayout({ pageType, title }: CommonPageLayoutProps) {
    const [isEditLayout, setIsEditLayout] = useState(false)
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)

    const {
        availableWidgets,
        pageWidgets,
        selectionIds,
        moveWidget,
        saveSelection,
        togglePinToDashboard
    } = usePageWidgets(pageType)

    useEffect(() => {
        initializeDefaultWidgets()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{title || '위젯'}</h2>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsSelectModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <Settings2 size={18} />
                        위젯 선택
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditLayout((v) => !v)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditLayout
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {isEditLayout ? (
                            <>
                                <Check size={18} />
                                완료
                            </>
                        ) : (
                            <>
                                <LayoutGrid size={18} />
                                위젯 재배치
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isSelectModalOpen && (
                <WidgetSelectModal
                    availableWidgets={availableWidgets}
                    initialSelectedIds={selectionIds ?? availableWidgets.map((w) => w.id)}
                    onSave={(ids) => {
                        saveSelection(ids)
                        setIsSelectModalOpen(false)
                    }}
                    onClose={() => setIsSelectModalOpen(false)}
                    pageName={PAGE_NAMES[pageType]}
                />
            )}

            <WidgetGrid
                widgets={pageWidgets}
                isEditLayout={isEditLayout}
                onMove={moveWidget}
                onTogglePin={togglePinToDashboard}
            />
        </div>
    )
}
