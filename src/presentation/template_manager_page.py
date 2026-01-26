"""Template manager page - create and manage widget templates."""

import json
import streamlit as st
from pathlib import Path
from src.core.widget_engine import WidgetEngine
from src.core.mock_data import (
    create_widget_attributes,
    save_widget_attributes,
    save_widget_content,
    load_page_layout,
    save_page_layout,
    add_widget_to_layout,
    remove_widget_from_layout
)


def render_template_manager_page():
    """Render the template manager page."""
    st.title("템플릿 관리")
    st.markdown("위젯과 페이지 레이아웃을 관리합니다.")
    
    # Initialize paths
    base_path = Path(__file__).parent.parent.parent
    attributes_dir = base_path / "data" / "widgets" / "attributes"
    content_dir = base_path / "data" / "widgets" / "content"
    pages_dir = base_path / "data" / "pages"
    
    engine = WidgetEngine(attributes_dir, content_dir)
    
    # Tabs for different management areas
    tab1, tab2, tab3 = st.tabs(["위젯 생성/수정", "위젯 목록", "페이지 레이아웃"])
    
    with tab1:
        render_widget_form(attributes_dir, content_dir)
    
    with tab2:
        render_widget_list(engine, attributes_dir, content_dir, pages_dir)
    
    with tab3:
        render_page_layout_manager(engine, pages_dir)


def render_widget_form(attributes_dir: Path, content_dir: Path):
    """Render widget creation/edit form."""
    st.subheader("위젯 생성/수정")
    
    # Template type selection
    template_type = st.selectbox(
        "템플릿 타입",
        ["action_list", "bar_chart", "feed", "calendar"]
    )
    
    # Widget attributes form (position removed)
    st.markdown("### 위젯 속성")
    widget_id = st.text_input("위젯 ID", placeholder="예: action_list_001")
    title = st.text_input("제목", placeholder="예: 만기 고객 목록")
    
    col1, col2 = st.columns(2)
    with col1:
        width = st.number_input("너비", min_value=1, value=2)
    with col2:
        height = st.number_input("높이", min_value=1, value=2)
    
    visible = st.checkbox("표시", value=True)
    
    # Content form based on template type
    st.markdown("### 컨텐츠 데이터")
    content_data = render_content_form(template_type)
    
    # Save button
    if st.button("저장", type="primary"):
        if not widget_id:
            st.error("위젯 ID를 입력하세요.")
        elif not title:
            st.error("제목을 입력하세요.")
        else:
            # Create and save attributes (without position)
            attributes = create_widget_attributes(
                widget_id=widget_id,
                template_type=template_type,
                title=title,
                size={"width": width, "height": height},
                visible=visible
            )
            
            attributes_path = attributes_dir / f"{widget_id}.json"
            save_widget_attributes(attributes, attributes_path)
            
            # Create and save content
            content = {
                "widget_id": widget_id,
                "content": content_data
            }
            content_path = content_dir / f"{widget_id}.json"
            save_widget_content(content, content_path)
            
            st.success(f"위젯 '{widget_id}'이(가) 저장되었습니다!")
            st.info("💡 페이지 레이아웃 탭에서 위젯의 위치를 설정하세요.")


def render_content_form(template_type: str) -> dict:
    """Render content form based on template type."""
    if template_type == "action_list":
        return render_action_list_content_form()
    elif template_type == "bar_chart":
        return render_bar_chart_content_form()
    elif template_type == "feed":
        return render_feed_content_form()
    elif template_type == "calendar":
        return render_calendar_content_form()
    else:
        return {}


def render_action_list_content_form() -> dict:
    """Render action list content form."""
    st.info("액션 리스트 컨텐츠 입력 (간단 버전)")
    
    content_json = st.text_area(
        "컨텐츠 JSON",
        value='{\n  "items": [],\n  "filters": []\n}',
        height=200
    )
    
    try:
        return json.loads(content_json)
    except json.JSONDecodeError:
        st.error("유효하지 않은 JSON입니다.")
        return {"items": [], "filters": []}


def render_bar_chart_content_form() -> dict:
    """Render bar chart content form."""
    st.info("바 차트 컨텐츠 입력 (간단 버전)")
    
    content_json = st.text_area(
        "컨텐츠 JSON",
        value='{\n  "categories": [],\n  "values": [],\n  "x_label": "",\n  "y_label": ""\n}',
        height=200
    )
    
    try:
        return json.loads(content_json)
    except json.JSONDecodeError:
        st.error("유효하지 않은 JSON입니다.")
        return {"categories": [], "values": []}


def render_feed_content_form() -> dict:
    """Render feed content form."""
    st.info("피드형 컨텐츠 입력 (간단 버전)")
    
    content_json = st.text_area(
        "컨텐츠 JSON",
        value='{\n  "items": []\n}',
        height=200
    )
    
    try:
        return json.loads(content_json)
    except json.JSONDecodeError:
        st.error("유효하지 않은 JSON입니다.")
        return {"items": []}


def render_calendar_content_form() -> dict:
    """Render calendar content form."""
    st.info("캘린더 컨텐츠 입력 (간단 버전)")
    
    content_json = st.text_area(
        "컨텐츠 JSON",
        value='{\n  "events": []\n}',
        height=200
    )
    
    try:
        return json.loads(content_json)
    except json.JSONDecodeError:
        st.error("유효하지 않은 JSON입니다.")
        return {"events": []}


def render_widget_list(engine: WidgetEngine, attributes_dir: Path, content_dir: Path, pages_dir: Path):
    """Render widget list with edit/delete options."""
    st.subheader("위젯 목록")
    
    widget_ids = engine.list_all_widgets()
    
    if not widget_ids:
        st.info("저장된 위젯이 없습니다.")
        return
    
    for widget_id in widget_ids:
        with st.expander(f"위젯: {widget_id}"):
            attributes = engine.load_widget_attributes(widget_id)
            if attributes:
                st.json(attributes)
            
            if st.button(f"삭제", key=f"delete_{widget_id}"):
                # Delete files
                attributes_path = attributes_dir / f"{widget_id}.json"
                content_path = content_dir / f"{widget_id}.json"
                
                if attributes_path.exists():
                    attributes_path.unlink()
                if content_path.exists():
                    content_path.unlink()
                
                # Remove from all page layouts
                remove_widget_from_layout(pages_dir, "main_dashboard", widget_id)
                
                st.success(f"위젯 '{widget_id}'이(가) 삭제되었습니다.")
                st.rerun()


def render_page_layout_manager(engine: WidgetEngine, pages_dir: Path):
    """Render page layout manager."""
    st.subheader("페이지 레이아웃 관리")
    
    # Page selection (for now, just main_dashboard)
    page_id = st.selectbox("페이지 선택", ["main_dashboard"])
    
    layout = load_page_layout(pages_dir, page_id)
    
    # Page info
    st.markdown("#### 페이지 정보")
    page_title = st.text_input("페이지 제목", value=layout.get("title", ""))
    page_desc = st.text_input("페이지 설명", value=layout.get("description", ""))
    
    if st.button("페이지 정보 저장"):
        layout["title"] = page_title
        layout["description"] = page_desc
        save_page_layout(layout, pages_dir, page_id)
        st.success("페이지 정보가 저장되었습니다.")
    
    st.divider()
    
    # Widget position management
    st.markdown("#### 위젯 배치")
    
    # Show current layout
    if layout.get("widgets"):
        st.markdown("**현재 배치된 위젯:**")
        for item in layout["widgets"]:
            col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
            with col1:
                st.text(f"📦 {item['widget_id']}")
            with col2:
                st.text(f"행: {item['position']['row']}")
            with col3:
                st.text(f"열: {item['position']['col']}")
            with col4:
                if st.button("제거", key=f"remove_{item['widget_id']}"):
                    remove_widget_from_layout(pages_dir, page_id, item['widget_id'])
                    st.rerun()
    else:
        st.info("배치된 위젯이 없습니다.")
    
    st.divider()
    
    # Add widget to layout
    st.markdown("#### 위젯 추가/수정")
    
    # Get available widgets
    all_widgets = engine.list_all_widgets()
    current_widget_ids = [item["widget_id"] for item in layout.get("widgets", [])]
    
    if all_widgets:
        selected_widget = st.selectbox("위젯 선택", all_widgets)
        
        # Check if widget is already in layout
        current_pos = {"row": 0, "col": 0}
        for item in layout.get("widgets", []):
            if item["widget_id"] == selected_widget:
                current_pos = item["position"]
                break
        
        col1, col2 = st.columns(2)
        with col1:
            new_row = st.number_input("행 위치", min_value=0, value=current_pos["row"], key="new_row")
        with col2:
            new_col = st.number_input("열 위치", min_value=0, value=current_pos["col"], key="new_col")
        
        if st.button("위치 저장", type="primary"):
            add_widget_to_layout(pages_dir, page_id, selected_widget, {"row": new_row, "col": new_col})
            st.success(f"위젯 '{selected_widget}'의 위치가 저장되었습니다.")
            st.rerun()
    else:
        st.info("등록된 위젯이 없습니다. 먼저 위젯을 생성하세요.")
