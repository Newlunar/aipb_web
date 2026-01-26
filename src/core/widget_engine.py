"""Widget engine for loading and combining templates with data."""

import json
from pathlib import Path
from typing import Dict, List, Optional, Type
from src.templates.base_template import BaseTemplate


class WidgetEngine:
    """Engine for loading widgets and combining templates with data."""
    
    def __init__(self, attributes_dir: Path, content_dir: Path):
        """Initialize widget engine.
        
        Args:
            attributes_dir: Directory containing widget attribute JSON files
            content_dir: Directory containing widget content JSON files
        """
        self.attributes_dir = Path(attributes_dir)
        self.content_dir = Path(content_dir)
        self.template_registry: Dict[str, Type[BaseTemplate]] = {}
    
    def register_template(self, template_type: str, template_class: Type[BaseTemplate]) -> None:
        """Register a template class for a specific template type.
        
        Args:
            template_type: Type identifier (e.g., 'action_list', 'bar_chart')
            template_class: Template class that inherits from BaseTemplate
        """
        self.template_registry[template_type] = template_class
    
    def load_widget_attributes(self, widget_id: str) -> Optional[Dict]:
        """Load widget attributes from JSON file.
        
        Args:
            widget_id: Widget identifier
            
        Returns:
            Dictionary containing widget attributes or None if not found
        """
        attributes_path = self.attributes_dir / f"{widget_id}.json"
        
        if not attributes_path.exists():
            return None
        
        try:
            with open(attributes_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading attributes for {widget_id}: {e}")
            return None
    
    def load_widget_content(self, widget_id: str) -> Optional[Dict]:
        """Load widget content from JSON file.
        
        Args:
            widget_id: Widget identifier
            
        Returns:
            Dictionary containing widget content or None if not found
        """
        content_path = self.content_dir / f"{widget_id}.json"
        
        if not content_path.exists():
            return None
        
        try:
            with open(content_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading content for {widget_id}: {e}")
            return None
    
    def create_widget(self, widget_id: str) -> Optional[BaseTemplate]:
        """Create a widget instance by loading attributes and content.
        
        Args:
            widget_id: Widget identifier
            
        Returns:
            Widget template instance or None if creation fails
        """
        # Load attributes
        attributes = self.load_widget_attributes(widget_id)
        if not attributes:
            return None
        
        template_type = attributes.get('template_type')
        if not template_type:
            print(f"No template_type found in attributes for {widget_id}")
            return None
        
        # Get template class
        template_class = self.template_registry.get(template_type)
        if not template_class:
            print(f"Template type '{template_type}' not registered")
            return None
        
        # Create template instance
        template = template_class(widget_id)
        
        # Load attributes
        attributes_path = self.attributes_dir / f"{widget_id}.json"
        try:
            template.load_attributes(attributes_path)
        except Exception as e:
            print(f"Error loading attributes for {widget_id}: {e}")
            return None
        
        # Load content
        content_path = self.content_dir / f"{widget_id}.json"
        try:
            template.load_content(content_path)
        except Exception as e:
            print(f"Error loading content for {widget_id}: {e}")
            return None
        
        return template
    
    def list_all_widgets(self) -> List[str]:
        """List all widget IDs from attributes directory.
        
        Returns:
            List of widget IDs
        """
        if not self.attributes_dir.exists():
            return []
        
        widget_ids = []
        for file_path in self.attributes_dir.glob("*.json"):
            widget_id = file_path.stem
            widget_ids.append(widget_id)
        
        return sorted(widget_ids)
    
    def list_visible_widgets(self) -> List[str]:
        """List widget IDs that are marked as visible.
        
        Returns:
            List of visible widget IDs
        """
        visible_widgets = []
        
        for widget_id in self.list_all_widgets():
            attributes = self.load_widget_attributes(widget_id)
            if attributes and attributes.get('visible', False):
                visible_widgets.append(widget_id)
        
        return sorted(visible_widgets)
