'''Test admin category edit'''
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
async def setup_bd():
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
        "username": "testadmin",
        "email": "testadmin@123.com",
        "password": "password",
        "name": "Test Admin"
    })

    await Category.delete_all()
    categories = [
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
    ]
    await Category.insert_many(categories)

    yield

    await Admin.delete_all()
    await Category.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for admin'''
    return {
        "username": "testadmin@123.com",
        "password": "password"
    }


class TestAdminCategoryEdit:
    '''Test admin category edit'''
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
    async def test_admin_category_edit(self, login_admin):
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

            new_category = await client.post(
                "/api/admin/category",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new_category"
                }
            )
            assert new_category.status_code == 201

            new_category_id = str(new_category.json()["id"])

            update_category = await client.put(
                f"/api/admin/category/{new_category_id}",
                headers=auth_headers,
                follow_redirects=True,
                json={
                    "title": "New Category"
                }
            )
            assert update_category.status_code == 200
            update_data = update_category.json()
            assert update_data["title"] == "New Category"
            assert update_data["updated_at"] != new_category.json()[
                "updated_at"]

    @pytest.mark.asyncio
    async def test_admin_category_edit_duplicate(self, login_admin):
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

            new_category = await client.post(
                "/api/admin/category",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "Category 1"
                }
            )
            assert new_category.status_code == 400

            assert new_category.json()["detail"] == "Category already exists"

    @pytest.mark.asyncio
    async def test_admin_category_no_data(self, login_admin):
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

            new_category = await client.post(
                "/api/admin/category",
                follow_redirects=True,
                headers=auth_headers,
            )
            assert new_category.status_code == 422

            assert new_category.json()["detail"][0]["msg"] == "Field required"
            assert "body" in new_category.json()["detail"][0]["loc"]

    @pytest.mark.asyncio
    async def test_admin_category_no_title(self, login_admin):
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

            new_category = await client.post(
                "/api/admin/category",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": ""
                }
            )
            assert new_category.status_code == 422

            assert new_category.json(
            )["detail"][0]["msg"] == "Value error, Category title is required"
            assert "title" in new_category.json()["detail"][0]["loc"]
