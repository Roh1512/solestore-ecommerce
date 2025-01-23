import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.model.brand_models import Brand
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings
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
        document_models=[User, Brand]
    )

    await User.delete_all()
    await create_user({
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User"
    })

    await Brand.delete_all()
    brands = [
        Brand(title="Brand 1"),
        Brand(title="Brand 2"),
        Brand(title="Brand 3"),
        Brand(title="Brand 4"),
        Brand(title="Brand 5"),
        Brand(title="Brand 6"),
        Brand(title="Brand 7"),
        Brand(title="Brand 8"),
        Brand(title="Brand 9"),
        Brand(title="Brand 10"),
        Brand(title="Brand 11"),
    ]
    await Brand.insert_many(brands)

    yield

    await User.delete_all()
    await Brand.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for user'''
    return {
        "username": "testuser@123.com",
        "password": "password"
    }


class TestBrandsGet:
    '''Test brand get routes for store'''
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
    async def test_brands_get(self, login_user):
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
                "/api/brand",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_brands_get_invalid_sort_by(self, login_user):
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
                "/api/brand?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'title' or 'date'"

    @pytest.mark.asyncio
    async def test_brands_get_invalid_sort_order(self, login_user):
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
                "/api/brand?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_brands_get_invalid_skip(self, login_user):
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
                "/api/brand?skip=-2",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "skip" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 0"

    @pytest.mark.asyncio
    async def test_brands_get_invalid_limit(self, login_user):
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
                "/api/brand?limit=-2",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "limit" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"
