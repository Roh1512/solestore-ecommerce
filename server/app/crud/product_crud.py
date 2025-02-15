'''Product crud for admin and shop app'''

from asyncio import gather  # For concurrent fetching of multiple end points

from bson import ObjectId

from fastapi import HTTPException
from beanie import PydanticObjectId

from app.model.product_models import Product, ProductResponse
from app.model.brand_models import Brand
from app.model.category_model import Category
from app.utilities.query_models import SortByProduct, SortOrder


async def get_products(
        search: str = None,
        page: int = 1,
        sort_by: SortByProduct = SortByProduct.DATE,
        sort_order: SortOrder = SortByProduct.PRICE,
        category: str = None,
        brand: str = None,
        size: int = None
):
    '''Function to get all products'''
    try:
        if category and not ObjectId.is_valid(category):
            raise HTTPException(
                status_code=400,
                detail="Invalid category ID"
            )
        if brand and not ObjectId.is_valid(brand):
            raise HTTPException(
                status_code=400,
                detail="Invalid brand ID"
            )

        brand_data = None
        category_data = None
        if brand or category:
            if brand and category:
                brand_data, category_data = await gather(
                    Brand.get(PydanticObjectId(brand)),
                    Category.get(PydanticObjectId(category))
                )
            elif brand:
                brand_data = await Brand.get(PydanticObjectId(brand))
                category_data = None
            elif category:
                brand_data = None
                category_data = await Category.get(PydanticObjectId(category))
            if brand and not brand_data:
                raise HTTPException(
                    status_code=404,
                    detail="Brand not found"
                )
            if category and not category_data:
                raise HTTPException(
                    status_code=404,
                    detail="Category not found"
                )

        query = {}
        if search:
            query["title"] = {"$regex": search, "$options": "i"}
        if brand_data:
            query["brand.$id"] = PydanticObjectId(brand)
        if category_data:
            query["category.$id"] = PydanticObjectId(category)
        if size:
            query["sizes"] = {"$elemMatch": {
                "size": size, "stock": {"$gt": 0}}}

        # Determine sort order
        order = -1 if sort_order == SortOrder.desc else 1

        # Validate sort_by field
        if sort_by not in ["date", "price"]:
            raise HTTPException(
                status_code=400, detail="Invalid sort_by field")
        if sort_by == "date":
            sort_by = "created_at"
        if sort_by == "price":
            sort_by = "price"

        limit = 15
        skip = (page - 1) * limit

        # Query products using Beanie's find API with sorting and pagination.
        products = (
            await Product.find(query)
            .sort((sort_by, order))
            .skip(skip)
            .limit(limit)
            .to_list()
        )

        # Populate all linked fields for each product concurrently
        await gather(*(product.fetch_all_links() for product in products))

        # Convert each product to a response model (assuming from_mongo handles conversion)
        product_responses = [ProductResponse.from_mongo(
            product) for product in products]
        return product_responses
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def get_product_by_id(product_id: str) -> ProductResponse:
    '''Function to fetch individual product by ID'''
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid product ID"
            )
        product = await Product.get(PydanticObjectId(product_id), fetch_links=True)

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )
        return ProductResponse.from_mongo(product)
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
