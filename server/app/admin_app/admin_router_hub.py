
from fastapi import APIRouter

from app.admin_app.admin_routes.admin_auth_routes import router as admin_auth_router
from app.admin_app.admin_routes.admin_profile_route import router as admin_profile_router
from app.admin_app.admin_routes.admin_brand_routes import router as admin_brand_routes
from app.admin_app.admin_routes.admin_category_routes import router as admin_category_routes
from app.admin_app.admin_routes.all_admin_routes import router as all_admin_routes
from app.admin_app.admin_routes.admin_product_routes import router as admin_product_router

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

admin_router.include_router(
    admin_brand_routes,
    prefix="/brand",
    tags=["admin_brand"]
)

admin_router.include_router(
    admin_category_routes,
    prefix="/category",
    tags=["admin_category"]
)

admin_router.include_router(
    all_admin_routes,
    prefix="/admincrud",
    tags=["admin-crud"]
)

admin_router.include_router(
    admin_product_router,
    prefix="/product",
    tags=["admin_product"]
)
