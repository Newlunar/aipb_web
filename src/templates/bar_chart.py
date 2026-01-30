"""Bar chart template - displays bar chart using Plotly."""

import streamlit as st
from pathlib import Path
from typing import Dict, Any
import json
import plotly.graph_objects as go
from src.templates.base_template import BaseTemplate
from src.domain.models import BarChartContent


class BarChartTemplate(BaseTemplate):
    """Template for displaying bar chart widget."""
    
    def load_content(self, content_path: Path) -> BarChartContent:
        """Load bar chart content from JSON file.
        
        Args:
            content_path: Path to the content JSON file
            
        Returns:
            BarChartContent dataclass instance
            
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
        
        # Create BarChartContent
        self.content = BarChartContent(
            categories=content_data.get('categories', []),
            values=content_data.get('values', []),
            colors=content_data.get('colors'),
            x_label=content_data.get('x_label', ''),
            y_label=content_data.get('y_label', ''),
            click_action=content_data.get('click_action')
        )
        
        return self.content
    
    def render(self) -> None:
        """Render the bar chart widget using Streamlit and Plotly."""
        if not self.validate():
            st.error("위젯 데이터가 로드되지 않았습니다.")
            return
        
        # Display title
        title = self.get_title()
        if title:
            st.subheader(title)
        
        if not self.content.categories or not self.content.values:
            st.info("표시할 데이터가 없습니다.")
            return
        
        if len(self.content.categories) != len(self.content.values):
            st.error("카테고리와 값의 개수가 일치하지 않습니다.")
            return
        
        # Create Plotly bar chart
        fig = go.Figure()
        
        # Set colors if provided
        colors = self.content.colors if self.content.colors else None
        if colors and len(colors) == len(self.content.values):
            bar_colors = colors
        else:
            bar_colors = None
        
        fig.add_trace(go.Bar(
            x=self.content.categories,
            y=self.content.values,
            marker_color=bar_colors,
            text=self.content.values,
            textposition='outside',
        ))
        
        # Update layout
        fig.update_layout(
            xaxis_title=self.content.x_label or "카테고리",
            yaxis_title=self.content.y_label or "값",
            height=400,
            showlegend=False
        )
        
        # Display chart
        st.plotly_chart(fig, use_container_width=True)
        
        # Handle click action if specified
        if self.content.click_action:
            st.caption(f"클릭 액션: {self.content.click_action}")
