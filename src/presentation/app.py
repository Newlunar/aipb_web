"""Main Streamlit application with st.navigation."""

import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

import streamlit as st
from src.presentation.widget_view_page import render_widget_view_page
from src.presentation.template_manager_page import render_template_manager_page


# Page configuration
st.set_page_config(
    page_title="AI 자산관리비서 대시보드",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for narrow sidebar
st.markdown("""
<style>
    [data-testid="stSidebar"] {
        min-width: 200px;
        max-width: 200px;
    }
</style>
""", unsafe_allow_html=True)


# Define pages using st.Page
widget_view_page = st.Page(
    render_widget_view_page,
    title="위젯 보기",
    icon=":material/dashboard:",
    default=True
)

template_manager_page = st.Page(
    render_template_manager_page,
    title="템플릿 관리",
    icon=":material/settings:",
    url_path="template-manager"
)


# Navigation with grouped pages
pg = st.navigation({
    "대시보드": [widget_view_page],
    "관리": [template_manager_page]
})

# Run the selected page
pg.run()
