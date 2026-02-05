import { useState } from 'react'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import type { SavedWidget } from '../../types/widget'

interface WidgetSelectModalProps {
    availableWidgets: SavedWidget[]
    initialSelectedIds: string[]
    onSave: (widgetIds: string[]) => void
    onClose: () => void
    pageName?: string
}

/** 위젯 선택 모달: 리스트에서 선택·순서 지정 후 배치 */
export function WidgetSelectModal({
    availableWidgets,
    initialSelectedIds,
    onSave,
    onClose,
    pageName
}: WidgetSelectModalProps) {
    const validInitial = initialSelectedIds.filter((id) => availableWidgets.some((w) => w.id === id))
    const [selectedIds, setSelectedIds] = useState<string[]>(
        validInitial.length > 0 ? validInitial : availableWidgets.map((w) => w.id)
    )

    const toggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const move = (index: number, direction: 'up' | 'down') => {
        const next = direction === 'up' ? index - 1 : index + 1
        if (next < 0 || next >= selectedIds.length) return
        setSelectedIds((prev) => {
            const arr = [...prev]
                ;[arr[index], arr[next]] = [arr[next], arr[index]]
            return arr
        })
    }

    const selectedOrdered = selectedIds
        .map((id) => availableWidgets.find((w) => w.id === id))
        .filter(Boolean) as SavedWidget[]

    const unselected = availableWidgets.filter((w) => !selectedIds.includes(w.id))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">위젯 선택</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={20} />
                    </button>
                </div>
                <p className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {pageName ? `${pageName}에` : '페이지에'} 표시할 위젯을 선택하고 순서를 정하세요.
                </p>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedOrdered.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">배치할 위젯 (순서)</p>
                            <ul className="space-y-1">
                                {selectedOrdered.map((w, i) => (
                                    <li key={w.id} className="flex items-center gap-2 py-2 px-3 bg-primary/5 rounded-lg border border-primary/20">
                                        <input
                                            type="checkbox"
                                            checked
                                            onChange={() => toggle(w.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="flex-1 text-sm font-medium text-gray-900">{w.title}</span>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => move(i, 'up')}
                                                disabled={i === 0}
                                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(i, 'down')}
                                                disabled={i === selectedOrdered.length - 1}
                                                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {unselected.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">선택 해제된 위젯</p>
                            <ul className="space-y-1">
                                {unselected.map((w) => (
                                    <li key={w.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={false}
                                            onChange={() => toggle(w.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="flex-1 text-sm text-gray-600">{w.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(selectedIds)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    )
}
