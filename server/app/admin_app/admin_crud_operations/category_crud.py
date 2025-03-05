'''Admin Category crud functions'''
from app.model.category_model import Category, CategoryCreateRequest, CategoryResponse

from fastapi import HTTPException, status
from pydantic import ValidationError
from bson import ObjectId
from beanie import PydanticObjectId
from beanie.operators import And

from pymongo.errors import DuplicateKeyError
from pymongo.results import DeleteResult

from app.utilities.response_message_models import SuccessMessage


async def create_category(category_data: CategoryCreateRequest) -> CategoryResponse:
    '''Function to create a category'''
    try:
        existing_category = await Category.find_one(
            Category.title == str(category_data.get("title"))
        )

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category already exists"
            )

        new_category = Category(**category_data)
        inserted_category = await new_category.insert()
        inserted_category_dict = inserted_category.model_dump()
        inserted_category_dict["id"] = str(inserted_category.id)
        return inserted_category_dict

    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=e.errors()
        ) from e

    except DuplicateKeyError as e:
        if "title" in str(e):
            raise ValueError("Category already exists") from e
        print("A duplicate key error occurred")
        raise ValueError("A duplicate key error occurred") from e


async def edit_category(category_data: CategoryCreateRequest, category_id: str) -> CategoryResponse:
    '''Function to edit a category'''
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )

    existing_category = await Category.find_one(
        And(
            Category.title == category_data.title,
            Category.id != PydanticObjectId(category_id)
        )
    )
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )

    category = await Category.get(PydanticObjectId(category_id))

    if not Category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    update_data = category_data.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(category, key, value)
        await category.save()

        updated_category_dict = category.model_dump()
        updated_category_dict["id"] = str(category.id)
        return updated_category_dict

    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["detail"]
        ) from e


async def delete_category(category_id: str) -> SuccessMessage:
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )

    try:
        result: DeleteResult = await Category.find_one(
            Category.id == PydanticObjectId(category_id)
        ).delete()

        if not result.deleted_count or result.deleted_count <= 0:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        return SuccessMessage(
            message="Category deleted"
        )
    except HTTPException as e:
        print("Error deleting category")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
