from app.admin_app.admin_models.admin import Admin, AdminCreateRequest, AdminRole, AdminResponse
from beanie import PydanticObjectId
from app.utilities.password_utils import hash_password, verify_password
from fastapi import HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError
from pymongo.results import DeleteResult

from beanie.operators import And
from app.utilities.query_models import AdminQueryParams, SortByAdmin, SortOrder

from pydantic import ValidationError

from app.utilities.response_message_models import SuccessMessage
from app.utilities.cloudinary_utils import delete_image_from_cloudinary


async def create_admin(admin_data: dict):
    admin_data.setdefault("refresh_tokens", [])
    password = admin_data.get("password")

    if password:
        hashed_password = hash_password(password)
        admin_data["password"] = hashed_password

    try:
        admin = Admin(**admin_data)
        inserted_admin = await admin.insert()
        inserted_admin_dict = inserted_admin.model_dump()
        inserted_admin_dict["id"] = str(inserted_admin.id)
        return inserted_admin_dict

    except DuplicateKeyError as e:
        if "username" in str(e):
            raise ValueError("Username already exists") from e
        elif "email" in str(e):
            raise ValueError("Email already exists") from e
        else:
            print("A duplicate key error occurred")
            raise ValueError("A duplicate key error occurred") from e


async def get_all_admins(
    search: str = None,
    skip: int = 0,
    limit: int = 10,
    sort_by: SortByAdmin = "date",
    sort_order: SortOrder = "asc",
    role: str = None
):
    try:
        query = {}
        if search:
            query["username"] = {"$regex": search, "$options": "i"}
        if role:
            if role not in ["ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid role filter"
                )
            query["role"] = role
        order = -1 if sort_order == SortOrder.desc else 1

        if sort_by not in ["date", "username", "email", "name"]:
            raise HTTPException(
                status_code=400, detail="Invalid sort_by field")
        if sort_by == "date":
            sort_by = "created_at"

        results: list[AdminResponse] = (
            await Admin.find(query)
            .sort((sort_by, order))
            .skip(skip)
            .limit(limit)
            .to_list()
        )

        admin_list = []

        for result in results:
            result_dict = result.model_dump(
                exclude=["password", "refresh_tokens"])
            result_dict["id"] = str(result.id)
            admin_list.append(result_dict)
        return admin_list

    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


async def get_admin_details(admin_id: str):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    admin_dict = admin.model_dump(exclude=["password", "refresh_tokens"])
    admin_dict["id"] = str(admin.id)
    return admin_dict


async def add_admin_refresh_token(admin_id: str, refresh_token: str):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    if refresh_token in admin.refresh_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    if refresh_token not in admin.refresh_tokens:
        admin.refresh_tokens.append(refresh_token)
        await admin.save()
        return True
    return False


async def remove_admin_refresh_token(admin_id: str, refresh_token: str):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    if refresh_token in admin.refresh_tokens:
        admin.refresh_tokens.remove(refresh_token)
        await admin.save()
    return {"message": "Refresh token removed successfully"}


async def remove_all_admin_refresh_token(admin_id: str):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    admin.refresh_tokens = []
    await admin.save()
    return {"message": "All refresh tokens removed successfully"}


async def admin_refresh_token_is_saved(admin_id: str, refresh_token: str) -> bool:
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    return refresh_token in admin.refresh_tokens


async def update_admin_details(admin_id, details: AdminCreateRequest, current_password: str):
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid admin ID"
        )
    admin = await Admin.get(PydanticObjectId(admin_id))
    if not admin:
        raise (
            HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )
        )

    duplicate_username = await Admin.find_one(
        And(
            Admin.username == details.username,
            Admin.id != PydanticObjectId(admin_id)
        )
    )

    if duplicate_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    duplicate_email = await Admin.find_one(
        And(
            Admin.email == details.email,
            Admin.id != PydanticObjectId(admin_id)
        )
    )

    if duplicate_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    is_password_valid = verify_password(
        current_password, admin.password
    )

    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    # Exclude unset fields from the request to allow partial updates
    update_data = details.model_dump(exclude_unset=True)

    if "password" in update_data:
        if update_data["password"]:  # This checks if the password is not None or empty
            update_data["password"] = hash_password(
                str(update_data["password"])
            )
        else:
            del update_data["password"]

    try:
        for key, value in update_data.items():
            setattr(admin, key, value)
        admin.updated_at = datetime.now(timezone.utc)

        await admin.save()

        updated_admin_dict = admin.model_dump(
            exclude=["password", "refresh_token"]
        )
        updated_admin_dict["id"] = str(admin_id)
        return updated_admin_dict
    except DuplicateKeyError as e:
        # This gets the string representation of the error
        error_message = str(e)

        if "username" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            ) from e

        if "email" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            ) from e

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A duplicate key error occurred"
        ) from e


async def update_admin_role(admin_id: str, new_role: AdminRole):
    try:
        if not ObjectId.is_valid(admin_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid admin ID"
            )
        admin_to_update = await Admin.get(ObjectId(admin_id))
        if not admin_to_update:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        # Instead of using dictionary access, use dot notation since it's a document
        admin_to_update.role = new_role
        admin_to_update.updated_at = datetime.now(timezone.utc)
        await admin_to_update.save()

        # Convert to dictionary using model_dump()
        updated_admin_dict = admin_to_update.model_dump(
            exclude=["password", "refresh_tokens"]
        )
        # Access id as a property, not as a dictionary key
        updated_admin_dict["id"] = str(admin_to_update.id)
        return updated_admin_dict

    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["detail"]
        ) from e


async def delete_admin(admin_id: str):
    try:
        if not ObjectId.is_valid(admin_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid admin ID"
            )
        admin_found = await Admin.get(PydanticObjectId(admin_id))
        if not admin_found:
            raise HTTPException(
                status_code=404,
                detail="Admin not found"
            )
        if admin_found.profile_img_url and admin_found.profile_img_public_id:
            await delete_image_from_cloudinary(str(admin_found.profile_img_public_id))
        result: DeleteResult = await Admin.find_one(
            Admin.id == PydanticObjectId(admin_id)
        ).delete()

        if not result.deleted_count or result.deleted_count <= 0:
            raise HTTPException(
                status_code=404,
                detail="Admin not found"
            )
        return SuccessMessage(
            message="Admin deleted"
        )

    except HTTPException as e:
        print("Error deleting admin")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        print(f"Error deleting admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error deleting admin"
        ) from e
