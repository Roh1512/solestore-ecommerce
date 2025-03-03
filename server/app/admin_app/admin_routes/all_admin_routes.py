'''ll Admin routes'''

from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Depends

from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_crud_operations.admin_crud import get_all_admins, get_admin_details, delete_admin, update_admin_role
from app.admin_app.admin_models.admin import AdminResponse, AdminRole, AdminRoleUpdateRequest
from app.utilities.query_models import AdminQueryParams
from app.utilities.response_message_models import SuccessMessage

router = APIRouter()


@router.get("/", response_model=list[AdminResponse])
async def get_admins(
    admin: Annotated[dict, Depends(get_current_admin)],
    query_params: Annotated[AdminQueryParams, Depends()]
):
    '''Get all admins'''
    try:
        return await get_all_admins(
            search=query_params.search,
            skip=query_params.skip,
            limit=query_params.limit,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order,
            role=query_params.role
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching all admins"
        ) from e


@router.get("/{admin_id}", response_model=AdminResponse, status_code=200)
async def get_admin(
    admin: Annotated[dict, Depends(get_current_admin)],
    admin_id: str
):
    '''Function to get individual admin'''
    try:
        return await get_admin_details(str(admin_id))
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching admin"
        ) from e


@router.put("/update-role/{admin_id}", status_code=200, response_model=AdminResponse)
async def update_other_admin_role(
    admin: Annotated[dict, Depends(get_current_admin)],
    body: AdminRoleUpdateRequest,
    admin_id: str
):
    '''Update role route'''
    try:
        current_admin_role = AdminRole(admin["role"])
        if current_admin_role != AdminRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an admin can update roles"
            )
        if str(admin["id"]) == str(admin_id):
            raise HTTPException(
                status_code=400,
                detail="Cannot update the role of currently logged in admin"
            )
        return await update_admin_role(str(admin_id), body.role)
    except HTTPException as e:
        print(f"Error updating another admin's role: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error updating another admin's role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during another admin's role updation"
        ) from e


@router.delete("/{admin_id}", status_code=200, response_model=SuccessMessage)
async def admin_delete(
    admin: Annotated[dict, Depends(get_current_admin)],
    admin_id: str
):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )

    if str(admin["id"]) == str(admin_id):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete currently logged in admin"
        )

    try:
        return await delete_admin(str(admin_id))
    except HTTPException as e:
        print(f"Error deleting admin: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error edeleting admin"
        ) from e
