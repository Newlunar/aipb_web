"""
데이터소스 ID별 파라미터 매핑 후 /events 로직 재사용
"""
from fastapi import APIRouter, Query
from typing import Optional
from app.supabase_client import supabase
from app.schemas.events import ActionListDataItem
from app.routers.events import SELECT_EVENTS, _transform_row

router = APIRouter(prefix="/api", tags=["datasource"])

# dataSourceId -> scenario_codes, status_filter, default_sort, limit
DATASOURCE_QUERY_CONFIG = {
    "maturity": {
        "scenario_codes": ["DEPOSIT_MATURITY", "FUND_MATURITY", "ELS_MATURITY", "BOND_MATURITY"],
        "status_filter": ["pending"],
        "sort_field": "event_date",
        "sort_asc": True,
        "limit": 50,
    },
    "no-contact": {
        "scenario_codes": ["LONG_NO_CONTACT"],
        "status_filter": ["pending"],
        "sort_field": "event_date",
        "sort_asc": True,
        "limit": 50,
    },
    "vip-risk": {
        "scenario_codes": ["VIP_DOWNGRADE_RISK"],
        "status_filter": ["pending"],
        "sort_field": "event_date",
        "sort_asc": True,
        "limit": 50,
    },
}


@router.get("/datasource/{data_source_id}/data", response_model=list[ActionListDataItem])
async def get_datasource_data(
    data_source_id: str,
    wm_id: Optional[str] = Query(None),
):
    """데이터소스 ID에 맞는 이벤트 목록 반환 (maturity, no-contact, vip-risk 등)"""
    config = DATASOURCE_QUERY_CONFIG.get(data_source_id)
    if not config:
        return []

    customer_ids_for_wm = None
    if wm_id:
        cust = supabase.table("customers").select("id").eq("wm_id", wm_id).execute()
        customer_ids_for_wm = [r["id"] for r in (cust.data or [])]
        if not customer_ids_for_wm:
            return []

    scen = (
        supabase.table("scenarios")
        .select("id, code")
        .in_("code", config["scenario_codes"])
        .execute()
    )
    scenario_ids = [r["id"] for r in (scen.data or [])]
    if not scenario_ids:
        return []

    query = (
        supabase.table("customer_scenario_events")
        .select(SELECT_EVENTS)
        .in_("scenario_id", scenario_ids)
        .in_("status", config["status_filter"])
    )
    if customer_ids_for_wm:
        query = query.in_("customer_id", customer_ids_for_wm)
    query = query.order(config["sort_field"], desc=not config["sort_asc"]).limit(config["limit"])

    response = query.execute()
    rows = response.data or []
    return [_transform_row(r) for r in rows if r.get("customers") and r.get("scenarios")]
