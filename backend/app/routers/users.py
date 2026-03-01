from fastapi import APIRouter, HTTPException
from app.supabase_client import supabase
from app.schemas.users import UserResponse

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users", response_model=list[UserResponse])
async def get_users():
    """WM 목록: is_active=true, name 순 정렬"""
    response = supabase.table("users").select("*").eq("is_active", True).order("name").execute()
    if response.data is None:
        return []
    return [UserResponse(**row) for row in response.data]
