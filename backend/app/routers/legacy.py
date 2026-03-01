"""
레거시 API 경로 (frontend 훅 호환용)
→ /api/widgets/* 구조로 마이그레이션 권장
"""
from fastapi import APIRouter, Query
from typing import Optional
from app.routers.widgets import (
    get_summary_card_stats,
    get_summary_card_settings,
    get_action_list_data,
    get_action_list_events,
    get_text_block_data,
)

router = APIRouter(prefix="/api", tags=["legacy"])


@router.get("/dashboard/stats")
async def legacy_dashboard_stats(wm_id: Optional[str] = Query(None)):
    """→ GET /api/widgets/summary-card/stats"""
    return await get_summary_card_stats(wm_id=wm_id)


@router.get("/summary-settings")
async def legacy_summary_settings(wm_id: Optional[str] = Query(None)):
    """→ GET /api/widgets/summary-card/settings"""
    return await get_summary_card_settings(wm_id=wm_id)


@router.get("/events")
async def legacy_events(
    scenario_codes: Optional[str] = Query(None),
    wm_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    filters: Optional[str] = Query(None),
):
    """→ GET /api/widgets/action-list/events"""
    return await get_action_list_events(
        scenario_codes=scenario_codes,
        wm_id=wm_id,
        status=status,
        limit=limit,
        filters=filters,
    )


@router.get("/datasource/{data_source_id}/data")
async def legacy_datasource_data(
    data_source_id: str,
    wm_id: Optional[str] = Query(None),
):
    """→ GET /api/widgets/action-list/data?data_source={data_source_id}"""
    return await get_action_list_data(data_source=data_source_id, wm_id=wm_id)


@router.get("/feeds")
async def legacy_feeds(
    feed_type: Optional[str] = Query(None),
    limit: int = Query(5, ge=1, le=100),
    order_field: str = Query("published_at"),
    order_direction: str = Query("desc"),
):
    """→ GET /api/widgets/text-block/data"""
    return await get_text_block_data(
        feed_type=feed_type,
        limit=limit,
        order_field=order_field,
        order_direction=order_direction,
    )
