'''Product ADMIN CRUD Operations'''

from pprint import pformat
from asyncio import gather  # For concurrent fetching of multiple end points
from datetime import datetime, timezone

from fastapi import HTTPException, status, UploadFile
from pydantic import ValidationError
from bson import ObjectId
from beanie import PydanticObjectId, WriteRules
from beanie.operators import And

from pymongo.errors import DuplicateKeyError, PyMongoError

from pymongo.results import DeleteResult

from app.utilities.cloudinary_utils import update_profile_image, delete_image_from_cloudinary

from app.model.product_models import Product, ProductCreateRequest, ProductResponse, ProductDetailsRequest, Image, ProductSizeStockRequest
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


async def delete_images_product(product_id: str, public_ids: list[str]):
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        print(f"Deleting images with public_ids: {public_ids}")

        # Delete images from Cloudinary concurrently
        deletion_tasks = [delete_image_from_cloudinary(
            public_id) for public_id in public_ids]
        deletion_results = await gather(*deletion_tasks, return_exceptions=True)
        for result in deletion_results:
            if isinstance(result, Exception):
                print("Deletion task error:", result)
            else:
                print("Deletion task success:", result)

        # Update product's images list by filtering out images with matching public_ids
        original_count = len(product.images)
        product.images = [
            img for img in product.images if img.public_id not in public_ids]
        updated_count = len(product.images)
        print(
            f"Images before deletion: {original_count}, after deletion: {updated_count}")

        await product.save()
        await product.fetch_all_links()

        return ProductResponse.from_mongo(product)

    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def update_product_details(product_data: ProductDetailsRequest, product_id: str):
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid product ID"
            )

        product = await Product.get(PydanticObjectId(product_id))

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        update_data = product_data.model_dump(exclude_unset=True)

        if product_data.brand:
            brand = await Brand.get(PydanticObjectId(product_data.brand))
            if not brand:
                raise HTTPException(
                    status_code=404, detail="Brand not found")
            if brand:
                update_data["brand"] = brand

        if product_data.category:
            category = await Category.get(PydanticObjectId(product_data.category))
            if not category:
                raise HTTPException(
                    status_code=404, detail="Category not found")
            if category:
                update_data["category"] = category

        for key, value in update_data.items():
            setattr(product, key, value)
        product.updated_at = datetime.now(timezone.utc)
        await product.save()
        await product.fetch_all_links()

        return ProductResponse.from_mongo(product)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.errors()
        ) from e
    except HTTPException as e:
        print(f"Error editing product: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def update_product_sizes(product_id: str, size_data: ProductSizeStockRequest):
    '''Function to update product size and stock'''
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")

        product = await Product.get(PydanticObjectId(product_id))
        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        # Update the sizes: for each size in the request, update the stock if it exists,
        # otherwise append it to the product's sizes list.
        for new_size in size_data.sizes:
            updated = False
            for existing_size in product.sizes:
                if existing_size.size == new_size.size:
                    existing_size.stock = new_size.stock
                    updated = True
                    break
            if not updated:
                product.sizes.append(new_size)

        product.updated_at = datetime.now(timezone.utc)
        await product.save()
        await product.fetch_all_links()
        return ProductResponse.from_mongo(product)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.errors()
        ) from e


async def delete_single_product(product_id: str) -> ProductResponse:
    # Validate product ID
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=400, detail=f"Invalid product ID: {product_id}")

        # Fetch the product document
        product = await Product.get(PydanticObjectId(product_id), fetch_links=True)
        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product not found: {product_id}")

        # Delete all associated images concurrently from Cloudinary.
        # Each image deletion is an independent async task.
        deletion_tasks = [delete_image_from_cloudinary(
            image.public_id) for image in product.images]
        await gather(*deletion_tasks)

        # Optionally, store the product data (if you want to return it) before deletion.
        product_data = ProductResponse.from_mongo(product)

        # Delete the product document from the database.
        await product.delete()

        return product_data
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def delete_products(product_ids: list[str]) -> list[ProductResponse]:
    """
    Delete products whose IDs are in the provided list.
    For each product, delete the associated images concurrently,
    then delete the product document.
    Returns a list of ProductResponse objects representing the deleted products.
    """
    try:
        # Create a list of deletion tasks for each product ID.
        deletion_tasks = [delete_single_product(pid) for pid in product_ids]
        # Run all deletions concurrently without blocking the thread.
        deleted_products = await gather(*deletion_tasks)
        return deleted_products

    except PyMongoError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}") from e
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
