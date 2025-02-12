'''Admin brand routes'''

from typing import Annotated
from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException

from app.admin_app.admin_models.admin import AdminRole
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.model.brand_models import BrandCreateRequest, BrandResponse
from app.admin_app.admin_crud_operations.brand_crud import create_brand, edit_brand,  delete_brand
from app.crud.brand_crud import get_brands

from app.utilities.query_models import CBQueryParams


router = APIRouter()


@router.get("", status_code=200, response_model=list[BrandResponse])
@router.get("/", status_code=200, response_model=list[BrandResponse])
async def get_all_brands(
    admin: Annotated[dict, Depends(get_current_admin)],
    query_params: Annotated[CBQueryParams, Depends()]
):
    '''GET ALL BRANDS ROUTE'''
    try:
        return await get_brands(
            search=query_params.search,
            skip=query_params.skip,
            limit=query_params.limit,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching brands"
        ) from e


@router.post("", status_code=status.HTTP_201_CREATED, response_model=BrandResponse)
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=BrandResponse)
async def brand_create(admin: Annotated[dict, Depends(get_current_admin)], brand: BrandCreateRequest):
    '''Brand create route'''
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    if not brand or brand.title == "":
        raise HTTPException(
            status_code=400,
            detail="Brand title is required"
        )
    brand_dict = brand.model_dump()
    try:
        return await create_brand(brand_dict)
    except HTTPException as e:
        print("Error creating brand: ", e)
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print("Unexpected error creating brand: ", e)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error creating brand"
        ) from e


@router.put("/{brand_id}", status_code=200,  response_model=BrandResponse)
async def brand_update(admin: Annotated[dict, Depends(get_current_admin)], brand: BrandCreateRequest, brand_id: str):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        return await edit_brand(brand_data=brand, brand_id=brand_id)
    except HTTPException as e:
        print("Http exception edting brand")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error editing brand"
        ) from e


@router.delete("/{brand_id}", status_code=200)
async def brand_delete(admin: Annotated[dict, Depends(get_current_admin)], brand_id: str):
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        return await delete_brand(str(brand_id))
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print("Unexpected error in brand delete: ", e)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error in brand delete"
        ) from e
