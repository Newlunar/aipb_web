"""Feed template - displays timeline feed with items."""

import streamlit as st
from pathlib import Path
from typing import Dict, Any
import json
from datetime import datetime
from src.templates.base_template import BaseTemplate
from src.domain.models import FeedContent, FeedItem


class FeedTemplate(BaseTemplate):
    """Template for displaying feed widget."""
    
    def load_content(self, content_path: Path) -> FeedContent:
        """Load feed content from JSON file.
        
        Args:
            content_path: Path to the content JSON file
            
        Returns:
            FeedContent dataclass instance
            
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
        
        # Convert items to FeedItem dataclass instances
        items = []
        for item_data in content_data.get('items', []):
            item = FeedItem(
                timestamp=item_data.get('timestamp', ''),
                title=item_data.get('title', ''),
                content=item_data.get('content', ''),
                icon=item_data.get('icon'),
                link=item_data.get('link')
            )
            items.append(item)
        
        # Create FeedContent
        self.content = FeedContent(items=items)
        
        return self.content
    
    def render(self) -> None:
        """Render the feed widget using Streamlit."""
        if not self.validate():
            st.error("위젯 데이터가 로드되지 않았습니다.")
            return
        
        # Display title
        title = self.get_title()
        if title:
            st.subheader(title)
        
        if not self.content.items:
            st.info("표시할 피드 항목이 없습니다.")
            return
        
        # Display feed items in timeline
        for idx, item in enumerate(self.content.items):
            with st.container():
                # Parse timestamp
                try:
                    dt = datetime.fromisoformat(item.timestamp.replace('Z', '+00:00'))
                    time_str = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    time_str = item.timestamp
                
                # Display item
                col1, col2 = st.columns([1, 10])
                
                with col1:
                    if item.icon:
                        st.write(f"🔔" if item.icon == "news" else "📢")
                    else:
                        st.write("•")
                
                with col2:
                    st.markdown(f"**{item.title}**")
                    st.caption(time_str)
                    st.write(item.content)
                    
                    if item.link:
                        st.markdown(f"[자세히 보기]({item.link})")
                
                if idx < len(self.content.items) - 1:
                    st.divider()
