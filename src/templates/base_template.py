"""Base template class for all widget templates."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json
from pathlib import Path


class BaseTemplate(ABC):
    """Abstract base class for all widget templates.
    
    All widget templates must inherit from this class and implement
    the required methods for loading attributes, loading content, and rendering.
    """
    
    def __init__(self, widget_id: str):
        """Initialize template with widget ID.
        
        Args:
            widget_id: Unique identifier for the widget instance
        """
        self.widget_id = widget_id
        self.attributes: Optional[Dict[str, Any]] = None
        self.content: Optional[Any] = None
    
    def load_attributes(self, attributes_path: Path) -> Dict[str, Any]:
        """Load widget attributes from JSON file.
        
        Args:
            attributes_path: Path to the attributes JSON file
            
        Returns:
            Dictionary containing widget attributes
            
        Raises:
            FileNotFoundError: If attributes file doesn't exist
            json.JSONDecodeError: If JSON is invalid
        """
        if not attributes_path.exists():
            raise FileNotFoundError(f"Attributes file not found: {attributes_path}")
        
        with open(attributes_path, 'r', encoding='utf-8') as f:
            self.attributes = json.load(f)
        
        return self.attributes
    
    @abstractmethod
    def load_content(self, content_path: Path) -> Any:
        """Load widget content from JSON file and convert to dataclass.
        
        Args:
            content_path: Path to the content JSON file
            
        Returns:
            Dataclass instance containing widget content
            
        Raises:
            FileNotFoundError: If content file doesn't exist
            json.JSONDecodeError: If JSON is invalid
        """
        pass
    
    @abstractmethod
    def render(self) -> None:
        """Render the widget using Streamlit.
        
        This method should use Streamlit components to display the widget
        based on the loaded attributes and content.
        """
        pass
    
    def validate(self) -> bool:
        """Validate that attributes and content are loaded.
        
        Returns:
            True if both attributes and content are loaded, False otherwise
        """
        return self.attributes is not None and self.content is not None
    
    def get_title(self) -> str:
        """Get widget title from attributes.
        
        Returns:
            Widget title or empty string if not available
        """
        if self.attributes:
            return self.attributes.get('title', '')
        return ''
