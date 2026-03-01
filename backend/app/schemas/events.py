from pydantic import BaseModel
from typing import Any, List, Optional


class ActionListDataItem(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    customer_group: str
    grade: str
    total_aum: float
    phone: str
    scenario_code: str
    scenario_name: str
    scenario_color: str
    event_date: str
    event_data: dict = {}
    status: str
    priority: int


class EventListResponse(BaseModel):
    data: List[ActionListDataItem]
