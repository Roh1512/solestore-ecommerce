'''Test Product Get route'''

import pytest
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings
from app.main import app
from app.model.category_model import Category
from app.model.brand_models import Brand
from app.model.product_models import Product, ProductResponse
from app.model.user import User
from app.crud.user_crud import create_user


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
    print(await client.server_info())
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[User, Category, Brand, Product]
    )

    await User.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    await create_user({
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User"
    })

    await Category.delete_all()
    categories = await Category.insert_many([
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
        Category(title="Category 4"),
        Category(title="Category 5"),
        Category(title="Category 6"),
        Category(title="Category 7"),
    ])

    categories = await Category.find().to_list()

    await Brand.insert_many([
        Brand(title="Brand1"),
        Brand(title="Brand2"),
        Brand(title="Brand3"),
    ])
    brands = await Brand.find().to_list()

    products = [
        Product(
            title="Product1",
            description="Description of product",
            price=22.99,
            category=categories[0],
            brand=brands[0],
            sizes=[{
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
            },]
        ),
        Product(
            title="Product2",
            description="Description of product",
            price=302.99,
            category=categories[1],
            brand=brands[1],
            sizes=[{
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
            },]
        )
    ]

    await Product.insert_many(products)

    yield

    await User.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function", autouse=True)
def login_info():
    '''Login info for user'''
    return {
        "username": "testuser@123.com",
        "password": "password"
    }


class TestProductGet:
    '''Test product get'''
    @pytest_asyncio.fixture(
        scope="function",
        autouse=True
    )
    async def login_user(self, login_info):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_product_get_success(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_product_get_invalid_sort_order(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_product_get_invalid_sort_by(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'price' or 'date'"

    @pytest.mark.asyncio
    async def test_product_get_invalid_page(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?page=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "page" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be a valid integer, unable to parse string as an integer"

    @pytest.mark.asyncio
    async def test_product_get_page_0(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?page=0",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "page" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"

    @pytest.mark.asyncio
    async def test_product_get_invalid_category(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?category=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid category ID"

    @pytest.mark.asyncio
    async def test_product_get_invalid_brand(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?brand=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid brand ID"

    @pytest.mark.asyncio
    async def test_product_get_category_not_found(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?category=678e8e5c7f998e1474047520",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Category not found"

    @pytest.mark.asyncio
    async def test_product_get_brand_not_found(self, login_user):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            response = await client.get(
                "/api/product/?brand=678e8e5c7f998e1474047520",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Brand not found"


class TestProductGetById:
    '''Test product get by Id'''
    @pytest_asyncio.fixture(
        scope="function",
        autouse=True
    )
    async def login_user(self, login_info):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_product_by_id_success(self, login_user):
        '''Product By Id Success'''
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            products_res = await client.get(
                "/api/product/",
                headers=auth_headers,
                follow_redirects=True
            )
            products = products_res.json()

            print(products)

            assert products_res.status_code == 200

            product_id = str(products[0]["id"])

            print(product_id)

            product_res = await client.get(
                f"/api/product/{product_id}",
                headers=auth_headers,
            )
            print(product_res.json())
            assert product_res.status_code == 200
            product = ProductResponse(**product_res.json())
            assert isinstance(product, ProductResponse)

    @pytest.mark.asyncio
    async def test_product_by_id_invalid_id(self, login_user):
        '''Product By Id Success'''
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            product_res = await client.get(
                "/api/product/invalid",
                headers=auth_headers,
                follow_redirects=True
            )
            assert product_res.status_code == 400
            assert product_res.json()["detail"] == "Invalid product ID"

    @pytest.mark.asyncio
    async def test_product_by_id_not_found(self, login_user):
        '''Product By Id Success'''
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            auth_headers = {
                "Authorization": f"Bearer {login_user["access_token"]}"
            }
            client.cookies.set(
                settings.USER_REFRESH_COOKIE_NAME, login_user["refresh_token"]
            )

            product_res = await client.get(
                "/api/product/678e8e5c7f998e1474047520",
                headers=auth_headers,
                follow_redirects=True
            )
            assert product_res.status_code == 404
            assert product_res.json()["detail"] == "Product not found"
