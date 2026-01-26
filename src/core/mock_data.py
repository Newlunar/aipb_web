"""Mock data generation utilities."""

from pathlib import Path
import json
from typing import Dict, Any


def create_widget_attributes(
    widget_id: str,
    template_type: str,
    title: str,
    position: Dict[str, int],
    size: Dict[str, int],
    visible: bool = True
) -> Dict[str, Any]:
    """Create widget attributes dictionary.
    
    Args:
        widget_id: Unique widget identifier
        template_type: Type of template (e.g., 'action_list', 'bar_chart')
        title: Widget title
        size: Size dict with 'width' and 'height' keys
        visible: Whether widget is visible
        
    Returns:
        Dictionary containing widget attributes
    """
    return {
        "widget_id": widget_id,
        "template_type": template_type,
        "title": title,
        "size": size,
        "visible": visible
    }


def save_widget_attributes(attributes: Dict[str, Any], output_path: Path) -> None:
    """Save widget attributes to JSON file.
    
    Args:
        attributes: Widget attributes dictionary
        output_path: Path to save JSON file
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(attributes, f, ensure_ascii=False, indent=2)


def save_widget_content(content: Dict[str, Any], output_path: Path) -> None:
    """Save widget content to JSON file.
    
    Args:
        content: Widget content dictionary (should include widget_id)
        output_path: Path to save JSON file
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)


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
        return {
            "page_id": page_id,
            "title": "",
            "description": "",
            "widgets": []
        }
    
    with open(layout_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_page_layout(layout: Dict[str, Any], pages_dir: Path, page_id: str) -> None:
    """Save page layout to JSON file.
    
    Args:
        layout: Page layout dictionary
        pages_dir: Path to pages directory
        page_id: Page identifier
    """
    page_dir = pages_dir / page_id
    page_dir.mkdir(parents=True, exist_ok=True)
    
    layout_path = page_dir / "layout.json"
    with open(layout_path, 'w', encoding='utf-8') as f:
        json.dump(layout, f, ensure_ascii=False, indent=2)


def add_widget_to_layout(
    pages_dir: Path,
    page_id: str,
    widget_id: str,
    position: Dict[str, int]
) -> None:
    """Add or update widget position in page layout.
    
    Args:
        pages_dir: Path to pages directory
        page_id: Page identifier
        widget_id: Widget identifier
        position: Position dict with 'row' and 'col' keys
    """
    layout = load_page_layout(pages_dir, page_id)
    
    # Check if widget already exists in layout
    for item in layout["widgets"]:
        if item["widget_id"] == widget_id:
            item["position"] = position
            save_page_layout(layout, pages_dir, page_id)
            return
    
    # Add new widget to layout
    layout["widgets"].append({
        "widget_id": widget_id,
        "position": position
    })
    save_page_layout(layout, pages_dir, page_id)


def remove_widget_from_layout(
    pages_dir: Path,
    page_id: str,
    widget_id: str
) -> None:
    """Remove widget from page layout.
    
    Args:
        pages_dir: Path to pages directory
        page_id: Page identifier
        widget_id: Widget identifier
    """
    layout = load_page_layout(pages_dir, page_id)
    layout["widgets"] = [
        item for item in layout["widgets"]
        if item["widget_id"] != widget_id
    ]
    save_page_layout(layout, pages_dir, page_id)
