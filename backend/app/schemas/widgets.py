"""
위젯 템플릿별 API 스키마 (frontend types/widget.ts, datasource.ts와 동기화)
"""
from pydantic import BaseModel
from typing import Any, Dict, List, Optional


# ----- 요약 카드 (summary-card) -----
class SummaryCardStatsResponse(BaseModel):
    """대시보드 통계 - 요약 카드용"""
    totalCustomers: int
    totalAum: float
    todaySchedules: int
    urgentActions: int
    vipUrgentCount: int


class SummaryCardSettingRow(BaseModel):
    value: str
    value_type: Optional[str] = None
    description: Optional[str] = None


# ----- 액션리스트 (action-list) -----
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


# ----- 바 차트 (bar-chart) -----
class BarChartDataItem(BaseModel):
    """frontend BarChartDataItem: label + values[]"""
    label: str
    values: List[float]


class BarChartDataResponse(BaseModel):
    data: List[BarChartDataItem]
    seriesLabels: List[str] = []


# ----- 텍스트 블록 (text-block) -----
class TextBlockFeedItem(BaseModel):
    id: str
    title: str
    content: str

