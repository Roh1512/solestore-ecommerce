from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from app.config.env_settings import settings
from fastapi.exceptions import HTTPException
from contextlib import asynccontextmanager
from app.config.db import init_db


from app.routes.profile_routes import router as profile_router
from app.routes.auth_routes import router as auth_router
from app.admin_app.admin_router_hub import admin_router
from app.routes.brand_routes import router as brand_router
from app.routes.category_routes import router as category_router
from app.routes.product_routes import router as product_router
from app.routes.cart_routes import router as cart_router


from starlette.middleware.sessions import SessionMiddleware

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
              generate_unique_id_function=custom_generate_unique_id, redirect_slashes=True)


origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,  # Replace with a strong secret key
    session_cookie="session"
)

# Mount static files for both React apps
app.mount("/admin-assets", StaticFiles(directory=os.path.join(
    client_admin_build_dir, "assets")), name="admin_assets")
app.mount("/assets", StaticFiles(directory=os.path.join(
    client_build_dir, "assets")), name="client_assets")

# Include the routers for auth, profile, and admin
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(profile_router, prefix="/api/profile", tags=["profile"])
app.include_router(brand_router, prefix="/api/brand", tags=["brand"])
app.include_router(category_router, prefix="/api/category", tags=["category"])
app.include_router(product_router, prefix="/api/product", tags=["Product"])
app.include_router(cart_router, prefix="/api/cart", tags=["Cart"])

app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

# Fallback route for serving the Admin React app


# Admin route handler
# Note: removed the slash
if settings.ENVIRONMENT != "testing":
    @app.get("/admin{full_path:path}", response_class=HTMLResponse)
    async def serve_admin_react_app(full_path: str):
        try:
            print(f"Serving admin app for path: {full_path}")
            index_path = os.path.join(client_admin_build_dir, 'index.html')

            if not os.path.exists(index_path):
                raise HTTPException(
                    status_code=404, detail="Admin app not found")

            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Not Found")

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
        if full_path.startswith("api/") or full_path.startswith("admin/"):
            raise HTTPException(status_code=404, detail="Not Found")
        if not full_path.startswith("api/") and not full_path.startswith("admin"):
            with open(os.path.join(client_build_dir, 'index.html')) as f:
                return HTMLResponse(content=f.read())
