"""Widget view page - displays widgets with JSON data."""

import json
import streamlit as st
from pathlib import Path
from typing import Dict, Any, List
from src.core.widget_engine import WidgetEngine
from src.templates.action_list import ActionListTemplate
from src.templates.bar_chart import BarChartTemplate
from src.templates.feed import FeedTemplate
from src.templates.calendar import CalendarTemplate


def load_page_layout(pages_dir: Path, page_id: str) -> Dict[str, Any]:
    """Load page layout from JSON file.
    
    Args:
        pages_dir: Path to pages directory
        page_id: Page identifier
        
    Returns:
        Page layout dictionary
    """
    layout_path = pages_dir / page_id / "layout.json"
    if not layout_path.exists():
        return {"page_id": page_id, "title": "", "widgets": []}
    
    with open(layout_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_position_map(layout: Dict[str, Any]) -> Dict[str, Dict[str, int]]:
    """Create widget_id to position mapping from layout.
    
    Args:
        layout: Page layout dictionary
        
    Returns:
        Dictionary mapping widget_id to position
    """
    return {
        item["widget_id"]: item["position"]
        for item in layout.get("widgets", [])
    }


def render_widget_view_page():
    """Render the widget view page."""
    st.title("위젯 보기")
    st.markdown("JSON 데이터가 적용된 위젯을 표시합니다.")
    
    # Initialize paths
    base_path = Path(__file__).parent.parent.parent
    attributes_dir = base_path / "data" / "widgets" / "attributes"
    content_dir = base_path / "data" / "widgets" / "content"
    pages_dir = base_path / "data" / "pages"
    
    # Load page layout
    current_page = "main_dashboard"  # Can be made dynamic later
    layout = load_page_layout(pages_dir, current_page)
    position_map = get_position_map(layout)
    
    # Initialize widget engine
    engine = WidgetEngine(attributes_dir, content_dir)
    
    # Register all templates
    engine.register_template("action_list", ActionListTemplate)
    engine.register_template("bar_chart", BarChartTemplate)
    engine.register_template("feed", FeedTemplate)
    engine.register_template("calendar", CalendarTemplate)
    
    # Get widgets from layout (only widgets defined in layout will be shown)
    layout_widget_ids = [item["widget_id"] for item in layout.get("widgets", [])]
    
    if not layout_widget_ids:
        st.info("표시할 위젯이 없습니다. 페이지 레이아웃에 위젯을 추가하세요.")
        return
    
    st.info(f"페이지: {layout.get('title', current_page)} | 총 {len(layout_widget_ids)}개 위젯")
    
    # Load all widgets and sort by position from layout
    widgets_with_pos = []
    for widget_id in layout_widget_ids:
        widget = engine.create_widget(widget_id)
        if widget and widget.attributes:
            pos = position_map.get(widget_id, {'row': 0, 'col': 0})
            widgets_with_pos.append((pos['row'], pos['col'], widget))
    
    # Sort by row, then by col
    widgets_with_pos.sort(key=lambda x: (x[0], x[1]))
    
    # Display widgets
    current_row = -1
    cols = None
    
    for row, col, widget in widgets_with_pos:
        # Start new row if needed
        if row != current_row:
            if cols:
                pass
            current_row = row
            cols = None
        
        # Get widget size
        size = widget.attributes.get('size', {'width': 2, 'height': 1})
        width = size.get('width', 2)
        
        # Create columns if needed
        if not cols:
            cols = st.columns(1)
        
        # Render widget
        with cols[0]:
            widget.render()
            st.divider()
