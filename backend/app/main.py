import os
import sys
from pathlib import Path

# Add backend directory to sys.path so 'app.*' imports work from anywhere
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.core.config import settings
from app.api import auth, users, conversations, messages

app = FastAPI(
    title="Pulse Chat API",
    description="Real-time web messaging backend powered by FastAPI & Supabase",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(messages.router, prefix="/api")

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "Pulse Chat API",
        "environment": settings.ENVIRONMENT
    }

# Dynamic Frontend Static Files Serving
# Find frontend directory whether running from root, /backend, or Render container
possible_frontend_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend",
    Path.cwd() / "frontend",
    Path("/app/frontend"),
    Path(__file__).resolve().parent.parent / "frontend"
]

frontend_dir = None
for p in possible_frontend_paths:
    if p.exists() and (p / "index.html").exists():
        frontend_dir = p
        break

if frontend_dir:
    # Mount css, js, assets if present
    css_dir = frontend_dir / "css"
    if css_dir.exists():
        app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")

    js_dir = frontend_dir / "js"
    if js_dir.exists():
        app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")

    assets_dir = frontend_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(frontend_dir / "index.html")

    @app.get("/index.html")
    async def serve_index_html():
        return FileResponse(frontend_dir / "index.html")

    @app.get("/login.html")
    async def serve_login():
        return FileResponse(frontend_dir / "login.html")

    @app.get("/register.html")
    async def serve_register():
        return FileResponse(frontend_dir / "register.html")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) if settings.ENVIRONMENT == "development" else "Internal server error"}
    )
