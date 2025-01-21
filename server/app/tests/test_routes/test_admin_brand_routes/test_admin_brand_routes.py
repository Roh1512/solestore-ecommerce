import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.model.brand_models import Brand
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from beanie import PydanticObjectId

from app.config.env_settings import settings
from app.admin_app.admin_models.admin import Admin, AdminResponse
from app.admin_app.admin_crud_operations.admin_crud import create_admin


@pytest_asyncio.fixture(
    autouse=True,
    scope="function",
    loop_scope="function"
)
async def setup_bd():
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI
    )
    print(await client.server_info())
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[Admin, Brand]
    )

    await Admin.delete_all()
    await create_admin({
        "username": "testadmin",
        "email": "testadmin@123.com",
        "password": "password",
        "name": "Test Admin"
    })

    await Brand.delete_all()

    yield

    await Admin.delete_all()
    await Brand.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info():
    '''Login info for admin'''
    return {
        "username": "testadmin",
        "password": "password"
    }


class TestAdminBrandCreate:
    '''Test Admin routes to create a brand'''

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
    async def test_brand_create(self, login_admin):
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
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new"
                }
            )
            response_data = response.json()
            print("RES", response_data)
            assert response.status_code == 201
            brand_details = Brand(**response_data)
            assert isinstance(brand_details, Brand)

    @pytest.mark.asyncio
    async def test_brand_create_no_value(self, login_admin):
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
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
            )
            response_data = response.json()
            assert response.status_code == 422
            assert response_data["detail"][0]["msg"] == "Field required"
            assert "body" in response_data['detail'][0]["loc"]

            response_2 = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={}
            )
            response_2_data = response_2.json()
            assert response_2.status_code == 422
            assert "title" in response_2_data["detail"][0]["loc"]
            assert response_2_data["detail"][0]["msg"] == "Field required"

            response_3 = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": ""
                }
            )
            response_3_data = response_3.json()
            assert response_3.status_code == 422
            assert "title" in response_3_data["detail"][0]["loc"]
            print(response_3_data)
            assert response_3_data["detail"][0]["msg"] == "Value error, Brand title is required"

    @pytest.mark.asyncio
    async def test_brand_create_duplicate(self, login_admin):
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

            create_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "duplicate"
                }
            )
            assert create_brand.status_code == 201

            duplicate_res = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "duplicate"
                }
            )
            duplicate_data = duplicate_res.json()
            assert duplicate_res.status_code == 400
            assert duplicate_data["detail"] == "Brand already exists"


class TestAdminBrandEdit:
    '''Test Admin brand edit'''
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
    async def test_brand_edit(self, login_admin):
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

            new_brand_1 = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "brand_1"
                }
            )
            brand_1_id = new_brand_1.json()["id"]
            assert new_brand_1.status_code == 201

            update_response = await client.put(
                f"/api/admin/brand/{brand_1_id}",
                headers=auth_headers,
                follow_redirects=True,
                json={
                    "title": "brand_2"
                }
            )

            update_data = update_response.json()
            assert update_response.status_code == 200
            assert update_data["title"] == "brand_2"
            assert update_data["updated_at"] != new_brand_1.json()[
                "updated_at"]

    @pytest.mark.asyncio
    async def test_brand_edit_duplicate_title(self, login_admin):
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

            brand_1 = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "brand_1"
                }
            )
            assert brand_1.status_code == 201

            brand_2 = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "brand_2"
                }
            )
            assert brand_2.status_code == 201

            brand_1_data = brand_1.json()
            brand_2_data = brand_2.json()

            update_response = await client.put(
                f"/api/admin/brand/{brand_1_data["id"]}",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": brand_2_data["title"]
                }
            )
            assert update_response.status_code == 400
            assert update_response.json()["detail"] == "Brand already exists"

    @pytest.mark.asyncio
    async def test_brand_edit_no_value(self, login_admin):
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

            new_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new brand"
                }
            )
            assert new_brand.status_code == 201

            update_1 = await client.put(
                f"/api/admin/brand/{new_brand.json()["id"]}",
                follow_redirects=True,
                headers=auth_headers
            )  # No json data
            assert update_1.status_code == 422
            assert "Field required" in update_1.json()["detail"][0]["msg"]
            assert "body" in update_1.json()["detail"][0]["loc"]
            assert "title" not in update_1.json()["detail"][0]["loc"]

    @pytest.mark.asyncio
    async def test_brand_edit_no_title(self, login_admin):
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

            new_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new brand"
                }
            )
            assert new_brand.status_code == 201

            update_1 = await client.put(
                f"/api/admin/brand/{new_brand.json()["id"]}",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": ""
                }
            )  # No title
            assert update_1.status_code == 422
            assert "Value error, Brand title is required" in update_1.json()[
                "detail"][0]["msg"]
            assert "body" in update_1.json()["detail"][0]["loc"]
            assert "title" in update_1.json()["detail"][0]["loc"]

    @pytest.mark.asyncio
    async def test_brand_edit_invalid_id(self, login_admin):
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

            new_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new brand"
                }
            )
            assert new_brand.status_code == 201

            update_1 = await client.put(
                "/api/admin/brand/invalid",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "qwe"
                }
            )  # No title
            assert update_1.status_code == 400
            assert update_1.json()["detail"] == "Invalid brand ID"

    @pytest.mark.asyncio
    async def test_brand_edit_non_existing_brand(self, login_admin):
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

            new_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new brand"
                }
            )
            assert new_brand.status_code == 201

            update_1 = await client.put(
                "/api/admin/brand/678e82b60e5b2bf178b6bdf0",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "qwe"
                }
            )  # No title
            assert update_1.status_code == 404
            assert update_1.json()["detail"] == "Brand not found"


class TestAdminBrandDelete:
    '''Test Admin brand deletd'''
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
    async def delete_brand(self, login_admin):
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
            add_brand = await client.post(
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers,
                json={
                    "title": "new brand"
                }
            )
            assert add_brand.status_code == 201

            brand_id = add_brand.json()["id"]

            delete_res = await client.delete(
                f"/api/admin/brand/{str(brand_id)}",
                headers=auth_headers,
                follow_redirects=True,
            )
            assert delete_res.status_code == 200
            assert delete_res.json()["message"] == "Brand deleted"

    @pytest.mark.asyncio
    async def delete_brand_invalid_id(self, login_admin):
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

            delete_res = await client.delete(
                "/api/admin/brand/invalid_id",
                headers=auth_headers,
                follow_redirects=True,
            )
            assert delete_res.status_code == 400
            assert delete_res.json()["detail"] == "Invalid brand ID"

    @pytest.mark.asyncio
    async def delete_brand_not_found(self, login_admin):
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

            delete_res = await client.delete(
                "/api/admin/brand/678e97571c76250786630c0e",
                headers=auth_headers,
                follow_redirects=True,
            )
            assert delete_res.status_code == 400
            assert delete_res.json()["detail"] == "Brand not found"


class TestAdminBrandGet:
    '''Test Admin brand deletd'''
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
    async def test_brand_get(self, login_admin):
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
                "/api/admin/brand",
                follow_redirects=True,
                headers=auth_headers
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_admin_brand_invalid_sort_by(self, login_admin):
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
                "/api/admin/brand?sort_by=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            print(response.json())
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_by" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'title' or 'date'"

    @pytest.mark.asyncio
    async def test_admin_brand_invalid_sort_order(self, login_admin):
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
                "/api/admin/brand?sort_order=invalid",
                follow_redirects=True,
                headers=auth_headers
            )
            print(response.json())
            assert response.status_code == 422
            assert "query" in response.json()["detail"][0]["loc"]
            assert "sort_order" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be 'desc' or 'asc'"

    @pytest.mark.asyncio
    async def test_admin_brand_invalid_skip(self, login_admin):
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
                "/api/admin/brand?skip=-1",
                follow_redirects=True,
                headers=auth_headers
            )

            print(response.json())
            assert "query" in response.json()["detail"][0]["loc"]
            assert "skip" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 0"

    @pytest.mark.asyncio
    async def test_admin_brand_invalid_limit(self, login_admin):
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
                "/api/admin/brand?limit=-1",
                follow_redirects=True,
                headers=auth_headers
            )

            print(response.json())
            assert "query" in response.json()["detail"][0]["loc"]
            assert "limit" in response.json()["detail"][0]["loc"]
            assert response.json()[
                "detail"][0]["msg"] == "Input should be greater than or equal to 1"
