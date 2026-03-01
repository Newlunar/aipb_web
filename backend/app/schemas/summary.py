from pydantic import BaseModel
from typing import Optional, Dict, Any


class SummaryCardSettingRow(BaseModel):
    value: str
    value_type: Optional[str] = None
    description: Optional[str] = None


def summary_settings_to_dict(settings: Dict[str, SummaryCardSettingRow]) -> Dict[str, Any]:
    """Frontend expects { [card_type]: { value, value_type, description } }"""
    return {k: v.model_dump() for k, v in settings.items()}
