import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.admin_app.admin_models.admin import Admin, AdminResponse
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings


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

    yield

    # Cleanup after test
    await Admin.delete_all()
    client.close()


@pytest_asyncio.fixture(
    scope="function",
    loop_scope="function"
)
def valid_admin():
    return {
        "username": "testadmin",
        "email": "testadmin@123.com",
        "name": "Test Admin",
        "password": "password",
    }


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def duplicate_admin():
    return {
        "username": "duplicateuser",
        "email": "duplicate@123.com",
        "password": "password"
    }


class TestAdminRegister:

    @pytest.mark.asyncio
    async def test_register_admin_success(self, valid_admin):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/api/admin/auth/register", json=valid_admin)
            assert response.status_code == 201

            response_data = response.json()
            admin_details = AdminResponse(**response_data)
            assert isinstance(admin_details, AdminResponse)
            assert "password" not in response_data
            assert "refresh_tokens" not in response_data

    @pytest.mark.asyncio
    async def test_register_admin_duplicate_email(self, duplicate_admin):
        await Admin(**duplicate_admin).create()
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/api/admin/auth/register", json=duplicate_admin)

            assert response.status_code == 400
            response_data = response.json()
            assert response_data["detail"] == "Admin already exists"

    @pytest.mark.asyncio
    async def test_register_admin_duplicate_username(self, duplicate_admin):
        await Admin(**duplicate_admin).create()
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/api/admin/auth/register", json=duplicate_admin)

            assert response.status_code == 400
            response_data = response.json()
            assert response_data["detail"] == "Admin already exists"

    @pytest.mark.asyncio
    async def test_register_admin_invalid_email(self, valid_admin):
        valid_admin["email"] = "invalidEmail"
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/admin/auth/register", json=valid_admin)

            assert response.status_code == 422
            response_data = response.json()
            print(response_data)
            for detail in response_data["detail"]:
                assert "email" in detail["loc"]
            assert "value is not a valid email address" in response_data[
                "detail"][0]["msg"]

    @pytest.mark.asyncio
    async def test_register_admin_missing_fields(self):
        incomplete_admin = {"username": "testuser"}
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/admin/auth/register", json=incomplete_admin)

            assert response.status_code == 422
            for field in response.json()["detail"]:
                assert "Field required" in field["msg"]

    @pytest.mark.asyncio
    async def test_register_admin_extre_fields(self, valid_admin):
        valid_admin["extra_field"] = "extra"
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/admin/auth/register", json=valid_admin)
            assert response.status_code == 422
            assert "Extra inputs are not permitted" in response.json()[
                "detail"][0]["msg"]
