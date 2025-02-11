'''Product ADMIN CRUD Operations'''

from pprint import pformat
from asyncio import gather  # For concurrent fetching of multiple end points
from datetime import datetime, timezone

from fastapi import HTTPException, status, UploadFile
from pydantic import ValidationError
from bson import ObjectId
from beanie import PydanticObjectId, WriteRules
from beanie.operators import And

from pymongo.errors import DuplicateKeyError
from pymongo.results import DeleteResult

from app.utilities.cloudinary_utils import update_profile_image

from app.model.product_models import Product, Size, ProductCreateRequest, ProductResponse, ProductDetailsRequest, Image
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
        print(sort_by, sort_order)
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
        query = {}
        if search:
            query["title"] = {"$regex": search, "$options": "i"}
        if brand:
            query["brand"] = PydanticObjectId(brand)
        if category:
            query["category"] = PydanticObjectId(category)
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


async def add_product(product_data: ProductCreateRequest):
    '''Function to add a product'''
    try:

        if not ObjectId.is_valid(product_data.brand):
            raise HTTPException(
                status_code=400,
                detail="Invalid brand"
            )
        if not ObjectId.is_valid(product_data.category):
            raise HTTPException(
                status_code=400,
                detail="Invalid category"
            )

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

        product = Product(
            **product_data.model_dump(),
        )
        inserted_product = await product.insert()

        # Fetch with populated links

        # Ensure all linked fields are populated
        await inserted_product.fetch_all_links()

        print(pformat(inserted_product))

        return ProductResponse.from_mongo(inserted_product)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors()) from e


async def add_images_product(product_id: str, images: list[UploadFile]):
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product id")
        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        file_bytes_list = await gather(*(image.read() for image in images))

        folder = "solestore_ecommerce_app/products"

        # Upload images concurrently to Cloudinary - --
        upload_tasks = [update_profile_image(
            file_bytes, folder) for file_bytes in file_bytes_list]
        upload_results = await gather(*upload_tasks)

        new_images = []
        for result in upload_results:
            # Each result is assumed to be a dict with 'url' and 'public_id' keys.
            image_obj = Image(
                url=result.get("secure_url"),
                public_id=result.get("public_id")
            )
            new_images.append(image_obj)
        if product.images is None:
            product.images = []
        product.images.extend(new_images)

        await product.save()
        await product.fetch_all_links()
        return ProductResponse.from_mongo(product)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors()) from e


async def update_product_details(product_data: ProductDetailsRequest, product_id: str):
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid product id"
            )

        product = await Product.get(PydanticObjectId(product_id))

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

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

        update_data = product_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(product, key, value)
        product.updated_at = datetime.now(timezone.utc)
        await product.save()

        updated_product_dict = product.model_dump()
        updated_product_dict["id"] = str(product.id)
        return updated_product_dict
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["detail"]
        ) from e
    except HTTPException as e:
        print(f"Error editing product: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
