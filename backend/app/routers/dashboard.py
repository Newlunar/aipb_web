from fastapi import APIRouter, Query
from app.supabase_client import supabase
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(wm_id: str | None = Query(None)):
    """대시보드 통계: 고객 수, AUM, 긴급 조치 수 등"""
    if not wm_id:
        return DashboardStatsResponse(
            totalCustomers=0,
            totalAum=0,
            todaySchedules=5,
            urgentActions=0,
            vipUrgentCount=0,
        )

    # 고객 수 및 총 AUM
    cust = supabase.table("customers").select("id, total_aum, customer_group").eq("wm_id", wm_id).execute()
    customer_data = cust.data or []
    total_customers = len(customer_data)
    total_aum = sum(c.get("total_aum") or 0 for c in customer_data)
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

    return DashboardStatsResponse(
        totalCustomers=total_customers,
        totalAum=total_aum,
        todaySchedules=5,
        urgentActions=urgent_actions,
        vipUrgentCount=vip_urgent_count,
    )
