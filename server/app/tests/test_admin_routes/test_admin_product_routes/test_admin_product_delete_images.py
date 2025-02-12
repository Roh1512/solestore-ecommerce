'''Test admin product add image'''

import pytest
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.main import app
from app.model.category_model import Category
from app.model.brand_models import Brand
from app.model.product_models import Product, ProductResponse
from app.config.env_settings import settings
from app.admin_app.admin_models.admin import Admin
from app.admin_app.admin_crud_operations.admin_crud import create_admin


@pytest_asyncio.fixture(
    autouse=True,
    scope="function",
    loop_scope="function"
)
async def setup_bd():
    '''Set up database for testing'''
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI
    )
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[Admin, Category, Brand, Product]
    )

    await Admin.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    await create_admin({
        "username": "testadmin",
        "email": "testadmin@123.com",
        "password": "password",
        "name": "Test Admin",
        "role": "ADMIN"
    })

    categories = [
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
    ]
    await Category.insert_many(categories)

    brands = [
        Brand(title="Brand1"),
        Brand(title="Brand2"),
        Brand(title="Brand3"),
    ]
    await Brand.insert_many(brands)

    yield

    await Admin.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for admin'''
    return {
        "username": "testadmin@123.com",
        "password": "password"
    }


class TestAdminProductDeleteImage:
    '''Test product add image'''
    @pytest_asyncio.fixture(
        scope="function",
        autouse=True
    )
    async def login_admin(self, login_info):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            response_data = response.json()
            assert response.status_code == 200
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_admin_product_delete_image_invalid_id(self, login_admin):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.put(
                "/api/admin/product/invalid/delete-images",
                headers=auth_headers,
                follow_redirects=True,
                json={
                    "public_ids": ["123", "345"]
                }
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid product ID"

    @pytest.mark.asyncio
    async def test_admin_product_delete_image_product_not_found(self, login_admin):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.put(
                "/api/admin/product/678e8e5c7f998e1474047520/delete-images",
                json={
                    "public_ids": [
                        "123", "345"
                    ]
                },
                headers=auth_headers,
                follow_redirects=True
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Product not found"
