import os
from pathlib import Path
from dotenv import load_dotenv

# backend/.env 우선, 없으면 frontend/.env 로드 (같은 키 복사해 쓰기 위함)
load_dotenv()
frontend_env = Path(__file__).resolve().parent.parent.parent / "frontend" / ".env"
if frontend_env.exists():
    load_dotenv(frontend_env)

# 프론트엔드 .env 키(VITE_*) 우선, 없으면 백엔드용 키 사용
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_KEY", "")

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
