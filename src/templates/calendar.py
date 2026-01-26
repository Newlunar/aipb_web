"""Calendar template - displays calendar with events."""

import streamlit as st
from pathlib import Path
from typing import Dict, Any
import json
from datetime import datetime, date
from src.templates.base_template import BaseTemplate
from src.domain.models import CalendarContent, CalendarEvent


class CalendarTemplate(BaseTemplate):
    """Template for displaying calendar widget."""
    
    def load_content(self, content_path: Path) -> CalendarContent:
        """Load calendar content from JSON file.
        
        Args:
            content_path: Path to the content JSON file
            
        Returns:
            CalendarContent dataclass instance
            
        Raises:
            FileNotFoundError: If content file doesn't exist
            json.JSONDecodeError: If JSON is invalid
        """
        if not content_path.exists():
            raise FileNotFoundError(f"Content file not found: {content_path}")
        
        with open(content_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract content from widget_id wrapper
        content_data = data.get('content', {})
        
        # Convert events to CalendarEvent dataclass instances
        events = []
        for event_data in content_data.get('events', []):
            event = CalendarEvent(
                date=event_data.get('date', ''),
                event_type=event_data.get('event_type', ''),
                count=event_data.get('count', 0),
                color=event_data.get('color', 'blue'),
                scenarios=event_data.get('scenarios', [])
            )
            events.append(event)
        
        # Create CalendarContent
        self.content = CalendarContent(
            events=events,
            click_action=content_data.get('click_action')
        )
        
        return self.content
    
    def render(self) -> None:
        """Render the calendar widget using Streamlit."""
        if not self.validate():
            st.error("위젯 데이터가 로드되지 않았습니다.")
            return
        
        # Display title
        title = self.get_title()
        if title:
            st.subheader(title)
        
        if not self.content.events:
            st.info("표시할 이벤트가 없습니다.")
            return
        
        # Group events by date
        events_by_date = {}
        for event in self.content.events:
            event_date = event.date
            if event_date not in events_by_date:
                events_by_date[event_date] = []
            events_by_date[event_date].append(event)
        
        # Display calendar using Streamlit date_input for month selection
        selected_date = st.date_input(
            "날짜 선택",
            value=date.today(),
            key=f"calendar_{self.widget_id}"
        )
        
        # Display events for selected date
        selected_date_str = selected_date.isoformat()
        
        if selected_date_str in events_by_date:
            st.markdown(f"### {selected_date_str} 이벤트")
            
            for event in events_by_date[selected_date_str]:
                with st.container():
                    # Color indicator
                    color_map = {
                        'blue': '🔵',
                        'red': '🔴',
                        'green': '🟢',
                        'yellow': '🟡',
                        'orange': '🟠'
                    }
                    color_icon = color_map.get(event.color, '⚪')
                    
                    col1, col2 = st.columns([1, 10])
                    
                    with col1:
                        st.write(color_icon)
                    
                    with col2:
                        st.markdown(f"**{event.event_type}** - {event.count}건")
                        if event.scenarios:
                            st.caption(f"시나리오: {', '.join(event.scenarios)}")
                    
                    st.divider()
        else:
            st.info(f"{selected_date_str}에는 이벤트가 없습니다.")
        
        # Display all events summary
        with st.expander("전체 이벤트 요약"):
            for event_date, events in sorted(events_by_date.items()):
                total_count = sum(e.count for e in events)
                st.write(f"**{event_date}**: {total_count}건")
        
        # Handle click action if specified
        if self.content.click_action:
            st.caption(f"클릭 액션: {self.content.click_action}")
