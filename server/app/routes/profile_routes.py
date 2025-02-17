from fastapi import APIRouter, HTTPException, Depends, status, Body, UploadFile
from app.utilities.auth_utils import get_current_user
from app.model.user import UserResponse, UpdateProfileRequest, UpdateContactInfoRequest
from typing import Annotated
from app.crud.user_crud import update_user_details, update_user_contact_info
from app.utilities.cloudinary_utils import delete_image_from_cloudinary, update_profile_image
from app.model.user import User
from beanie import PydanticObjectId
from datetime import datetime, timezone


router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_profile_details(user: Annotated[dict, Depends(get_current_user)]):
    try:
        return user
    except HTTPException as e:
        print("Profile error", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


@router.put("/", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def update_profile_details(user: Annotated[dict, Depends(get_current_user)], profile_details: UpdateProfileRequest, current_password: Annotated[str, Body(embed=True)]):
    if not current_password and not user.google_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is required"
        )
    if not profile_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter details you want to update"
        )
    try:
        return await update_user_details(user_id=str(user.id), details=profile_details, current_password=current_password)
    except HTTPException as e:
        print("Update profile error: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e


@router.put("/update-contact-info", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def update_contact_info(
    user: Annotated[dict, Depends(get_current_user)],
    contact_info: UpdateContactInfoRequest,
    current_password: Annotated[str, Body(embed=True)],

):
    if not current_password and not user.get("google_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is required"
        )
    if not contact_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address and phone number are not given."
        )
    try:
        return await update_user_contact_info(
            user_id=str(user.id),
            contact_info=contact_info, current_password=current_password
        )
    except HTTPException as e:
        print(f"Error in update profile info route: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error in user contact info update:{e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected Error in user contact info update"
        ) from e


@router.post("/update-profile-img", status_code=200, response_model=UserResponse)
async def update_profile_image_route(
    user: Annotated[dict, Depends(get_current_user)],
    file: UploadFile
):
    print(file)
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only jpeg, png and jpg images are accepted"
        )
    try:
        # Read file as bytes
        file_bytes = await file.read()

        user_id = str(user.id)

        current_user = await User.get(PydanticObjectId(user_id))
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if current_user.profile_img_public_id and current_user.profile_img_url:
            await delete_image_from_cloudinary(str(current_user.profile_img_public_id))

        # Upload the new image to Cloudinary
        folder = "solestore_ecommerce_app/users"

        upload_result = await update_profile_image(file_bytes, folder)

        current_user.profile_img_url = upload_result["secure_url"]
        current_user.profile_img_public_id = upload_result["public_id"]
        current_user.updated_at = datetime.now(timezone.utc)

        await current_user.save()

        return UserResponse.from_mongo(current_user)

    except HTTPException as e:
        print(f"Error in profile image update route:{e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating profile image"
        ) from e
    except Exception as e:
        print(f"Error in profile image update route:{e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating profile image"
        ) from e
