'''Test admin product edit'''

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

    categories_to_delete = [
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
    ]
    await Category.insert_many(categories_to_delete)
    categories = await Category.find_all().to_list()

    brands_to_create = [
        Brand(title="Brand1",),
        Brand(title="Brand2"),
        Brand(title="Brand3"),
    ]
    await Brand.insert_many(brands_to_create)
    brands = await Brand.find_all().to_list()

    products = [
        Product(
            brand=brands[0],
            category=categories[0],
            title="Product1",
            sizes=[
                {"size": 7, "stock": 20},
                {"size": 8, "stock": 20},
            ],
            price=200
        ),
        Product(
            brand=brands[0],
            category=categories[0],
            title="Product2",
            sizes=[
                {"size": 9, "stock": 20},
                {"size": 8, "stock": 20},
            ],
            price=400
        ),
    ]

    await Product.insert_many(products)

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


class TestAdminProductDelete:
    '''Test delete single product'''

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
    async def test_admin_product_delete_success(self, login_admin):
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

            products_response = await client.get(
                "/api/admin/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert products_response.status_code == 200

            products = products_response.json()

            product_id_to_delete = str(products[0]["id"])

            delete_response = await client.delete(
                f"/api/admin/product/{product_id_to_delete}",
                headers=auth_headers,
                follow_redirects=True
            )
            assert delete_response.status_code == 200
            deleted_product = delete_response.json()
            assert isinstance(ProductResponse(
                **deleted_product), ProductResponse)
            product_2_res = await client.get(
                f"/api/admin/product/{product_id_to_delete}",
                headers=auth_headers
            )
            assert product_2_res.status_code == 404
            assert product_2_res.json()["detail"] == "Product not found"

    @pytest.mark.asyncio
    async def test_admin_product_delete_invalid_id(self, login_admin):
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

            delete_response = await client.delete(
                "/api/admin/product/invalid",
                headers=auth_headers,
                follow_redirects=True
            )
            assert delete_response.status_code == 400
            assert delete_response.json(
            )["detail"] == "Invalid product ID: invalid"

    @pytest.mark.asyncio
    async def test_admin_product_delete_product_not_found(self, login_admin):
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

            delete_response = await client.delete(
                "/api/admin/product/678e8e5c7f998e1474047520",
                headers=auth_headers,
                follow_redirects=True
            )
            assert delete_response.status_code == 404
            assert delete_response.json(
            )["detail"] == "Product not found: 678e8e5c7f998e1474047520"


class TestAdminProductsDelete:
    '''Test admin Delete many products'''

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
    async def test_admin_products_delete_success(self, login_admin):
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

            products_response = await client.get(
                "/api/admin/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert products_response.status_code == 200

            products = products_response.json()

            product_ids_to_delete = [
                str(product["id"])
                for product in products
            ]

            delete_response = await client.request(
                "DELETE",
                "/api/admin/product/delete-products",
                headers=auth_headers,
                follow_redirects=True,
                json={"product_ids": product_ids_to_delete}
            )
            assert delete_response.status_code == 200
            deleted_products = delete_response.json()

            all_products_res = await client.get(
                "/api/admin/product",
                headers=auth_headers,
                follow_redirects=True
            )
            all_products = all_products_res.json()

            for product in all_products:
                assert deleted_products["id"] not in product["id"]
