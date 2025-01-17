from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os


from app.routes.profile_routes import router as profile_router
from app.routes.auth_routes import router as auth_router
from app.admin_app.admin_router_hub import admin_router
from contextlib import asynccontextmanager
from app.config.db import init_db
from fastapi.exceptions import HTTPException

from app.config.cloudinary_config import cloudinary  # DO NOT REMOVE

# Path to the React build folder
client_build_dir = os.path.join(os.getcwd(), "..", 'client', 'dist')
client_admin_build_dir = os.path.join(
    os.getcwd(), "..", "client_admin", "dist")

print("Client Build Dir: ", client_build_dir)
print("Client Admin Build Dir: ", client_admin_build_dir)


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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for both React apps
app.mount("/admin-assets", StaticFiles(directory=os.path.join(
    client_admin_build_dir, "assets")), name="admin_assets")
app.mount("/assets", StaticFiles(directory=os.path.join(
    client_build_dir, "assets")), name="client_assets")

# Include the routers for auth, profile, and admin
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(profile_router, prefix="/api/profile", tags=["profile"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

# Fallback route for serving the Admin React app


# Admin route handler
# Note: removed the slash
@app.get("/admin{full_path:path}", response_class=HTMLResponse)
async def serve_admin_react_app(full_path: str):
    try:
        print(f"Serving admin app for path: {full_path}")
        index_path = os.path.join(client_admin_build_dir, 'index.html')

        if not os.path.exists(index_path):
            raise HTTPException(status_code=404, detail="Admin app not found")

        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update all asset paths in the HTML
        content = (
            content
            .replace('src="assets/', 'src="/admin-assets/')
            .replace('href="assets/', 'href="/admin-assets/')
            .replace('src="/assets/', 'src="/admin-assets/')
            .replace('href="/assets/', 'href="/admin-assets/')
        )

        # Debug logs
        print("Modified content preview:")
        print(content[:500])

        return HTMLResponse(content=content)
    except Exception as e:
        print(f"Error serving admin app: {str(e)}")
        raise


@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_react_app(full_path: str):
    # Only serve the React app for paths that aren't API or admin routes
    if not full_path.startswith("api/") and not full_path.startswith("admin"):
        with open(os.path.join(client_build_dir, 'index.html')) as f:
            return HTMLResponse(content=f.read())
