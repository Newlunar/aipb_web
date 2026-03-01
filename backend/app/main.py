from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.routers import users, widgets, legacy

app = FastAPI(title="AIPB API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(widgets.router)
app.include_router(legacy.router)


@app.get("/health")
def health():
    return {"status": "ok"}
