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
from app.api import auth, users, conversations, messages, invitations, members

app = FastAPI(
    title="The Society API",
    description="Sovereign institutional operations & encrypted communications backend",
    version="2.0.0"
)

# CORS Middleware (Explicit authorized origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache-Control Middleware: Prevents browser stale cache for HTML entry points
@app.middleware("http")
async def cache_control_middleware(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    # Immutable long-cache for hashed assets
    if "/_next/static/" in path or "/assets/" in path:
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif path.endswith((".html", ".js", ".css")) or path in ("/", "/index.html", "/login", "/member", "/founder"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

# API Routers (Mount on both /api and /api/v1 for seamless versioning)
for prefix in ("/api", "/api/v1"):
    app.include_router(auth.router, prefix=prefix)
    app.include_router(users.router, prefix=prefix)
    app.include_router(conversations.router, prefix=prefix)
    app.include_router(messages.router, prefix=prefix)
    app.include_router(invitations.router, prefix=prefix)
    app.include_router(members.router, prefix=prefix)

# Public Config Endpoint (exposes only the public anon key & URL, NEVER service role key)
@app.get("/api/config", tags=["Configuration"])
@app.get("/api/v1/config", tags=["Configuration"])
async def get_public_config():
    return {
        "supabase_url": settings.SUPABASE_URL,
        "supabase_anon_key": settings.SUPABASE_KEY
    }

# Health Check Endpoint
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "The Society Authority API",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT
    }

# ----------------------------------------------------------------------
# Dynamic Frontend Static Files Serving: Priority Next.js 16 Export
# ----------------------------------------------------------------------
possible_next_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend-next" / "out",
    Path.cwd() / "frontend-next" / "out",
    Path("/app/frontend-next/out"),
    Path(__file__).resolve().parent.parent / "frontend-next" / "out",
]

next_out_dir = None
for p in possible_next_paths:
    if p.exists() and (p / "index.html").exists():
        next_out_dir = p
        break

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

# 1. Mount Modern Next.js 16 Static Export if present
if next_out_dir:
    next_static = next_out_dir / "_next"
    if next_static.exists():
        app.mount("/_next", StaticFiles(directory=str(next_static)), name="next_static")

    # Route mappings for Next.js 16 App Router exported routes
    next_routes = [
        ("", "index.html"),
        ("login", "login.html"),
        ("induction", "induction.html"),
        ("member", "member.html"),
        ("founder", "founder.html"),
        ("legends", "legends.html"),
        ("roundtable", "roundtable.html"),
        ("charter", "charter.html"),
        ("archives", "archives.html"),
        ("meeting-room", "meeting-room.html"),
        ("security-centre", "security-centre.html"),
        ("notifications", "notifications.html"),
    ]

    for route, filename in next_routes:
        target = next_out_dir / filename
        if not target.exists():
            target = next_out_dir / route / "index.html"
        
        if target.exists():
            path_pattern = f"/{route}" if route else "/"
            def make_handler(target_file: Path):
                async def handler():
                    return FileResponse(target_file)
                return handler
            app.get(path_pattern, include_in_schema=False)(make_handler(target))

# 2. Legacy / Fallback Static Mount (100% Dark Institutional Society)
if frontend_dir:
    css_dir = frontend_dir / "css"
    if css_dir.exists():
        app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")

    js_dir = frontend_dir / "js"
    if js_dir.exists():
        app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")

    assets_dir = frontend_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    if not next_out_dir:
        @app.get("/", include_in_schema=False)
        async def serve_legacy_index():
            return FileResponse(frontend_dir / "index.html")

    @app.get("/index.html", include_in_schema=False)
    async def serve_index_html():
        return FileResponse(frontend_dir / "index.html")

    @app.get("/login.html", include_in_schema=False)
    async def serve_login():
        return FileResponse(frontend_dir / "login.html")

    @app.get("/register.html", include_in_schema=False)
    async def serve_register():
        return FileResponse(frontend_dir / "register.html")

    @app.get("/admin.html", include_in_schema=False)
    async def serve_admin():
        return FileResponse(frontend_dir / "admin.html")

    @app.get("/legends.html", include_in_schema=False)
    async def serve_legends():
        return FileResponse(frontend_dir / "legends.html")

    @app.get("/charter.html", include_in_schema=False)
    async def serve_charter():
        return FileResponse(frontend_dir / "charter.html")

    @app.get("/roundtable.html", include_in_schema=False)
    async def serve_roundtable():
        return FileResponse(frontend_dir / "roundtable.html")

    @app.get("/archives.html", include_in_schema=False)
    async def serve_archives():
        return FileResponse(frontend_dir / "archives.html")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) if settings.ENVIRONMENT == "development" else "Internal server error"}
    )
