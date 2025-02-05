'''ll Admin routes'''

from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Depends

from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_crud_operations.admin_crud import get_all_admins, get_admin_details
from app.admin_app.admin_models.admin import AdminResponse
from app.utilities.query_models import AdminQueryParams

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
