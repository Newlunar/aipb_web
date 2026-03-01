from fastapi import APIRouter, Query
from typing import Optional
import json
from app.supabase_client import supabase
from app.schemas.events import ActionListDataItem

router = APIRouter(prefix="/api", tags=["events"])

SELECT_EVENTS = """
id,
customer_id,
scenario_id,
account_id,
event_date,
event_data,
status,
priority,
assigned_wm_id,
notes,
created_at,
customers (
  id,
  name,
  phone,
  email,
  customer_group,
  grade,
  total_aum
),
scenarios (
  id,
  code,
  name,
  category,
  color,
  icon
)
"""


def _apply_filter(query, column: str, operator: str, value):
    if operator == "eq":
        return query.eq(column, value)
    if operator == "neq":
        return query.neq(column, value)
    if operator == "gt":
        return query.gt(column, value)
    if operator == "gte":
        return query.gte(column, value)
    if operator == "lt":
        return query.lt(column, value)
    if operator == "lte":
        return query.lte(column, value)
    if operator == "in" and isinstance(value, list):
        return query.in_(column, value)
    if operator == "like":
        return query.like(column, value)
    if operator == "ilike":
        return query.ilike(column, value)
    if operator == "is":
        return query.is_(column, value)
    return query


def _transform_row(item: dict) -> ActionListDataItem:
    customers = item.get("customers") or {}
    scenarios = item.get("scenarios") or {}
    return ActionListDataItem(
        id=str(item["id"]),
        customer_id=item.get("customer_id", ""),
        customer_name=customers.get("name", ""),
        customer_group=customers.get("customer_group", "general"),
        grade=customers.get("grade", ""),
        total_aum=float(customers.get("total_aum") or 0),
        phone=customers.get("phone") or "",
        scenario_code=scenarios.get("code", ""),
        scenario_name=scenarios.get("name", ""),
        scenario_color=scenarios.get("color", "#6B7280"),
        event_date=item.get("event_date", ""),
        event_data=item.get("event_data") or {},
        status=item.get("status", "pending"),
        priority=int(item.get("priority", 3)),
    )


@router.get("/events", response_model=list[ActionListDataItem])
async def get_events(
    scenario_codes: Optional[str] = Query(None),
    wm_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    filters: Optional[str] = Query(None),
):
    """
    시나리오 이벤트 목록.
    scenario_codes: 쉼표 구분 (예: DEPOSIT_MATURITY,LONG_NO_CONTACT)
    status: 쉼표 구분 (예: pending)
    filters: JSON array of { column, operator, value }
    """
    customer_ids_for_wm = None
    if wm_id:
        cust = supabase.table("customers").select("id").eq("wm_id", wm_id).execute()
        customer_ids_for_wm = [r["id"] for r in (cust.data or [])]
        if not customer_ids_for_wm:
            return []

    scenario_ids = []
    if scenario_codes:
        codes = [c.strip() for c in scenario_codes.split(",") if c.strip()]
        if codes:
            scen = supabase.table("scenarios").select("id, code").in_("code", codes).execute()
            scenario_ids = [r["id"] for r in (scen.data or [])]
            if not scenario_ids:
                return []

    query = (
        supabase.table("customer_scenario_events")
        .select(SELECT_EVENTS)
    )
    if scenario_ids:
        query = query.in_("scenario_id", scenario_ids)
    if customer_ids_for_wm:
        query = query.in_("customer_id", customer_ids_for_wm)
    if status:
        status_list = [s.strip() for s in status.split(",") if s.strip()]
        if status_list:
            query = query.in_("status", status_list)

    if filters:
        try:
            filter_list = json.loads(filters)
            for f in filter_list:
                col = f.get("column")
                op = f.get("operator")
                val = f.get("value")
                if col and op and val is not None:
                    query = _apply_filter(query, col, op, val)
        except (json.JSONDecodeError, TypeError):
            pass

    query = query.order("event_date", desc=False)
    if limit:
        query = query.limit(limit)

    response = query.execute()
    rows = response.data or []
    return [_transform_row(r) for r in rows if r.get("customers") and r.get("scenarios")]
