"""Template manager page - create and manage widget templates."""

import json
import streamlit as st
from pathlib import Path
from src.core.widget_engine import WidgetEngine
from src.core.mock_data import (
    create_widget_attributes,
    save_widget_attributes,
    load_page_layout,
    save_page_layout,
    add_widget_to_layout,
    remove_widget_from_layout
)
from src.templates.action_list import ActionListTemplate
from src.templates.bar_chart import BarChartTemplate
from src.templates.feed import FeedTemplate
from src.templates.calendar import CalendarTemplate


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
    
    # Register templates for preview
    engine.register_template("action_list", ActionListTemplate)
    engine.register_template("bar_chart", BarChartTemplate)
    engine.register_template("feed", FeedTemplate)
    engine.register_template("calendar", CalendarTemplate)
    
    # Tabs for different management areas
    tab1, tab2, tab3 = st.tabs(["위젯 생성/수정", "위젯 목록", "페이지 레이아웃"])
    
    with tab1:
        render_widget_form(engine, attributes_dir)
    
    with tab2:
        render_widget_list(engine, attributes_dir, content_dir, pages_dir)
    
    with tab3:
        render_page_layout_manager(engine, pages_dir)


def render_widget_form(engine: WidgetEngine, attributes_dir: Path):
    """Render widget creation/edit form with live preview."""
    
    # Two-column layout: form (narrow) | live preview (wide)
    form_col, preview_col = st.columns([1, 2])
    
    with form_col:
        st.subheader("위젯 생성/수정")
        
        # Template type selection
        template_type = st.selectbox(
            "템플릿 타입",
            ["action_list", "bar_chart", "feed", "calendar"]
        )
        
        # Widget attributes form
        widget_id = st.text_input("위젯 ID", placeholder="예: action_list_001")
        title = st.text_input("제목", placeholder="예: 제목을 입력하시오")
        
        col1, col2 = st.columns(2)
        with col1:
            width = st.number_input("너비 (1-4)", min_value=1, max_value=4, value=2)
        with col2:
            height = st.number_input("높이", min_value=1, value=1)
        
        visible = st.checkbox("표시", value=True)
        
        # Save button
        if st.button("저장", type="primary"):
            if not widget_id:
                st.error("위젯 ID를 입력하세요.")
            elif not title:
                st.error("제목을 입력하세요.")
            else:
                # Create and save attributes
                attributes = create_widget_attributes(
                    widget_id=widget_id,
                    template_type=template_type,
                    title=title,
                    size={"width": width, "height": height},
                    visible=visible
                )
                
                attributes_path = attributes_dir / f"{widget_id}.json"
                save_widget_attributes(attributes, attributes_path)
                
                st.success(f"위젯 '{widget_id}'이(가) 저장되었습니다!")
                st.info("💡 페이지 레이아웃 탭에서 위젯의 위치를 설정하세요.")
    
    with preview_col:
        st.subheader("실시간 미리보기")
        
        # Show live preview with user input title
        render_live_preview(engine, template_type, title)


def render_live_preview(engine: WidgetEngine, template_type: str, title: str):
    """Render a live preview widget with user input title."""
    
    # Template class mapping
    template_classes = {
        "action_list": ActionListTemplate,
        "bar_chart": BarChartTemplate,
        "feed": FeedTemplate,
        "calendar": CalendarTemplate
    }
    
    template_class = template_classes.get(template_type)
    
    if not template_class:
        st.info("지원하지 않는 템플릿 타입입니다.")
        return
    
    # Create template instance with preview ID
    preview_widget = template_class("preview_widget")
    
    # Set attributes directly with user input title
    display_title = title if title else "(제목을 입력하세요)"
    preview_widget.attributes = {
        "widget_id": "preview_widget",
        "template_type": template_type,
        "title": display_title,
        "size": {"width": 2, "height": 1},
        "visible": True
    }
    
    # Load sample content from content directory
    base_path = Path(__file__).parent.parent.parent
    content_dir = base_path / "data" / "widgets" / "content"
    
    # Sample content file mapping
    sample_content_files = {
        "action_list": "action_list_001.json",
        "bar_chart": "bar_chart_001.json",
        "feed": "feed_001.json",
        "calendar": "calendar_001.json"
    }
    
    content_file = sample_content_files.get(template_type)
    content_path = content_dir / content_file if content_file else None
    
    with st.container(border=True):
        if content_path and content_path.exists():
            try:
                preview_widget.load_content(content_path)
                preview_widget.render()
            except Exception as e:
                st.error(f"미리보기 로드 실패: {e}")
        else:
            # Show placeholder if no sample content
            st.subheader(display_title)
            st.info(f"'{template_type}' 타입의 샘플 콘텐츠가 없습니다. 위젯을 저장한 후 콘텐츠를 추가하세요.")


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
