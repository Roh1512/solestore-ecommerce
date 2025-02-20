'''Mongo DB initialization'''

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config.env_settings import Settings, get_settings
from app.model.user import User
from app.admin_app.admin_models.admin import Admin
from app.model.brand_models import Brand
from app.model.category_model import Category
from app.model.product_models import Product
from app.model.cart_models import ProductInCart
from app.model.order_models import Order

settings: Settings = get_settings()

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.MONGODB_URI)
database = client[settings.DATABASE_NAME]


# Function to initialize Beanie with the database
async def init_db():
    '''Initialize database'''
    print("Initializing Beanie with the database")
    await init_beanie(
        database,
        document_models=[
            User,
            Admin,
            Brand,
            Category,
            Product,
            ProductInCart,
            Order
        ]
    )
