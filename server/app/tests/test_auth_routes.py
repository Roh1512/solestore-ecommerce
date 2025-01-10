import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.model.user import User
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio
from beanie import PydanticObjectId

from app.config.env_settings import settings
from app.crud.user_crud import create_user


@pytest_asyncio.fixture(autouse=True, scope="function", loop_scope="function")
async def setup_db():
    # Setup test database
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.MONGODB_URI)
    print(await client.server_info())
    await init_beanie(database=client[settings.DATABASE_TESTING], document_models=[User])

    # Clear users collection before each test
    await User.delete_all()

    yield

    # Cleanup after test
    await User.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def valid_user():
    return {
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User",
        "address": "123 Main St",
        "phone": "+1234567890"
    }


@pytest_asyncio.fixture(scope="function", loop_scope="function")
def duplicate_user():
    return {
        "username": "duplicateuser",
        "email": "duplicate@123.com",
        "password": "password"
    }


@pytest.mark.asyncio
async def test_register_user_success(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=valid_user)

        # Add debug print statements
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")

        assert response.status_code == 201
        response_data = response.json()
        assert response_data["email"] == valid_user["email"]
        assert response_data["username"] == valid_user["username"]
        assert "password" not in response_data  # Make sure password isn't returned


@pytest.mark.asyncio
async def test_register_user_duplicate_email(duplicate_user):
    # Insert a user with the same username
    await User(**duplicate_user).create()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=duplicate_user)

        assert response.status_code == 400
        response_data = response.json()
        assert response_data["detail"] == "User already exists"


@pytest.mark.asyncio
async def test_register_user_duplicate_username(duplicate_user):
    await User(**duplicate_user).create()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=duplicate_user)
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["detail"] == "User already exists"


@pytest.mark.asyncio
async def test_register_invalid_email(valid_user):
    valid_user["email"] = "invalidemail"  # Set an invalid email
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=valid_user)

        assert response.status_code == 422
        assert "value is not a valid email address" in response.json()[
            "detail"][0]["msg"]


@pytest.mark.asyncio
async def test_register_missing_fields():
    incomplete_user = {"username": "someusername"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=incomplete_user)

        assert response.status_code == 422
        for field in response.json()["detail"]:
            assert "Field required" in field["msg"]


@pytest.mark.asyncio
async def test_register_extra_fields(valid_user):
    valid_user["extra_field"] = "extra"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/register", json=valid_user)

        assert response.status_code == 422
        assert "Extra inputs are not permitted" in response.json()[
            "detail"][0]["msg"]


# Testing login route

@pytest.mark.asyncio
async def test_login_success(valid_user):
    # Create a user
    user_details = valid_user.copy()
    await create_user(valid_user)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", data={"username": user_details["username"], "password": user_details["password"]})

        assert response.status_code == 200
        response_data = response.json()
        response_cookie = response.cookies
        assert "access_token" in response_data
        assert settings.USER_REFRESH_COOKIE_NAME in response_cookie


@pytest.mark.asyncio
async def test_login_user_not_found(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", data={"username": valid_user["username"], "password": valid_user["password"]})

        assert response.status_code == 404
        response_data = response.json()
        assert response_data["detail"] == "User not found"


@pytest.mark.asyncio
async def test_login_incorrect_password(valid_user):
    await create_user(valid_user)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", data={"username": valid_user["username"], "password": "incorrectpassword"})

        assert response.status_code == 401
        response_data = response.json()
        assert response_data["detail"] == "Incorrect email or password"


@pytest.mark.asyncio
async def test_login_missing_fields(valid_user):
    incomplete_user_details = {"username": valid_user["username"]}
    await create_user(valid_user)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/auth/login", json=incomplete_user_details)

        assert response.status_code == 422
        for field in response.json()["detail"]:
            assert "Field required" in field["msg"]
            assert "username" in field["loc"] or "password" in field["loc"]


# check_auth testing
@pytest.mark.asyncio
async def test_check_auth_success(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)
        login_response_cookies = login_response.cookies
        assert login_response.status_code == 200
        assert settings.USER_REFRESH_COOKIE_NAME in login_response_cookies
        access_token = login_response.json()["access_token"]
        refresh_token = login_response.cookies.get(
            settings.USER_REFRESH_COOKIE_NAME)
        assert refresh_token is not None
        headers = {"Authorization": f"Bearer {access_token}"}
        auth_response = await client.get("/api/auth/checkauth", headers=headers)
        assert auth_response.status_code == 200
        auth_data = auth_response.json()
        assert auth_data["status"] == "authenticated"
        assert auth_data["user"]["email"] == valid_user["email"]


@pytest.mark.asyncio
async def test_check_auth_without_refresh_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)
        login_response_cookies = login_response.cookies
        access_token = login_response.json()["access_token"]
        assert login_response.status_code == 200
        assert settings.USER_REFRESH_COOKIE_NAME in login_response_cookies

        client.cookies.pop(settings.USER_REFRESH_COOKIE_NAME)
        headers = {"Authorization": f"Bearer {access_token}"}
        auth_response = await client.get("/api/auth/checkauth", headers=headers)
        assert auth_response.status_code == 401
        assert auth_response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_check_auth_without_access_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)
        login_response_cookies = login_response.cookies
        assert login_response.status_code == 200
        assert settings.USER_REFRESH_COOKIE_NAME in login_response_cookies
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()

        headers = {"Authorization": f"Bearer"}
        auth_response = await client.get("/api/auth/checkauth", headers=headers)
        assert auth_response.status_code == 401
        assert auth_response.json(
        )["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_check_auth_invalid_access_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)
        login_response_cookies = login_response.cookies
        assert login_response.status_code == 200
        assert settings.USER_REFRESH_COOKIE_NAME in login_response_cookies
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()

        headers = {"Authorization": "Bearer Invalid_Access_Token"}
        auth_response = await client.get("/api/auth/checkauth", headers=headers)
        assert auth_response.status_code == 401
        assert auth_response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_check_auth_invalid_refresh_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)
        login_response_cookies = login_response.cookies
        print("Login Data: ", login_response.json())
        access_token = login_response.json()["access_token"]
        assert login_response.status_code == 200
        assert settings.USER_REFRESH_COOKIE_NAME in login_response_cookies

        client.cookies.set(settings.USER_REFRESH_COOKIE_NAME, "invalid_token")
        headers = {"Authorization": f"Bearer {access_token}"}
        auth_response = await client.get("/api/auth/checkauth", headers=headers)
        assert auth_response.status_code == 401
        assert auth_response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_check_auth_refresh_token_reuse(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        added_user = await create_user(valid_user)
        login_data = {
            "username": valid_user["username"], "password": "password"}
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        cookies = login_response.cookies
        access_token = tokens.get("access_token")
        refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        assert access_token is not None
        assert refresh_token is not None

        # Clear the user's refresh_tokens array
        user_to_update = await User.get(PydanticObjectId(added_user["id"]))
        if user_to_update:
            user_to_update.refresh_tokens = []
            await user_to_update.save()

        auth_response = await client.get("/api/auth/checkauth", headers={"Authorization": f"Bearer {access_token}"})

        assert auth_response.status_code == 401  # Unauthorized
        assert auth_response.json() == {
            "detail": "Unauthorized"}


@pytest.mark.asyncio
async def test_refresh_token_route(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": "password"}
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        cookies = login_response.cookies
        access_token = tokens.get("access_token")
        refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        assert access_token is not None
        assert refresh_token is not None

        refresh_response = await client.post("/api/auth/refresh")
        assert refresh_response.status_code == 200
        refresh_response_data = refresh_response.json()
        print("Refresh response: ", refresh_response_data)
        refresh_response_cookies = refresh_response.cookies
        new_access_token = refresh_response_data.get("access_token")
        new_refresh_token = refresh_response_cookies.get(
            settings.USER_REFRESH_COOKIE_NAME)
        assert new_access_token is not None
        assert new_refresh_token is not None


@pytest.mark.asyncio
async def test_refresh_token_route_without_refresh_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": "password"}
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        cookies = login_response.cookies
        access_token = tokens.get("access_token")
        refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        assert access_token is not None
        assert refresh_token is not None

        client.cookies.pop(settings.USER_REFRESH_COOKIE_NAME)
        refresh_response = await client.post("/api/auth/refresh")
        refresh_response_data = refresh_response.json()
        assert refresh_response.status_code == 401
        assert refresh_response_data["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_refresh_token_route_invalid_refresh_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": "password"}
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        cookies = login_response.cookies
        access_token = tokens.get("access_token")
        refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        assert access_token is not None
        assert refresh_token is not None

        client.cookies.set(settings.USER_REFRESH_COOKIE_NAME,
                           "Invalid_Refresh_Token")
        refresh_response = await client.post("/api/auth/refresh")
        refresh_response_data = refresh_response.json()
        assert refresh_response.status_code == 401
        assert refresh_response_data["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_refresh_token_route_refresh_token_reuse(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        added_user = await create_user(valid_user)
        login_data = {
            "username": valid_user["username"], "password": "password"}
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        tokens = login_response.json()
        cookies = login_response.cookies
        access_token = tokens.get("access_token")
        refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
        assert access_token is not None
        assert refresh_token is not None

        user_to_update = await User.get(PydanticObjectId(added_user["id"]))
        if user_to_update:
            user_to_update.refresh_tokens = []
            await user_to_update.save()
        refresh_response = await client.post("/api/auth/refresh")
        refresh_response_data = refresh_response.json()
        assert refresh_response.status_code == 401
        assert refresh_response_data["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_logout_success(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register and login user
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)

        assert login_response.status_code == 200
        access_token = login_response.json().get("access_token")
        assert "access_token" in login_response.json()
        assert settings.USER_REFRESH_COOKIE_NAME in login_response.cookies

        headers = {"Authorization": f"Bearer {access_token}"}
        # Logout
        logout_response = await client.post("/api/auth/logout", headers=headers)
        assert logout_response.status_code == 200
        assert logout_response.json()["message"] == "Logged out"

        # Ensure tokens are cleared
        assert settings.USER_REFRESH_COOKIE_NAME not in client.cookies


@pytest.mark.asyncio
async def test_logout_without_authentication():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Attempt to logout without being logged in
        logout_response = await client.post("/api/auth/logout")

        assert logout_response.status_code == 401
        assert logout_response.json()["detail"] == "Not authenticated"


@pytest.mark.asyncio
async def test_logout_with_invalid_refresh_token(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register and login user
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)

        assert login_response.status_code == 200
        access_token = login_response.json().get("access_token")
        assert access_token is not None
        assert settings.USER_REFRESH_COOKIE_NAME in login_response.cookies

        headers = {"Authorization": f"Bearer {access_token}"}
        # Set an invalid refresh token
        client.cookies.set(
            settings.USER_REFRESH_COOKIE_NAME,
            "invalid_refresh_token"
        )
        logout_response = await client.post("/api/auth/logout", headers=headers)

        assert logout_response.status_code == 401
        assert logout_response.json()["detail"] == "Unauthorized"


@pytest.mark.asyncio
async def test_logoutall_success(valid_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register and login user
        await client.post("/api/auth/register", json=valid_user)
        login_data = {
            "username": valid_user["username"], "password": valid_user["password"]}
        login_response = await client.post("/api/auth/login", data=login_data)

        assert login_response.status_code == 200
        access_token = login_response.json().get("access_token")
        assert settings.USER_REFRESH_COOKIE_NAME in login_response.cookies
        assert access_token is not None

        headers = {"Authorization": f"Bearer {access_token}"}

        logoutall_response = await client.post("/api/auth/logoutall", headers=headers)
        assert logoutall_response.status_code == 200
        assert logoutall_response.json(
        )["message"] == "Logged out of all devices"


@pytest.mark.asyncio
async def test_logoutall_success_without_authentication():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Attempt to logout without being logged in
        logoutall_response = await client.post("/api/auth/logoutall")

        assert logoutall_response.status_code == 401
        assert logoutall_response.json()["detail"] == "Not authenticated"
