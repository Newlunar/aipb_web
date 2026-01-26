"""Domain models for widget content data using dataclasses."""

from dataclasses import dataclass
from typing import List, Optional, Dict
from datetime import datetime, date


# Action List Models
@dataclass
class ActionListItem:
    """Individual item in an action list."""
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
