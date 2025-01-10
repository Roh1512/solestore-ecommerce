
from fastapi import APIRouter

from app.admin_app.admin_routes.admin_auth_routes import router as admin_auth_router
from app.admin_app.admin_routes.admin_profile_route import router as admin_profile_router

admin_router = APIRouter()


@admin_router.get("/")
async def admin_get():
    return {"admin": "app"}


admin_router.include_router(
    admin_auth_router,
    prefix="/auth",
    tags=["admin_auth"]
)

admin_router.include_router(
    admin_profile_router,
    prefix="/profile",
    tags=["admin_profile"]
)
