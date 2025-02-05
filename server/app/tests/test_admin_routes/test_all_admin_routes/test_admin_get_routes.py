'''Test admin get routes'''

import pytest
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.main import app
from app.model.category_model import Category
from app.config.env_settings import settings
from app.admin_app.admin_models.admin import Admin
from app.admin_app.admin_crud_operations.admin_crud import create_admin


@pytest_asyncio.fixture(
    autouse=True,
    scope="function",
    loop_scope="function"
)
async def setup_db():
    '''Set up database for testing'''
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI
    )
    print(await client.server_info())
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[Admin, Category]
    )

    await Admin.delete_all()

    await create_admin({
        "name": "Test Admin",
        "email": "test@admin.com",
        "username": "testadmin",
        "password": "password",
    })

    admins = [
        Admin(
            name="Admin 1",
            email="admin@1.com",
            username="admin1",
            password="password",
            role="ADMIN"
        ),
        Admin(
            name="Admin 2",
            email="admin@2.com",
            username="admin2",
            password="password",
            role="ADMIN"
        ),
        Admin(
            name="Admin 3",
            email="admin@3.com",
            username="admin3",
            password="password",
            role="ORDER_MANAGER"
        ),
        Admin(
            name="Admin 4",
            email="admin@4.com",
            username="admin4",
            password="password",
            role="PRODUCT_MANAGER"
        ),
    ]

    await Admin.insert_many(admins)

    yield

    await Admin.delete_all()

    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for admin'''
    return {
        "username": "test@admin.com",
        "password": "password"
    }


class TestAdminGet:
    '''Tests for admin get routes'''
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
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_admin_get_all(self, login_admin):
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
                "/api/admin/admincrud",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_admin_get_all_invalid_sort_by(self, login_admin):
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
                "/api/admin/admincrud?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            print(response.json()[
                "detail"][0]["msg"])
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'username', 'email', 'name' or 'date'"

    @pytest.mark.asyncio
    async def test_admin_get_all_invalid_sort_order(self, login_admin):
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
                "/api/admin/admincrud?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            print(response.json()[
                "detail"][0]["msg"])
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_admin_get_all_invalid_skip(self, login_admin):
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
                "/api/admin/admincrud?skip=-1",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "skip" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 0"

    @pytest.mark.asyncio
    async def test_admin_get_all_invalid_limit(self, login_admin):
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
                "/api/admin/admincrud?limit=-1",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "limit" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"

    @pytest.mark.asyncio
    async def test_admin_get_all_invalid_role(self, login_admin):
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
                "/api/admin/admincrud?role=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "role" in response.json()["detail"][0]["loc"]
            print(response.json()[
                "detail"][0]["msg"])
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'ADMIN', 'ORDER_MANAGER' or 'PRODUCT_MANAGER'"

    @pytest.mark.asyncio
    async def test_admin_get_all_valid_role(self, login_admin):
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
                "/api/admin/admincrud?role=ORDER_MANAGER",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200
            for admin in response.json():
                assert admin["role"] == "ORDER_MANAGER"


class TestAdminGetById:
    '''Tests for admin get routes'''
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
            assert response.status_code == 200
            response_data = response.json()
            access_token = response_data["access_token"]
            cookies = response.cookies
            refresh_token = cookies.get(settings.ADMIN_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_get_admin_by_invalid_id(self, login_admin):
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
                "/api/admin/admincrud/invalid-id",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 400
            assert response.json()["detail"] == "Invalid admin ID"

    @pytest.mark.asyncio
    async def test_get_admin_by_id_not_found(self, login_admin):
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
                "/api/admin/admincrud/5f9b698a2e67e032c8472325",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Admin not found"
