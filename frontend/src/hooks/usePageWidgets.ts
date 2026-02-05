import { useState, useMemo, useCallback } from 'react'
import {
    loadSavedWidgets,
    getPageWidgetSelection,
    setPageWidgetSelection,
    updateWidget,
    type SavedWidget,
    type PageType
} from '../types/widget'

export function usePageWidgets(page: PageType) {
    const [refreshKey, setRefreshKey] = useState(0)

    // 전체 위젯 로드 및 해당 페이지용 필터링
    const availableWidgets = useMemo(() => {
        const all = loadSavedWidgets()

        // 'dashboard' 페이지인 경우: 'pages' 배열에 'dashboard'가 포함된 모든 위젯 표시
        if (page === 'dashboard') {
            return all
                .filter((w) => w.pages?.includes('dashboard'))
                .sort((a, b) => (a.config?.order ?? 999) - (b.config?.order ?? 999))
        }

        // 그 외 페이지: 
        // 해당 페이지가 pages 배열에 포함되어 있는 경우에만 표시 (엄격한 필터링)
        return all
            .filter((w) => w.pages?.includes(page))
            .sort((a, b) => (a.config?.order ?? 999) - (b.config?.order ?? 999))
    }, [refreshKey, page])

    // 현재 페이지의 위젯 순서/선택 상태
    const selectionIds = getPageWidgetSelection(page)

    // 최종적으로 렌더링할 위젯 목록 (순서 반영)
    const pageWidgets = useMemo(() => {
        // Dashboard는 별도 순서 저장이 없으면 그냥 availableWidgets 순서대로 (또는 추후 dashboard 전용 정렬 저장 가능)
        // 여기서는 일반 페이지와 동일하게 selectionIds가 있으면 그걸 따르고, 없으면 availableWidgets 그대로 사용
        if (selectionIds && selectionIds.length > 0) {
            const byId = new Map(availableWidgets.map((w) => [w.id, w]))
            // 선택된 ID 중에 실제 available한 것만 필터
            return selectionIds.map((id) => byId.get(id)).filter(Boolean) as SavedWidget[]
        }
        return availableWidgets
    }, [availableWidgets, selectionIds])

    // 위젯 순서 변경
    const moveWidget = useCallback((index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= pageWidgets.length) return

        const ids = pageWidgets.map((w) => w.id)
            ;[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]]

        setPageWidgetSelection(page, ids)
        setRefreshKey((k) => k + 1)
    }, [pageWidgets, page])

    // 위젯 선택 저장 (Modal 용)
    const saveSelection = useCallback((ids: string[]) => {
        setPageWidgetSelection(page, ids)
        setRefreshKey((k) => k + 1)
    }, [page])

    // 대시보드 고정 토글 (좋아요/Pin)
    const togglePinToDashboard = useCallback((widgetId: string) => {
        const all = loadSavedWidgets()
        const target = all.find(w => w.id === widgetId)
        if (!target) return

        const currentPages = target.pages || []
        let newPages: PageType[]

        if (currentPages.includes('dashboard')) {
            newPages = currentPages.filter(p => p !== 'dashboard')
        } else {
            newPages = [...currentPages, 'dashboard']
        }

        updateWidget(widgetId, { pages: newPages })
        setRefreshKey((k) => k + 1)
    }, [])

    // 강제 리프레시
    const refresh = useCallback(() => {
        setRefreshKey((k) => k + 1)
    }, [])

    return {
        availableWidgets,
        pageWidgets,
        selectionIds,
        moveWidget,
        saveSelection,
        togglePinToDashboard,
        refresh
    }
}
