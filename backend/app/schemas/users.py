from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    employee_code: Optional[str] = None
    role: str
    permission_level: int
    branch_id: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    last_login_at: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
