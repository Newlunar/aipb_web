"""Action list template - displays customer list with action buttons."""

import streamlit as st
from pathlib import Path
from typing import Dict, Any
import json
from src.templates.base_template import BaseTemplate
from src.domain.models import ActionListContent, ActionListItem


class ActionListTemplate(BaseTemplate):
    """Template for displaying action list widget."""
    
    def load_content(self, content_path: Path) -> ActionListContent:
        """Load action list content from JSON file.
        
        Args:
            content_path: Path to the content JSON file
            
        Returns:
            ActionListContent dataclass instance
            
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
        
        # Convert items to ActionListItem dataclass instances
        items = []
        for item_data in content_data.get('items', []):
            item = ActionListItem(
                customer_name=item_data.get('customer_name', ''),
                account_number=item_data.get('account_number', ''),
                amount=item_data.get('amount', 0.0),
                scenario=item_data.get('scenario', ''),
                action_type=item_data.get('action_type', '')
            )
            items.append(item)
        
        # Create ActionListContent
        self.content = ActionListContent(
            items=items,
            filters=content_data.get('filters', [])
        )
        
        return self.content
    
    def render(self) -> None:
        """Render the action list widget using Streamlit."""
        if not self.validate():
            st.error("위젯 데이터가 로드되지 않았습니다.")
            return
        
        # Display title
        title = self.get_title()
        if title:
            st.subheader(title)
        
        if not self.content.items:
            st.info("표시할 항목이 없습니다.")
            return
        
        # Filter options
        if self.content.filters:
            st.markdown("### 필터")
            selected_filters = {}
            
            if 'scenario' in self.content.filters:
                scenarios = list(set(item.scenario for item in self.content.items))
                selected_scenario = st.selectbox("시나리오", ["전체"] + scenarios)
                if selected_scenario != "전체":
                    selected_filters['scenario'] = selected_scenario
            
            if 'amount_range' in self.content.filters:
                amounts = [item.amount for item in self.content.items]
                min_amount = min(amounts) if amounts else 0
                max_amount = max(amounts) if amounts else 0
                
                # Handle case when min equals max (slider requires min < max)
                if min_amount < max_amount:
                    amount_range = st.slider(
                        "금액 범위",
                        min_value=float(min_amount),
                        max_value=float(max_amount),
                        value=(float(min_amount), float(max_amount))
                    )
                    selected_filters['amount_min'] = amount_range[0]
                    selected_filters['amount_max'] = amount_range[1]
                else:
                    # All items have the same amount, show as info
                    st.info(f"금액: {min_amount:,.0f}원 (모든 항목 동일)")
            
            # Filter items
            filtered_items = self.content.items
            if 'scenario' in selected_filters:
                filtered_items = [item for item in filtered_items 
                                if item.scenario == selected_filters['scenario']]
            if 'amount_min' in selected_filters:
                filtered_items = [item for item in filtered_items 
                                if item.amount >= selected_filters['amount_min']]
            if 'amount_max' in selected_filters:
                filtered_items = [item for item in filtered_items 
                                if item.amount <= selected_filters['amount_max']]
        else:
            filtered_items = self.content.items
        
        # Display items in a table
        st.markdown("### 고객 목록")
        
        if filtered_items:
            # Create DataFrame-like display
            for idx, item in enumerate(filtered_items):
                with st.container():
                    col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
                    
                    with col1:
                        st.write(f"**{item.customer_name}**")
                        st.caption(f"계좌: {item.account_number}")
                    
                    with col2:
                        st.write(f"금액: {item.amount:,.0f}원")
                    
                    with col3:
                        st.write(f"시나리오: {item.scenario}")
                    
                    with col4:
                        if st.button("상담 연결", key=f"action_{self.widget_id}_{idx}"):
                            st.success(f"{item.customer_name}님에게 상담 연결 요청이 전송되었습니다.")
                    
                    st.divider()
        else:
            st.info("필터 조건에 맞는 항목이 없습니다.")
