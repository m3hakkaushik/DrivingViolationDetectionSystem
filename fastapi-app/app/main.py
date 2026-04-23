"""
Drishti-Path — FastAPI Application Main Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.auth.router import router as auth_router
from app.trips.router import router as trips_router
from app.clips.router import router as clips_router
from app.portal.router import router as portal_router
from app.fines.router import router as fines_router
from fastapi.staticfiles import StaticFiles
import os

# Import all models to ensure Base.metadata.create_all registers them
import app.auth.models
import app.trips.models
import app.clips.models
import app.fines.models

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: initialise DB tables (dev mode)
    if settings.APP_ENV == "local":
        await init_db()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Drishti-Path — AI dashcam violation review system",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for local development (storage_volume)
if settings.APP_ENV == "local":
    os.makedirs("storage_volume", exist_ok=True)
    app.mount("/storage", StaticFiles(directory="storage_volume"), name="storage")

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(trips_router, prefix="/api/trips", tags=["Trips"])
app.include_router(clips_router, prefix="/api/clips", tags=["Clips"])
app.include_router(portal_router, prefix="/api/portal", tags=["Portal"])
app.include_router(fines_router, prefix="/api/fines", tags=["Fines"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
