"""Domain models for widget content data using dataclasses."""

from dataclasses import dataclass
from typing import List, Optional, Dict, Union
from datetime import datetime, date


# Customer Models
@dataclass
class CustomerProfile:
    """고객 속성 정보 - 기본 고객 프로필 데이터."""
    customer_id: str
    customer_name: str
    account_number: str
    customer_grade: str  # 예: VIP, Gold, Silver, Bronze
    call_yn: bool  # 전화 상담 가능 여부


@dataclass
class CustomerEvent:
    """고객 이벤트 정보 - 중복 업데이트가 가능한 시나리오 기반 데이터."""
    customer_id: str  # CustomerProfile과 연결하기 위한 키
    scenario_id: str
    scenario_name: str
    scenario_data: Dict[str, Union[float, str]]  # 기본 키: quantity, amount, date (ISO format: YYYY-MM-DD)


# Action List Models (레거시 호환용)
@dataclass
class ActionListItem:
    """Individual item in an action list (레거시 호환용)."""
    customer_name: str
    account_number: str
    amount: float
    scenario: str
    action_type: str


@dataclass
class ActionListContent:
    """Content data for action list widget."""
    items: List[ActionListItem]
    filters: List[str]
    # 새로운 구조 지원
    customers: Optional[List[CustomerProfile]] = None
    events: Optional[List[CustomerEvent]] = None


# Bar Chart Models
@dataclass
class BarChartContent:
    """Content data for bar chart widget."""
    categories: List[str]
    values: List[float]
    colors: Optional[List[str]] = None
    x_label: str = ""
    y_label: str = ""
    click_action: Optional[str] = None


# Feed Models
@dataclass
class FeedItem:
    """Individual item in a feed."""
    timestamp: str  # ISO format datetime string
    title: str
    content: str
    icon: Optional[str] = None
    link: Optional[str] = None


@dataclass
class FeedContent:
    """Content data for feed widget."""
    items: List[FeedItem]


# Calendar Models
@dataclass
class CalendarEvent:
    """Individual event in a calendar."""
    date: str  # ISO format date string (YYYY-MM-DD)
    event_type: str
    count: int
    color: str
    scenarios: List[str]


@dataclass
class CalendarContent:
    """Content data for calendar widget."""
    events: List[CalendarEvent]
    click_action: Optional[str] = None
