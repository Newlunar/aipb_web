from pydantic import BaseModel
from typing import Optional


class FeedItemResponse(BaseModel):
    id: str
    title: str
    content: str

    class Config:
        from_attributes = True
