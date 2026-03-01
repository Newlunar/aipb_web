from fastapi import APIRouter, Query
from typing import Optional
from app.supabase_client import supabase
from app.schemas.feeds import FeedItemResponse

router = APIRouter(prefix="/api", tags=["feeds"])


@router.get("/feeds", response_model=list[FeedItemResponse])
async def get_feeds(
    feed_type: Optional[str] = Query(None),
    limit: int = Query(5, ge=1, le=100),
    order_field: str = Query("published_at"),
    order_direction: str = Query("desc"),
):
    """
    feeds 테이블 조회.
    feed_type: 쉼표 구분 (예: news,research,signal,alert,notice)
    """
    query = supabase.table("feeds").select("id, title, content, feed_type, source, published_at")
    if feed_type:
        types = [t.strip() for t in feed_type.split(",") if t.strip()]
        if types:
            query = query.in_("feed_type", types)
    query = query.order(order_field, desc=(order_direction.lower() == "desc")).limit(limit)
    response = query.execute()
    rows = response.data or []
    return [
        FeedItemResponse(id=str(r.get("id", "")), title=r.get("title", ""), content=r.get("content", ""))
        for r in rows
    ]
