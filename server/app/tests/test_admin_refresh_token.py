import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.admin_app.admin_models.admin import Admin
from app.model.auth_models import Token
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings
from app.admin_app.admin_crud_operations.admin_crud import create_admin


@pytest_asyncio.fixture(autouse=True, scope="function", loop_scope="function")
async def setup_db():
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI)
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[Admin]
    )

    # Clear admins collection before each test
    await Admin.delete_all()

    await create_admin({
        "username": "testadmin",
        "email": "testadmin@123.com",
        "name": "Test Admin",
        "password": "password",
    })

    yield

    # Cleanup after test
    await Admin.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    return {
        "username": "testadmin",
        "password": "password"
    }


class TestAdminRefreshToken:
    @pytest_asyncio.fixture(scope="function", autouse=True)
    async def login_admin(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": "testadmin",
                    "password": "password"
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_admin_refresh_token_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/refresh",
            )
            assert response.status_code == 200
            response_data = response.json()
            token_data = Token(**response_data)
            assert isinstance(token_data, Token)
            assert settings.ADMIN_REFRESH_COOKIE_NAME in response.cookies

    @pytest.mark.asyncio
    async def test_admin_refresh_token_without_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/refresh",
            )
            assert response.status_code == 401
            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"
            assert settings.ADMIN_REFRESH_COOKIE_NAME not in response.cookies

    @pytest.mark.asyncio
    async def test_admin_refresh_token_invalid_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, "Invalid_Refresh_Token"
            )
            response = await client.post(
                "/api/admin/auth/refresh",
            )
            assert response.status_code == 401
            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"
            assert settings.ADMIN_REFRESH_COOKIE_NAME not in response.cookies

    @pytest.mark.asyncio
    async def test_admin_refresh_token_reuse(self, login_admin, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME,
                login_admin["refresh_token"]
            )
            admin_to_update = await Admin.find_one(Admin.username == login_info["username"])
            print("Admin: ", admin_to_update)
            if admin_to_update:
                admin_to_update.refresh_tokens = []
                await admin_to_update.save()
            response = await client.post("/api/admin/auth/refresh")
            response_data = response.json()
            assert response.status_code == 401
            assert response_data["detail"] == "Unauthorized"
            assert settings.ADMIN_REFRESH_COOKIE_NAME not in response.cookies
