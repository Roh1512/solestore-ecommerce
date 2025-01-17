from app.model.user import User, UpdateProfileRequest, UpdateContactInfoRequest
from beanie import PydanticObjectId
from app.utilities.password_utils import hash_password, verify_password
from fastapi import HTTPException, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from pydantic import ValidationError
from datetime import datetime, timezone
from beanie.operators import And


async def create_user(user_data: dict):
    user_data.setdefault("refresh_tokens", [])
    password = user_data.get("password")
    if password:
        hashed_password = hash_password(password)
        user_data["password"] = hashed_password
    try:
        user = User(**user_data)
        inserted_user = await user.insert()
        inserted_user_dict = inserted_user.model_dump()
        inserted_user_dict["id"] = str(inserted_user.id)
        return inserted_user_dict
    except DuplicateKeyError as e:
        # Handle duplicate key errors for both username and email
        if "username" in str(e):
            print("Username already exists")
            raise ValueError("Username already exists") from e
        elif "email" in str(e):
            print("Email already exists")
            raise ValueError("Email already exists") from e
        else:
            print("A duplicate key error occurred")
            raise ValueError("A duplicate key error occurred") from e


async def get_user_details(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user_dict = user.model_dump(exclude=["password", "refresh_tokens"])
    user_dict["id"] = str(user.id)
    return user_dict


async def add_refresh_token(user_id: str, refresh_token: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if refresh_token in user.refresh_tokens:
        print("Refresh token already exists")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    if refresh_token not in user.refresh_tokens:
        user.refresh_tokens.append(refresh_token)
        await user.save()
        return True
    return False


async def remove_refresh_token(user_id: str, refresh_token: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if refresh_token in user.refresh_tokens:
        user.refresh_tokens.remove(refresh_token)
        await user.save()
        print("Refresh token found removed successfully")
    return {"message": "Refresh token removed successfully"}


async def remove_all_refresh_tokens(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.refresh_tokens = []
    await user.save()
    return {"message": "All refresh tokens removed successfully"}


async def refresh_token_is_saved(user_id: str, refresh_token: str) -> bool:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return refresh_token in user.refresh_tokens


async def update_user_details(user_id: str, details: UpdateProfileRequest, current_password: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    duplicate_username = await User.find_one(
        And(
            User.username == details.username,
            User.id != PydanticObjectId(user_id)
        )
    )
    if duplicate_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    duplicate_email = await User.find_one(
        And(
            User.email == details.email,
            User.id != PydanticObjectId(user_id)
        )
    )

    if duplicate_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    # Exclude unset fields from the request to allow partial updates
    update_data = details.model_dump(exclude_unset=True)

    is_password_valid = verify_password(
        current_password, user.password)

    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    if "password" in update_data:
        if update_data["password"]:  # This checks if the password is not None or empty
            update_data["password"] = hash_password(
                str(update_data["password"])
            )
        else:
            del update_data["password"]

    try:
        for key, value in update_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.now(timezone.utc)
        await user.save()
        updated_user_dict = user.model_dump(
            exclude=["password", "refresh_tokens"])
        updated_user_dict["id"] = str(user.id)
        print(updated_user_dict)
        return updated_user_dict
    except DuplicateKeyError as e:
        # Handle duplicate key errors for both username and email
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


async def update_user_contact_info(user_id: str, contact_info: UpdateContactInfoRequest, current_password: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Exclude unset fields from the request to allow partial updates
    update_data = contact_info.model_dump(exclude_unset=True)

    is_password_valid = verify_password(
        current_password, user.password)

    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    try:
        for key, value in update_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.now(timezone.utc)
        await user.save()
        updated_user_dict = user.model_dump(
            exclude=["password", "refresh_tokens"])
        updated_user_dict["id"] = str(user.id)
        print(updated_user_dict)
        return updated_user_dict
    except ValueError as e:
        print(f"Value Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bad request"
        )from e
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e["details"]
        ) from e
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
