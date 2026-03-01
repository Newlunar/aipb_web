from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError(
        "Supabase credentials required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY "
        "(e.g. copy from frontend/.env) or SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env"
    )

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
