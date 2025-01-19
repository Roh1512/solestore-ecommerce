import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.model.user import User, UserResponse
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from app.config.env_settings import settings
from app.crud.user_crud import create_user


@pytest_asyncio.fixture(autouse=True, scope="function", loop_scope="function")
async def setup_db():
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI
    )
    print(await client.server_info())
    await init_beanie(
        database=client[settings.DATABASE_TESTING],
        document_models=[User]
    )

    await User.delete_all()
    await create_user({
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User"
    })

    yield

    await User.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info_username():
    return {
        "username": "testuser",
        "password": "password"
    }


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def login_info_email():
    return {
        "username": "testuser@123.com",
        "password": "password"
    }


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def update_profile_info():
    return {
        "name": "new_name",
    }


class TestProfileGet:
    @pytest.mark.asyncio
    async def test_profile_get(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Login request
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })

            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            # Profile request with debug info
            profile_response = await client.get(
                "/api/profile/",
                headers={"Authorization": f"Bearer {token}"},
                follow_redirects=True
            )

            profile_data = profile_response.json()
            user_details = UserResponse(**profile_data)
            assert profile_response.status_code == 200
            assert isinstance(user_details, UserResponse)
            assert "password" not in profile_data
            assert "refresh_tokens" not in profile_data

    @pytest.mark.asyncio
    async def test_profile_get_unauthorized(self):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            profile_response = await client.get(
                "/api/profile",
                headers={"Authorization": "Bearer "},
                follow_redirects=True
            )
            data = profile_response.json()
            print(f"Response status: {profile_response.status_code}")
            print(f"Response body: {data}")

            assert profile_response.status_code == 401


class TestUpdateProfile:
    @pytest.mark.asyncio
    async def test_update_profile_success(self, update_profile_info, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })

            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            update_profile_response = await client.put(
                "/api/profile",
                headers={"Authorization": f"Bearer {token}"}, json={
                    "profile_details": update_profile_info,
                    "current_password": "password"
                },
                follow_redirects=True
            )
            update_profile_data = update_profile_response.json()
            profile_details = UserResponse(**update_profile_data)
            assert isinstance(profile_details, UserResponse)
            assert update_profile_response.status_code == 200

    @pytest.mark.asyncio
    async def test_update_profile_incorrect_password(self, update_profile_info, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })

            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            update_profile_response = await client.put(
                "/api/profile",
                headers={"Authorization": f"Bearer {token}"}, json={
                    "profile_details": update_profile_info,
                    "current_password": "incorrect_password"
                },
                follow_redirects=True
            )
            update_profile_data = update_profile_response.json()
            print("Update response: ", update_profile_data)
            assert update_profile_response.status_code == 401
            assert update_profile_data["detail"] == "Incorrect password"

    @pytest.mark.asyncio
    async def test_update_profile_unauthorized(self, update_profile_info):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            update_profile_response = await client.put(
                "/api/profile",
                headers={"Authorization": "Bearer"}, json={
                    "profile_details": update_profile_info,
                    "current_password": "password"
                },
                follow_redirects=True
            )
            update_profile_data = update_profile_response.json()
            print("Update response: ", update_profile_data)
            assert update_profile_response.status_code == 401
            assert update_profile_data["detail"] == "Unauthorized"


class TestUpdateContactInfo:
    @pytest.mark.asyncio
    async def test_update_contact_info_success(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })
            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            contact_info_response = await client.put("/api/profile/update-contact-info", headers={"Authorization": f"Bearer {token}"}, json={
                "contact_info": {
                    "phone": "9012345678",
                    "address": "New address"
                },
                "current_password": "password"
            })
            contact_info_data = contact_info_response.json()
            profile_details = UserResponse(**contact_info_data)
            assert contact_info_response.status_code == 200
            assert isinstance(profile_details, UserResponse)

    @pytest.mark.asyncio
    async def test_update_contact_info_invalid_phone(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })
            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            contact_info_response = await client.put("/api/profile/update-contact-info", headers={"Authorization": f"Bearer {token}"}, json={
                "contact_info": {
                    "phone": "90123456",
                    "address": "New address"
                },
                "current_password": "password"
            })
            contact_info_data = contact_info_response.json()
            print("ContactInfo:", contact_info_data)
            assert contact_info_response.status_code == 422
            assert "phone" in contact_info_data["detail"][0]["loc"]

    @pytest.mark.asyncio
    async def test_update_contact_info_incorrect_password(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })
            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            contact_info_response = await client.put("/api/profile/update-contact-info", headers={"Authorization": f"Bearer {token}"}, json={
                "contact_info": {
                    "phone": "9012345622",
                    "address": "New address"
                },
                "current_password": "IncorrectPassword"
            })
            contact_info_data = contact_info_response.json()
            print("ContactInfo:", contact_info_data)
            assert contact_info_response.status_code == 401
            assert contact_info_data["detail"] == "Incorrect password"

    @pytest.mark.asyncio
    async def test_update_contact_info_unauthorized(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:

            contact_info_response = await client.put("/api/profile/update-contact-info", headers={"Authorization": f"Bearer "}, json={
                "contact_info": {
                    "phone": "90123456",
                    "address": "New address"
                },
                "current_password": "IncorrectPassword"
            })
            contact_info_data = contact_info_response.json()
            print("ContactInfo:", contact_info_data)
            assert contact_info_response.status_code == 401
            assert contact_info_data["detail"] == "Unauthorized"


class TestUpdateProfileImage:
    @pytest.mark.asyncio
    async def test_update_profile_image_without_file(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            login_response = await client.post("/api/auth/login", data={
                "username": login_info_username["username"],
                "password": login_info_username["password"]
            })
            token = login_response.json()["access_token"]
            assert token is not None
            assert login_response.status_code == 200

            update_profile_img_response = await client.post(
                "/api/profile/update-profile-img",
                headers={"Authorization": f"Bearer {token}"}
            )
            update_profile_img_data = update_profile_img_response.json()
            assert update_profile_img_response.status_code == 422
            assert "file" in update_profile_img_data["detail"][0]["loc"]

    @pytest.mark.asyncio
    async def test_update_profile_image_unauthorized(self, login_info_username):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            update_profile_img_response = await client.post(
                "/api/profile/update-profile-img",
                headers={"Authorization": f"Bearer"}
            )
            update_profile_img_data = update_profile_img_response.json()
            assert update_profile_img_response.status_code == 401
            assert update_profile_img_data["detail"] == "Unauthorized"
