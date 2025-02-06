'''Product ADMIN CRUD Operations'''

from asyncio import gather  # For concurrent fetching of multiple end points

from fastapi import HTTPException, status
from pydantic import ValidationError
from bson import ObjectId
from beanie import PydanticObjectId, WriteRules
from beanie.operators import And

from pymongo.errors import DuplicateKeyError
from pymongo.results import DeleteResult

from app.model.product_models import Product, Size, ProductCreateRequest, ProductResponse

from app.model.brand_models import Brand
from app.model.category_model import Category


async def add_product(product_data: ProductCreateRequest):
    '''Function to add a product'''
    try:

        brand, category = await gather(
            Brand.get(PydanticObjectId(product_data.brand)),
            Category.get(PydanticObjectId(product_data.category))
        )

        if not brand:
            raise HTTPException(
                status_code=404, detail="Brand not found")
        if not category:
            raise HTTPException(
                status_code=404, detail="Category not found")

        product_data.brand = brand
        product_data.category = category

        product = Product(**product_data.model_dump())
        inserted_product = await product.insert()

        # Fetch with populated links

        # Ensure all linked fields are populated
        await inserted_product.fetch_all_links()

        print(inserted_product)

        return ProductResponse.from_mongo(inserted_product)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors()) from e
