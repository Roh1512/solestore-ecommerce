from app.routes.profile_routes import router as profile_router
from app.routes.auth_routes import router as auth_router
from app.config.cloudinary_config import cloudinary
from app.admin_app.admin_router_hub import admin_router
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.routing import APIRoute
from app.config.db import init_db
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database here
    await init_db()
    yield  # The app will run here after the init
    # Any shutdown logic can go here, if necessary (e.g., closing DB connections)
    print("App shutdown. Closing database connections...")


def custom_generate_unique_id(route: APIRoute):
    if route.tags and len(route.tags) > 0:
        return f"{route.tags[0]}-{route.name}"
    return route.name


app = FastAPI(lifespan=lifespan,
              generate_unique_id_function=custom_generate_unique_id)

origins = [
    "http://localhost:5173",
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/server")
async def root():
    return {"message": "server connected"}


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

app.include_router(profile_router, prefix="/api/profile", tags=["profile"])

app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
