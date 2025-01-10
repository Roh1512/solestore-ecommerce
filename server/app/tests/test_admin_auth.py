import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.admin_app.admin_models.admin import Admin, AdminResponse
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


class TestAdminLogin:

    @pytest.mark.asyncio
    async def test_admin_login_success(self, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data=login_info
            )

            assert response.status_code == 200
            response_data = response.json()
            print("Login Response: ", response_data)
            assert "access_token" in response_data
            assert settings.ADMIN_REFRESH_COOKIE_NAME in response.cookies

    @pytest.mark.asyncio
    async def test_admin_login_with_email(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": "testadmin@123.com",
                    "password": "password"
                }
            )

            assert response.status_code == 200
            response_data = response.json()
            print("Login Response: ", response_data)
            assert "access_token" in response_data
            assert settings.ADMIN_REFRESH_COOKIE_NAME in response.cookies

    @pytest.mark.asyncio
    async def test_admin_login_user_not_found(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": "unknownadmin",
                    "password": "password"
                }
            )

            assert response.status_code == 404
            response_data = response.json()
            assert response_data["detail"] == "Admin not found"

    @pytest.mark.asyncio
    async def test_admin_login_incorrect_password(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": "testadmin",
                    "password": "incorrect_password"
                }
            )

            assert response.status_code == 401
            response_data = response.json()
            assert response_data["detail"] == "Incorrect email or password"

    @pytest.mark.asyncio
    async def test_admin_login_missing_fields(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "password": "incorrect_password"
                }
            )

            assert response.status_code == 422
            response_data = response.json()
            for field in response_data["detail"]:
                assert "Field required" in field["msg"]
                assert "username" in field["loc"] or "password" in field["loc"]


class TestAdminCheckAuth:
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
    async def test_admin_check_auth_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.get(
                "/api/admin/auth/checkauth",
                headers=auth_headers
            )

            assert response.status_code == 200

            response_data = response.json()
            admin_details = AdminResponse(**response_data["admin"])
            assert isinstance(admin_details, AdminResponse)
            assert "status" in response_data
            assert "username" in response_data["admin"]
            assert "email" in response_data["admin"]
            assert "refresh_tokens" not in response_data["admin"]
            assert "password" not in response_data["admin"]
            assert response.json()["status"] == "authenticated"

    @pytest.mark.asyncio
    async def test_admin_check_auth_without_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            response = await client.get(
                "/api/admin/auth/checkauth",
                headers=auth_headers
            )

            assert response.status_code == 401

            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"

    @pytest.mark.asyncio
    async def test_admin_check_auth_without_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer "
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.get(
                "/api/admin/auth/checkauth",
                headers=auth_headers
            )

            assert response.status_code == 401

            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"

    @pytest.mark.asyncio
    async def test_admin_check_auth_invalid_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_access_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.get(
                "/api/admin/auth/checkauth",
                headers=auth_headers
            )

            assert response.status_code == 401

            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"

    @pytest.mark.asyncio
    async def test_admin_check_auth_invalid_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_access_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, "Invalid_refresh_token"
            )
            response = await client.get(
                "/api/admin/auth/checkauth",
                headers=auth_headers
            )

            assert response.status_code == 401

            response_data = response.json()
            assert response_data["detail"] == "Unauthorized"


class TestAdminLogout:
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
    async def test_admin_logout_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 200
            assert response.json()["message"] == "Logged out"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_without_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_invalid_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_invalid_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, "Invalid_refresh_token"
            )

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_without_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_without_logged_in(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }

            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert response.status_code == 200
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            logout_response = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert logout_response.status_code == 401

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401


class TestAdminLogoutAll:
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
    async def test_admin_logout_all_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 200
            assert response.json()["message"] == "Logged out of all devices"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_all_without_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_all_invalid_access_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_all_invalid_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, "Invalid_refresh_token"
            )

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_all_without_refresh_token(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": "Bearer Invalid_token"
            }

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_logout_all_without_logged_in(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }

            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert response.status_code == 200
            cookie = response.cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            print("Cookie: ", cookie)
            assert cookie is None

            logout_response = await client.post(
                "/api/admin/auth/logoutall",
                headers=auth_headers
            )
            assert logout_response.status_code == 401

            check_auth = await client.get("/api/admin/auth/checkauth", headers=auth_headers)
            assert check_auth.status_code == 401
