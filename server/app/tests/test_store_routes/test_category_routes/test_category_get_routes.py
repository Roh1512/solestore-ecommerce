'''Test store category routes'''

import pytest
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings
from app.main import app
from app.model.category_model import Category
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
        document_models=[User, Category]
    )

    await User.delete_all()
    await create_user({
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User"
    })

    await Category.delete_all()
    categories = [
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
        Category(title="Category 4"),
        Category(title="Category 5"),
        Category(title="Category 6"),
        Category(title="Category 7"),
    ]
    await Category.insert_many(categories)

    yield

    await User.delete_all()
    await Category.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for user'''
    return {
        "username": "testuser@123.com",
        "password": "password"
    }


class TestCategoriesGet:
    '''Test category get routes for store'''
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
    async def test_categories_get(self, login_user):
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
                "/api/category",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_categories_get_invalid_sort_by(self, login_user):
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
                "/api/category?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'title' or 'date'"

    @pytest.mark.asyncio
    async def test_categories_get_invalid_sort_order(self, login_user):
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
                "/api/category?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_categories_get_invalid_skip(self, login_user):
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
                "/api/category?skip=-1",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "skip" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 0"

    @pytest.mark.asyncio
    async def test_categories_get_invalid_limit(self, login_user):
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
                "/api/category?limit=-1",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "limit" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"
