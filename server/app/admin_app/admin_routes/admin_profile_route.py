from fastapi import APIRouter, HTTPException, Depends, status, Body, UploadFile
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from typing import Annotated
from app.admin_app.admin_models.admin import Admin, AdminResponse, AdminUpdateRequest, AdminRole, AdminRoleUpdateRequest
from beanie import PydanticObjectId
from app.admin_app.admin_crud_operations.admin_crud import update_admin_details, update_admin_role
from app.utilities.cloudinary_utils import delete_image_from_cloudinary, update_profile_image
from datetime import datetime, timezone


router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=AdminResponse)
async def get_admin_profile_details(admin: Annotated[dict, Depends(get_current_admin)]):
    try:
        return admin
    except HTTPException as e:
        print("AdminProfile error", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print("Unexpected admin profile error: ", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected admin profile error"
        ) from e


@router.put("/", status_code=status.HTTP_200_OK, response_model=AdminResponse)
async def update_admin_profile_details(admin: Annotated[dict, Depends(get_current_admin)], profile_details: AdminUpdateRequest, current_password: Annotated[str, Body(embed=True)]):
    if not current_password:
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
        return await update_admin_details(
            admin_id=str(admin["id"]),
            details=profile_details,
            current_password=current_password
        )
    except HTTPException as e:
        print("Update admin profile error: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected error updating admin profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error updating admin profile"
        ) from e


@router.put("/update-admin-role/{admin_id}", status_code=200, response_model=AdminResponse)
async def update_admin_role_route(
    admin: Annotated[dict, Depends(get_current_admin)],
    body: AdminRoleUpdateRequest,
    admin_id: str
):
    try:
        current_admin_role = AdminRole(admin["role"])

        if current_admin_role != AdminRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an admin can update roles"
            )
        return await update_admin_role(admin_id, body.role)
    except HTTPException as e:
        print(f"Error updating admin role: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error updating admin role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during admin role updation"
        ) from e


@router.post("/update-profile-img", status_code=200, response_model=AdminResponse)
async def update_admin_profile_image_route(
    admin: Annotated[dict, Depends(get_current_admin)],
    file: UploadFile
):
    print("Admin Profile Image File: ", file)
    if file.content_type.lower() not in ["image/jpeg", "image/png", "image/jpg",]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only jpeg, png and jpg images are accepted"
        )

    try:
        # Read file as bytes
        file_bytes = await file.read()

        admin_id = str(admin["id"])

        current_admin = await Admin.get(PydanticObjectId(admin_id))

        if not current_admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )

        if current_admin.profile_img_public_id and current_admin.profile_img_url:
            await delete_image_from_cloudinary(
                str(current_admin.profile_img_public_id)
            )

        folder = "solestore_ecommerce_app/admins"

        upload_result = await update_profile_image(
            file_bytes, folder
        )

        current_admin.profile_img_url = upload_result["secure_url"]
        current_admin.profile_img_public_id = upload_result["public_id"]
        current_admin.updated_at = datetime.now(timezone.utc)

        await current_admin.save()

        updated_profile_data = current_admin.model_dump(
            exclude=["password", "refresh_tokens"]
        )
        updated_profile_data["id"] = str(
            current_admin.id
        )
        return updated_profile_data

    except HTTPException as e:
        print(f"Error in admin profile image update route:{e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Error in admin profile image update route 500:{e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error in admin profile image undate"
        ) from e
