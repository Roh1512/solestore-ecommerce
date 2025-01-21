'''Admin Brand crud functions'''
from app.model.brand_models import Brand, BrandCreateRequest
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError
from pydantic import ValidationError
from bson import ObjectId
from beanie import PydanticObjectId
from beanie.operators import And
from pymongo.results import DeleteResult


async def create_brand(brand_data: BrandCreateRequest):
    '''Function to create a brand'''
    try:
        existing_brand = await Brand.find_one(Brand.title == str(brand_data.get("title")))
        if existing_brand:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand already exists"
            )
        new_brand = Brand(**brand_data)
        inserted_brand = await new_brand.insert()
        inserted_brand_dict = inserted_brand.model_dump()
        inserted_brand_dict["id"] = str(inserted_brand.id)
        return inserted_brand_dict
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=e.errors()
        ) from e
    except DuplicateKeyError as e:
        if "title" in str(e):
            print("Brand already exists")
            raise ValueError("Brand already exists") from e
        print("A duplicate key error occurred")
        raise ValueError("A duplicate key error occurred") from e


async def edit_brand(brand_data: BrandCreateRequest, brand_id: str):
    if not ObjectId.is_valid(brand_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid brand ID"
        )
    existing_brand = await Brand.find_one(
        And(
            Brand.title == brand_data.title,
            Brand.id != PydanticObjectId(brand_id)
        )
    )
    if existing_brand:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Brand already exists"
        )
    brand = await Brand.get(PydanticObjectId(brand_id))

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )

    update_data = brand_data.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(brand, key, value)
        await brand.save()

        updated_brand_dict = brand.model_dump()
        updated_brand_dict["id"] = str(brand.id)
        return updated_brand_dict

    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["detail"]
        ) from e


async def delete_brand(brand_id: str):
    if not ObjectId.is_valid(brand_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid brand ID"
        )

    try:
        result: DeleteResult = await Brand.find_one(Brand.id == PydanticObjectId(brand_id)).delete()
        print("Deleted: ", result)
        print("Deleted Count: ", result.deleted_count)
        if not result.deleted_count or result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Brand not found")

        return {"message": "Brand deleted"}
    except HTTPException as e:
        print("Http Exception deleting brand: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
