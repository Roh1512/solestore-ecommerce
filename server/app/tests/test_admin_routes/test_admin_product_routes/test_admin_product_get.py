'''Test admin product get'''

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


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def product_data_1():
    '''Product data 1'''
    return {
        "title": "Product1",
        "description": "Description of product",
        "price": 221.0,
        "brand": None,
        "category": None,
        "sizes": [
            {
                "size": 10,
                "stock": 10
            },
            {
                "size": 11,
                "stock": 10
            },
            {
                "size": 12,
                "stock": 13
            },
        ]
    }


class TestAdminProductGet:
    '''Test product Get'''
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

    @pytest_asyncio.fixture(scope="function",
                            autouse=True)
    async def product_added(self, login_admin, product_data_1):
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
            brand_res = await client.get(
                "/api/admin/brand/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert brand_res.status_code == 200
            brands = brand_res.json()

            category_res = await client.get(
                "/api/admin/category/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert category_res.status_code == 200
            categories = category_res.json()

            brand_id = str(brands[0]["id"])
            category_id = str(categories[0]["id"])

            product_data_1["category"] = category_id
            product_data_1["brand"] = brand_id

            create_res = await client.post(
                "/api/admin/product/",
                follow_redirects=True,
                headers=auth_headers,
                json=product_data_1
            )
            created_product = create_res.json()
            assert create_res.status_code == 201
            return {"product": created_product}

    @pytest.mark.asyncio
    async def test_admin_product_get_success(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_admin_product_get_invalid_sort_by(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product/?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'price' or 'date'"

    @pytest.mark.asyncio
    async def test_admin_product_get_invalid_sort_order(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product/?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_admin_product_get_invalid_page(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product/?page=0",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "page" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"

    @pytest.mark.asyncio
    async def test_admin_product_get_invalid_category(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product/?category=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid category ID"

    @pytest.mark.asyncio
    async def test_admin_product_get_invalid_brand(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product?brand=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid brand ID"

    @pytest.mark.asyncio
    async def test_admin_product_get_brand_not_found(self, login_admin, product_added):
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

            response = await client.get(
                "/api/admin/product?brand=678e8e5c7f998e1474047520",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Brand not found"


class TestAdminProductGetById:
    '''Test product Get By Id'''
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

    @pytest_asyncio.fixture(scope="function",
                            autouse=True)
    async def product_added(self, login_admin, product_data_1):
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
            brand_res = await client.get(
                "/api/admin/brand/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert brand_res.status_code == 200
            brands = brand_res.json()

            category_res = await client.get(
                "/api/admin/category/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert category_res.status_code == 200
            categories = category_res.json()

            brand_id = str(brands[0]["id"])
            category_id = str(categories[0]["id"])

            product_data_1["category"] = category_id
            product_data_1["brand"] = brand_id

            create_res = await client.post(
                "/api/admin/product/",
                follow_redirects=True,
                headers=auth_headers,
                json=product_data_1
            )
            created_product = create_res.json()
            assert create_res.status_code == 201
            return {"product": created_product}

    @pytest.mark.asyncio
    async def product_by_id_success(self, login_admin):
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
            products_res = await client.get(
                "/api/admin/product",
                auth=auth_headers,
                follow_redirects=True
            )
            products = await products_res.json()

            product_res = await client.get(
                f"/api/admin/product/{products[0]["id"]}",
                auth=auth_headers
            )
            assert product_res.status_code == 200
            product = ProductResponse(**product_res.json())
            assert isinstance(product, ProductResponse)

    @pytest.mark.asyncio
    async def product_by_id_invalid_id(self, login_admin):
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

            product_res = await client.get(
                "/api/admin/product/invalid",
                auth=auth_headers
            )
            assert product_res.status_code == 400
            assert product_res.json()["detail"] == "Invalid product ID"

    @pytest.mark.asyncio
    async def product_by_id_not_found(self, login_admin):
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

            product_res = await client.get(
                "/api/admin/product/678e8e5c7f998e1474047520",
                auth=auth_headers
            )
            assert product_res.status_code == 400
            assert product_res.json()["detail"] == "Invalid product ID"
