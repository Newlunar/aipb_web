"""
위젯 템플릿별 API (frontend widget types와 동일 구조)
- summary-card: 요약 카드 (stats, settings)
- action-list: 액션리스트 (데이터소스별 이벤트)
- bar-chart: 바 차트 (집계 데이터)
- text-block: 텍스트 블록 (feeds)

세부 위젯 코드 (C001 형식): SC001, AL001, BC001, TB001 등
"""
from fastapi import APIRouter, Query, HTTPException, Path
from typing import Optional
import json
from collections import defaultdict
from app.supabase_client import supabase
from app.widget_registry import (
    get_widget_by_code,
    get_codes_by_template,
    list_all_codes,
)
from app.schemas.widgets import (
    SummaryCardStatsResponse,
    SummaryCardSettingRow,
    ActionListDataItem,
    BarChartDataItem,
    BarChartDataResponse,
    TextBlockFeedItem,
)

router = APIRouter(prefix="/api/widgets", tags=["widgets"])

# ----- 공통: 이벤트 조회 -----
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

ACTION_LIST_DATASOURCE_CONFIG = {
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


def _transform_event_row(item: dict) -> ActionListDataItem:
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


# ========== 요약 카드 (summary-card) ==========


# ========== 위젯 코드 레지스트리 API ==========


@router.get("/codes")
async def list_widget_codes():
    """전체 위젯 코드 목록 (SC001, AL001, BC001, TB001 등)"""
    return list_all_codes()


@router.get("/{template}/codes")
async def list_template_codes(
    template: str = Path(..., description="summary-card | action-list | bar-chart | text-block"),
):
    """template별 등록된 위젯 코드 목록"""
    valid = ("summary-card", "action-list", "bar-chart", "text-block")
    if template not in valid:
        raise HTTPException(404, f"Unknown template: {template}")
    codes = get_codes_by_template(template)
    return {"template": template, "codes": codes}


# ========== 요약 카드 (summary-card) ==========


@router.get("/summary-card/stats", response_model=SummaryCardStatsResponse)
async def get_summary_card_stats(wm_id: Optional[str] = Query(None)):
    """요약 카드용 대시보드 통계"""
    if not wm_id:
        return SummaryCardStatsResponse(
            totalCustomers=0,
            totalAum=0,
            todaySchedules=5,
            urgentActions=0,
            vipUrgentCount=0,
        )

    cust = supabase.table("customers").select("id, total_aum, customer_group").eq("wm_id", wm_id).execute()
    customer_data = cust.data or []
    total_customers = len(customer_data)
    total_aum = sum(float(c.get("total_aum") or 0) for c in customer_data)
    customer_ids = [c["id"] for c in customer_data]

    urgent_actions = 0
    vip_urgent_count = 0
    if customer_ids:
        events = (
            supabase.table("customer_scenario_events")
            .select("id, customer_id, customers(customer_group)")
            .eq("status", "pending")
            .in_("customer_id", customer_ids)
            .execute()
        )
        event_data = events.data or []
        urgent_actions = len(event_data)
        vip_urgent_count = sum(1 for e in event_data if (e.get("customers") or {}).get("customer_group") == "vip")

    return SummaryCardStatsResponse(
        totalCustomers=total_customers,
        totalAum=total_aum,
        todaySchedules=5,
        urgentActions=urgent_actions,
        vipUrgentCount=vip_urgent_count,
    )


@router.get("/summary-card/settings")
async def get_summary_card_settings(
    wm_id: Optional[str] = Query(None),
    table: str = Query("summary_card_settings", description="설정 테이블명"),
):
    """요약 카드 설정: card_type별 value, value_type, description"""
    if not wm_id:
        return {}

    response = (
        supabase.table(table)
        .select("card_type, value, value_type, description")
        .eq("wm_id", wm_id)
        .execute()
    )
    rows = response.data or []
    return {
        r["card_type"]: SummaryCardSettingRow(
            value=r["value"],
            value_type=r.get("value_type"),
            description=r.get("description"),
        ).model_dump()
        for r in rows
    }


@router.get("/summary-card/{widget_code}/data")
async def get_summary_card_by_code(
    widget_code: str = Path(..., description="SC001 | SC002"),
    wm_id: Optional[str] = Query(None),
):
    """요약 카드 세부 위젯 데이터 (코드별)
    SC001: stats, SC002: settings
    """
    cfg = get_widget_by_code(widget_code)
    if not cfg or cfg.get("template") != "summary-card":
        raise HTTPException(404, f"Unknown widget code: {widget_code}")
    variant = cfg.get("variant", "stats")
    if variant == "stats":
        return await get_summary_card_stats(wm_id=wm_id)
    return await get_summary_card_settings(wm_id=wm_id)


# ========== 액션리스트 (action-list) ==========
@router.get("/action-list/events", response_model=list[ActionListDataItem])
async def get_action_list_events(
    scenario_codes: Optional[str] = Query(None),
    wm_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    filters: Optional[str] = Query(None),
):
    """액션리스트 위젯: 범용 이벤트 조회 (scenario_codes, status, filters)"""
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

    query = supabase.table("customer_scenario_events").select(SELECT_EVENTS)
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
    return [_transform_event_row(r) for r in rows if r.get("customers") and r.get("scenarios")]


@router.get("/action-list/data", response_model=list[ActionListDataItem])
async def get_action_list_data(
    data_source: str = Query(..., description="maturity | no-contact | vip-risk"),
    wm_id: Optional[str] = Query(None),
):
    """액션리스트 위젯 데이터: 데이터소스별 이벤트 목록"""
    config = ACTION_LIST_DATASOURCE_CONFIG.get(data_source)
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
    return [_transform_event_row(r) for r in rows if r.get("customers") and r.get("scenarios")]


@router.get("/action-list/{widget_code}/data", response_model=list[ActionListDataItem])
async def get_action_list_by_code(
    widget_code: str = Path(..., description="AL001 | AL002 | AL003"),
    wm_id: Optional[str] = Query(None),
):
    """액션리스트 세부 위젯 데이터 (코드별)
    AL001: 만기, AL002: 미접촉, AL003: VIP위험
    """
    cfg = get_widget_by_code(widget_code)
    if not cfg or cfg.get("template") != "action-list":
        raise HTTPException(404, f"Unknown widget code: {widget_code}")
    ds = cfg.get("data_source")
    if not ds:
        return []
    return await get_action_list_data(data_source=ds, wm_id=wm_id)


# ========== 바 차트 (bar-chart) ==========

# 바 차트 데이터소스별 시나리오 코드 매핑 (event-by-grade, scenario-count용)
BAR_CHART_SCENARIO_GROUPS = {
    "maturity": ["DEPOSIT_MATURITY", "FUND_MATURITY", "ELS_MATURITY", "BOND_MATURITY"],
    "no-contact": ["LONG_NO_CONTACT"],
    "vip-risk": ["VIP_DOWNGRADE_RISK"],
}


@router.get("/bar-chart/data", response_model=BarChartDataResponse)
async def get_bar_chart_data(
    data_source: str = Query(
        ...,
        description="scenario-count | event-by-grade | monthly-aum",
    ),
    wm_id: Optional[str] = Query(None),
):
    """
    바 차트 위젯 데이터
    - scenario-count: 시나리오별 건수 (가로 바)
    - event-by-grade: 고객등급별 만기/미접촉/VIP위험 건수
    - monthly-aum: 월별 AUM 추이 (예금/펀드/주식) - DB 집계 또는 샘플
    """
    customer_ids_for_wm = None
    if wm_id:
        cust = supabase.table("customers").select("id").eq("wm_id", wm_id).execute()
        customer_ids_for_wm = [r["id"] for r in (cust.data or [])]

    if data_source == "scenario-count":
        # 시나리오별 pending 이벤트 건수
        q = (
            supabase.table("customer_scenario_events")
            .select("id, scenario_id, scenarios(code, name)")
            .eq("status", "pending")
        )
        if customer_ids_for_wm:
            q = q.in_("customer_id", customer_ids_for_wm)
        events_res = q.execute()
        rows = events_res.data or []
        count_by_name: dict[str, int] = defaultdict(int)
        for r in rows:
            s = r.get("scenarios") or {}
            name = s.get("name") or s.get("code") or "알 수 없음"
            count_by_name[name] += 1
        data = [BarChartDataItem(label=k, values=[v]) for k, v in sorted(count_by_name.items(), key=lambda x: -x[1])]
        return BarChartDataResponse(data=data, seriesLabels=["건수"])

    if data_source == "event-by-grade":
        # 고객등급(vip/general)별 × 시나리오(만기/미접촉/VIP위험) 건수
        grade_order = ["vip", "general", "prospect"]
        scenario_codes = []
        for codes in BAR_CHART_SCENARIO_GROUPS.values():
            scenario_codes.extend(codes)
        scen = supabase.table("scenarios").select("id, code, name").in_("code", scenario_codes).execute()
        scenario_map = {r["id"]: r for r in (scen.data or [])}
        q = (
            supabase.table("customer_scenario_events")
            .select("id, scenario_id, customer_id, customers(customer_group)")
            .eq("status", "pending")
        )
        if customer_ids_for_wm:
            q = q.in_("customer_id", customer_ids_for_wm)
        events_res = q.execute()
        rows = events_res.data or []
        # grade -> [maturity_cnt, no_contact_cnt, vip_risk_cnt]
        matrix: dict[str, list[int]] = {
            g: [0, 0, 0] for g in grade_order
        }
        for r in rows:
            group = (r.get("customers") or {}).get("customer_group") or "general"
            if group not in matrix:
                matrix[group] = [0, 0, 0]
            sc = scenario_map.get(r.get("scenario_id") or "")
            if not sc:
                continue
            code = sc.get("code", "")
            idx = 0 if code in BAR_CHART_SCENARIO_GROUPS["maturity"] else (
                1 if code in BAR_CHART_SCENARIO_GROUPS["no-contact"] else 2
            )
            matrix[group][idx] += 1
        grade_labels = {"vip": "VIP", "general": "일반", "prospect": "우량"}
        data = [
            BarChartDataItem(
                label=grade_labels.get(g, g),
                values=matrix.get(g, [0, 0, 0]),
            )
            for g in grade_order
        ]
        return BarChartDataResponse(data=data, seriesLabels=["만기", "장기미접촉", "VIP강등위험"])

    if data_source == "monthly-aum":
        # 월별 AUM: accounts 테이블에서 account_type별 balance 집계 (월별 event_date 기준)
        # DB에 월별 집계가 없으면 샘플 반환
        try:
            accounts = supabase.table("accounts").select("account_type, balance, maturity_date").execute()
            rows = accounts.data or []
            if not rows:
                raise ValueError("No data")
            # account_type별 합계만 가능 (월별은 event_date가 accounts에 없음)
            by_type: dict[str, float] = defaultdict(float)
            for r in rows:
                t = r.get("account_type") or "unknown"
                b = float(r.get("balance") or 0)
                by_type[t] += b
            # 간단히 type별 합계를 월별처럼 변환 (샘플)
            labels = list(by_type.keys())[:6] or ["1월", "2월", "3월"]
            if len(labels) < 3:
                labels = ["1월", "2월", "3월", "4월", "5월", "6월"]
            values = [by_type.get(label, 0) / 100_000_000 for label in labels]  # 억 단위
            if sum(values) == 0:
                raise ValueError("No balance")
            data = [BarChartDataItem(label=label, values=[v]) for label, v in zip(labels, values)]
            return BarChartDataResponse(data=data, seriesLabels=["AUM(억)"])
        except Exception:
            # 샘플 데이터 (frontend mockBarChartMonthlyAum)
            data = [
                BarChartDataItem(label="1월", values=[120, 85, 45]),
                BarChartDataItem(label="2월", values=[135, 92, 52]),
                BarChartDataItem(label="3월", values=[128, 98, 58]),
                BarChartDataItem(label="4월", values=[142, 105, 62]),
                BarChartDataItem(label="5월", values=[138, 110, 68]),
                BarChartDataItem(label="6월", values=[155, 118, 75]),
            ]
            return BarChartDataResponse(data=data, seriesLabels=["예금", "펀드", "주식"])

    return BarChartDataResponse(data=[], seriesLabels=[])


@router.get("/bar-chart/{widget_code}/data", response_model=BarChartDataResponse)
async def get_bar_chart_by_code(
    widget_code: str = Path(..., description="BC001 | BC002 | BC003"),
    wm_id: Optional[str] = Query(None),
):
    """바 차트 세부 위젯 데이터 (코드별)
    BC001: 시나리오건수, BC002: 등급별이벤트, BC003: 월별AUM
    """
    cfg = get_widget_by_code(widget_code)
    if not cfg or cfg.get("template") != "bar-chart":
        raise HTTPException(404, f"Unknown widget code: {widget_code}")
    ds = cfg.get("data_source")
    if not ds:
        return BarChartDataResponse(data=[], seriesLabels=[])
    return await get_bar_chart_data(data_source=ds, wm_id=wm_id)


# ========== 텍스트 블록 (text-block) ==========


@router.get("/text-block/data", response_model=list[TextBlockFeedItem])
async def get_text_block_data(
    data_source: str = Query("feed", description="feed 등 데이터소스 ID"),
    feed_type: Optional[str] = Query(None, description="news,research,signal,alert,notice"),
    limit: int = Query(5, ge=1, le=100),
    order_field: str = Query("published_at"),
    order_direction: str = Query("desc"),
):
    """텍스트 블록 위젯 데이터: feeds 테이블 (제목·내용)"""
    query = supabase.table("feeds").select("id, title, content, feed_type, source, published_at")
    if feed_type:
        types = [t.strip() for t in feed_type.split(",") if t.strip()]
        if types:
            query = query.in_("feed_type", types)
    elif data_source == "feed":
        query = query.in_("feed_type", ["news", "research", "signal", "alert", "notice"])
    query = query.order(order_field, desc=(order_direction.lower() == "desc")).limit(limit)
    response = query.execute()
    rows = response.data or []
    return [
        TextBlockFeedItem(id=str(r.get("id", "")), title=r.get("title", ""), content=r.get("content", ""))
        for r in rows
    ]


@router.get("/text-block/{widget_code}/data", response_model=list[TextBlockFeedItem])
async def get_text_block_by_code(
    widget_code: str = Path(..., description="TB001"),
    feed_type: Optional[str] = Query(None),
    limit: int = Query(5, ge=1, le=100),
):
    """텍스트 블록 세부 위젯 데이터 (코드별)
    TB001: 피드/브리핑
    """
    cfg = get_widget_by_code(widget_code)
    if not cfg or cfg.get("template") != "text-block":
        raise HTTPException(404, f"Unknown widget code: {widget_code}")
    return await get_text_block_data(data_source=cfg.get("data_source", "feed"), feed_type=feed_type, limit=limit)
