from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from app.config.env_settings import get_settings, Settings
from app.config.db import init_db

from app.admin_app.admin_router_hub import admin_router

from app.config.cloudinary_config import cloudinary

from app.routes.auth_routes import router as auth_router
from app.routes.profile_routes import router as profile_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database here
    await init_db()
    yield  # The app will run here after the init
    # Any shutdown logic can go here, if necessary (e.g., closing DB connections)
    print("App shutdown. Closing database connections...")

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root(settings: Settings = Depends(get_settings)):
    return {"sample": settings.SAMPLE}


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

app.include_router(profile_router, prefix="/api/profile", tags=["profile"])

app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
