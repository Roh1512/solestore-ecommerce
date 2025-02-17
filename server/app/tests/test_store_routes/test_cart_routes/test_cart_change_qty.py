'''Test change quantity from cart '''

import pytest
from httpx import AsyncClient, ASGITransport
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import pytest_asyncio

from app.config.env_settings import settings
from app.main import app
from app.model.category_model import Category
from app.model.brand_models import Brand
from app.model.product_models import Product
from app.model.user import User
from app.model.cart_models import ProductInCart
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
        document_models=[User, Category, Brand, Product, ProductInCart]
    )

    await User.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    await create_user({
        "username": "testuser",
        "email": "testuser@123.com",
        "password": "password",
        "name": "Test User"
    })

    await Category.delete_all()
    categories = await Category.insert_many([
        Category(title="Category 1"),
        Category(title="Category 2"),
        Category(title="Category 3"),
        Category(title="Category 4"),
        Category(title="Category 5"),
        Category(title="Category 6"),
        Category(title="Category 7"),
    ])

    categories = await Category.find().to_list()

    await Brand.insert_many([
        Brand(title="Brand1"),
        Brand(title="Brand2"),
        Brand(title="Brand3"),
    ])
    brands = await Brand.find().to_list()

    products = [
        Product(
            title="Product1",
            description="Description of product",
            price=22.99,
            category=categories[0],
            brand=brands[0],
            sizes=[{
                "size": 10,
                "stock": 10
            },
                {
                "size": 11,
                "stock": 10
            },
                {
                "size": 12,
                "stock": 13
            },]
        ),
        Product(
            title="Product2",
            description="Description of product",
            price=302.99,
            category=categories[1],
            brand=brands[1],
            sizes=[{
                "size": 10,
                "stock": 10
            },
                {
                "size": 11,
                "stock": 10
            },
                {
                "size": 12,
                "stock": 13
            },]
        )
    ]

    await Product.insert_many(products)

    yield

    await User.delete_all()
    await Category.delete_all()
    await Brand.delete_all()
    await Product.delete_all()
    client.close()


@pytest_asyncio.fixture(scope="function", loop_scope="function", autouse=True)
def login_info():
    '''Login info for user'''
    return {
        "username": "testuser@123.com",
        "password": "password"
    }


class TestChangeQtyCart:
    '''Test change quantity of item in cart'''
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
            print(response_data)
            cookies = response.cookies
            refresh_token = cookies.get(settings.USER_REFRESH_COOKIE_NAME)
            return {"access_token": access_token, "refresh_token": refresh_token}

    @pytest.mark.asyncio
    async def test_change_qty_success(self, login_user):
        '''Test Change qty Success'''
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

            prducts_res = await client.get(
                "/api/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert prducts_res.status_code == 200
            products = prducts_res.json()

            product_id = str(products[0]["id"])

            add_to_cart_res = await client.post(
                "/api/cart/add",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 3,
                    "size": 10
                }
            )
            assert add_to_cart_res.status_code == 201

            added_item = add_to_cart_res.json()

            change_res = await client.put(
                f"/api/cart/{str(added_item["id"])}/change-quantity",
                headers=auth_headers,
                json={
                    "product_id": str(product_id),
                    "quantity": 2,
                    "size": 10
                }
            )
            assert change_res.status_code == 200
            changed_item = change_res.json()
            assert changed_item["quantity"] == 5

            cart_res = await client.get(
                "/api/cart/",
                headers=auth_headers,
                follow_redirects=True
            )
            assert cart_res.status_code == 200

            cart_items = cart_res.json()

            assert len(cart_items["items"]) == 1
            assert cart_items["items"][0]["quantity"] == 5

    @pytest.mark.asyncio
    async def test_change_qty_decrease_success(self, login_user):
        '''Test Change qty decrease Success'''
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

            prducts_res = await client.get(
                "/api/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert prducts_res.status_code == 200
            products = prducts_res.json()

            product_id = str(products[0]["id"])

            add_to_cart_res = await client.post(
                "/api/cart/add",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 5,
                    "size": 10
                }
            )
            assert add_to_cart_res.status_code == 201

            added_item = add_to_cart_res.json()

            change_res = await client.put(
                f"/api/cart/{str(added_item["id"])}/change-quantity",
                headers=auth_headers,
                json={
                    "product_id": str(product_id),
                    "quantity": -2,
                    "size": 10
                }
            )
            assert change_res.status_code == 200
            changed_item = change_res.json()
            assert changed_item["quantity"] == 3

            cart_res = await client.get(
                "/api/cart/",
                headers=auth_headers,
                follow_redirects=True
            )
            assert cart_res.status_code == 200

            cart_items = cart_res.json()

            assert len(cart_items["items"]) == 1
            assert cart_items["items"][0]["quantity"] == 3

    @pytest.mark.asyncio
    async def test_change_qty_decrease_lt_0(self, login_user):
        '''Test Change qty decrease less than 0'''
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

            prducts_res = await client.get(
                "/api/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert prducts_res.status_code == 200
            products = prducts_res.json()

            product_id = str(products[0]["id"])

            add_to_cart_res = await client.post(
                "/api/cart/add",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 5,
                    "size": 10
                }
            )
            assert add_to_cart_res.status_code == 201

            added_item = add_to_cart_res.json()

            change_res = await client.put(
                f"/api/cart/{str(added_item["id"])}/change-quantity",
                headers=auth_headers,
                json={
                    "product_id": str(product_id),
                    "quantity": -200,
                    "size": 10
                }
            )
            assert change_res.status_code == 400
            assert change_res.json()[
                "detail"] == "You have only 10 pieces in cart"

    @pytest.mark.asyncio
    async def test_change_qty_not_enough_stock(self, login_user):
        '''Test Change qty not enough stock'''
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

            prducts_res = await client.get(
                "/api/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert prducts_res.status_code == 200
            products = prducts_res.json()

            product_id = str(products[0]["id"])

            add_to_cart_res = await client.post(
                "/api/cart/add",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 5,
                    "size": 10
                }
            )
            assert add_to_cart_res.status_code == 201

            added_item = add_to_cart_res.json()

            change_res = await client.put(
                f"/api/cart/{str(added_item["id"])}/change-quantity",
                headers=auth_headers,
                json={
                    "product_id": str(product_id),
                    "quantity": 2000,
                    "size": 10
                }
            )
            assert change_res.status_code == 400
            print(change_res.json()["detail"])
            assert change_res.json()[
                "detail"] == "Insufficient stock to add 2000 more. Available additional stock: 5"

    @pytest.mark.asyncio
    async def test_change_qty_size_mismatch(self, login_user):
        '''Test Change qty not enough stock'''
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

            prducts_res = await client.get(
                "/api/product",
                headers=auth_headers,
                follow_redirects=True
            )
            assert prducts_res.status_code == 200
            products = prducts_res.json()

            product_id = str(products[0]["id"])

            add_to_cart_res = await client.post(
                "/api/cart/add",
                headers=auth_headers,
                json={
                    "product_id": product_id,
                    "quantity": 5,
                    "size": 10
                }
            )
            assert add_to_cart_res.status_code == 201

            added_item = add_to_cart_res.json()

            change_res = await client.put(
                f"/api/cart/{str(added_item["id"])}/change-quantity",
                headers=auth_headers,
                json={
                    "product_id": str(product_id),
                    "quantity": 3,
                    "size": 11
                }
            )
            assert change_res.status_code == 400
            print(change_res.json()["detail"])
            assert change_res.json()[
                "detail"] == "Given size 11 is not the selected size"
