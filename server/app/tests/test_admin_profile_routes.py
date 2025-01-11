import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.admin_app.admin_models.admin import Admin, AdminResponse
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from app.config.env_settings import settings
from app.admin_app.admin_crud_operations.admin_crud import create_admin
from beanie import PydanticObjectId


@pytest_asyncio.fixture(
    autouse=True,
    scope="function",
    loop_scope="function"
)
async def setup_db():
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI
    )
    print(await client.server_info())
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[Admin]
    )

    await Admin.delete_all()
    await create_admin({
        "username": "testadmin",
        "email": "testadmin@123.com",
        "password": "password",
        "name": "Test Admin"
    })

    yield

    await Admin.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    return {
        "username": "testadmin",
        "password": "password"
    }


class TestAdminProfileGet:
    @pytest_asyncio.fixture(scope="function", autouse=True)
    async def login_admin(self, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_admin_profile_get_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )

            response = await client.get(
                "/api/admin/profile",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200
            response_data = response.json()
            profile_details = AdminResponse(**response_data)
            assert isinstance(profile_details, AdminResponse)
            assert "password" not in response_data
            assert "refresh_tokens" not in response_data

    @pytest.mark.asyncio
    async def test_admin_profile_get_unauthorized(self):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(
                "/api/admin/profile",
                follow_redirects=True
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Not authenticated"


class TestAdminUpdateProfile:
    @pytest_asyncio.fixture(scope="function", autouse=True)
    async def login_admin(self, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest_asyncio.fixture(scope="function", loop_scope="function")
    def update_info(self):
        return {
            "name": "Admin John",
        }

    @pytest.mark.asyncio()
    async def test_update_admin_success(self, login_admin, update_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.put(
                "/api/admin/profile",
                follow_redirects=True,
                json={
                    "profile_details": update_info,
                    "current_password": "password"
                },
                headers=auth_headers
            )
            response_data = response.json()
            print("Updated Admin: ", response_data)
            assert response.status_code == 200
            profile_details = AdminResponse(**response_data)
            assert isinstance(profile_details, AdminResponse)
            assert "password" not in response_data
            assert "refresh_tokens" not in response_data
            assert response_data["name"] == update_info["name"]

    @pytest.mark.asyncio()
    async def test_update_admin_incorrect_password(self, login_admin, update_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.put(
                "/api/admin/profile",
                follow_redirects=True,
                json={
                    "profile_details": update_info,
                    "current_password": "incorrect_password"
                },
                headers=auth_headers
            )
            response_data = response.json()
            print("Updated Admin: ", response_data)
            assert response.status_code == 401
            assert response_data["detail"] == "Incorrect password"

    @pytest.mark.asyncio
    async def test_update_admin_unauthorized(self, update_info, login_admin):
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
            logout_res = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert logout_res.status_code == 200

            response = await client.put(
                "/api/admin/profile",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "profile_details": update_info,
                    "current_password": "password"
                }
            )
            assert response.status_code == 401
            assert response.json()["detail"] == "Unauthorized"

    @pytest.mark.asyncio
    async def test_admin_profile_update_extra_fields(self, login_admin, update_info):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            update_info["extra"] = "field"
            auth_headers = {
                "Authorization": f"Bearer {login_admin["access_token"]}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME, login_admin["refresh_token"]
            )
            response = await client.put(
                "/api/admin/profile",
                follow_redirects=True,
                json={
                    "profile_details": update_info,
                    "current_password": "password"
                },
                headers=auth_headers
            )
            response_data = response.json()
            print("RES: ", response_data)
            assert response.status_code == 422
            assert response_data["detail"][0]["msg"] == "Extra inputs are not permitted"

    @pytest.mark.asyncio
    async def test_update_admin_invalid_phone(self, login_admin, update_info):
        update_info["phone"] = "invalid_phone"
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
                "/api/admin/profile",
                follow_redirects=True,
                json={
                    "profile_details": update_info,
                    "current_password": "password"
                },
                headers=auth_headers
            )
            print(response.json())
            assert response.status_code == 422
            for detail in response.json()["detail"]:
                assert "value_error" in detail["type"]
                assert "phone" in detail["loc"]
                assert "profile_details" in detail["loc"]
                assert "Value error, Phone number must be a 10-digit number." in detail["msg"]


class TestAdminUpdateProfileImage:
    @pytest_asyncio.fixture(scope="function", autouse=True)
    async def login_admin(self, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def update_admin_profile_img_without_file(self, login_admin):
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

            response = await client.post(
                "/api/admin/profile/update-profile-img",
                headers=auth_headers
            )
            response_data = response.json()
            print(response_data)
            assert response.status_code == 422
            assert "fileee" in response_data["detail"]["0"]["loc"]

    @pytest.mark.asyncio
    async def update_admin_profile_img_unauthorized(self, login_admin):
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
            logout_respnse = await client.post(
                "/api/admin/auth/logout",
                headers=auth_headers
            )
            assert logout_respnse.status_code == 200

            response = await client.post(
                "/api/admin/profile/update-profile-img",
                headers=auth_headers
            )
            response_data = response.json()
            print(response_data)
            assert response.status_code == 422
            assert "fileee" in response_data["detail"]["0"]["loc"]


class TestAdminUpdateRole:
    @pytest_asyncio.fixture(scope="function", autouse=True)
    async def login_admin(self, login_info):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # Attempt login
            response = await client.post(
                "/api/admin/auth/login",
                data={
                    "username": login_info["username"],
                    "password": login_info["password"]
                }
            )

            # Debug print the response
            print(f"Login response status: {response.status_code}")
            print(f"Login response data: {response.json()}")

            assert response.status_code == 200
            response_data = response.json()

            # Get required data, with proper error handling
            access_token = response_data.get("access_token")
            if not access_token:
                raise ValueError("Access token not found in response")

            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            if not refresh_token:
                raise ValueError("Refresh token not found in cookies")

            adminLoggedIn = await client.get(
                "/api/admin/profile",
                follow_redirects=True,
                headers={
                    "Authorization": f"Bearer {access_token}"
                }
            )
            admin_data = adminLoggedIn.json()
            print("ADMIN: ", admin_data)
            admin_id = admin_data["_id"]

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "admin_id": str(admin_id)  # Ensure ID is string
            }

    @pytest.mark.asyncio
    async def test_update_role_invalid_role(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME,
                login_admin["refresh_token"]
            )

            # Test with invalid role
            response = await client.put(
                f"/api/admin/profile/update-admin-role/{
                    login_admin['admin_id']}",
                headers=auth_headers,
                json={
                    "role": "ADM"  # Invalid role value
                }
            )
            assert response.status_code == 422  # Validation error
            response_data = response.json()
            assert "detail" in response_data
            assert any("role" in error["loc"]
                       for error in response_data["detail"])

    @pytest.mark.asyncio
    async def test_update_role_success(self, login_admin):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME,
                login_admin["refresh_token"]
            )

            # Test with valid role
            response = await client.put(
                f"/api/admin/profile/update-admin-role/{
                    login_admin['admin_id']}",
                headers=auth_headers,
                json={
                    "role": "ORDER_MANAGER"  # Valid role from AdminRole enum
                }
            )
            assert response.status_code == 200
            response_data = response.json()
            assert response_data["role"] == "ORDER_MANAGER"

    @pytest.mark.asyncio
    async def test_update_role_unauthorized(self, login_admin):
        # First update the current admin to non-admin role
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            auth_headers = {
                "Authorization": f"Bearer {login_admin['access_token']}"
            }
            client.cookies.set(
                settings.ADMIN_REFRESH_COOKIE_NAME,
                login_admin["refresh_token"]
            )

            update_admin = await Admin.get(
                PydanticObjectId(login_admin["admin_id"])
            )
            update_admin.role = "PRODUCT_MANAGER"
            await update_admin.save()

            # Try to update role when not an ADMIN
            response = await client.put(
                f"/api/admin/profile/update-admin-role/{
                    login_admin['admin_id']}",
                headers=auth_headers,
                json={
                    "role": "ORDER_MANAGER"
                }
            )
            assert response.status_code == 403
            assert response.json()[
                "detail"] == "Only an admin can update roles"
