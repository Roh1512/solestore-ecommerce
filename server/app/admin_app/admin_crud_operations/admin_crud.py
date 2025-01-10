from app.admin_app.admin_models.admin import Admin, AdminCreateRequest
from beanie import PydanticObjectId
from app.utilities.password_utils import hash_password, verify_password
from fastapi import HTTPException, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from pydantic import ValidationError
from cloudinary.uploader import upload, destroy
from cloudinary.exceptions import Error as CloudinaryError
from PIL import Image
import io


from asyncio import get_event_loop
from functools import partial


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
            print("Username already exists")
            raise ValueError("Username already exists") from e
        elif "email" in str(e):
            print("Email already exists")
            raise ValueError("Email already exists") from e
        else:
            print("A duplicate key error occurred")
            raise ValueError("A duplicate key error occurred") from e


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
        print("Refresh token already exists")
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
        print("Refresh token found removed successfully")
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
        update_data["password"] = hash_password(
            str(update_data["password"])
        )

    try:
        for key, value in update_data.items():
            setattr(admin, key, value)

        await admin.save()

        updated_admin_dict = admin.model_dump(
            exclude=["password", "refresh_token"]
        )
        updated_admin_dict["id"] = str(admin_id)
        return updated_admin_dict
    except DuplicateKeyError as e:
        if "username" in str(e):
            print("Username already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            ) from e
        elif "email" in str(e):
            print("Email already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            ) from e
        else:
            print("A duplicate key error occurred")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A duplicate key error occurred"
            ) from e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["detail"]
        ) from e
