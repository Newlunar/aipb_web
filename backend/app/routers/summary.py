from fastapi import APIRouter, Query
from typing import Optional
from app.supabase_client import supabase
from app.schemas.summary import SummaryCardSettingRow, summary_settings_to_dict

router = APIRouter(prefix="/api", tags=["summary"])


@router.get("/summary-settings")
async def get_summary_settings(wm_id: Optional[str] = Query(None)):
    """WM별 요약 카드 설정. 응답: { [card_type]: { value, value_type, description } }"""
    if not wm_id:
        return {}

    response = (
        supabase.table("summary_card_settings")
        .select("card_type, value, value_type, description")
        .eq("wm_id", wm_id)
        .execute()
    )
    rows = response.data or []
    settings = {
        r["card_type"]: SummaryCardSettingRow(
            value=r["value"],
            value_type=r.get("value_type"),
            description=r.get("description"),
        )
        for r in rows
    }
    return summary_settings_to_dict(settings)
