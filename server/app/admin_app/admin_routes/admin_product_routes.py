'''Admin Product routes'''

from asyncio import gather
from typing import Annotated, List

from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from fastapi.exceptions import HTTPException

from beanie import PydanticObjectId

from app.admin_app.admin_crud_operations.product_crud import add_product, add_images_product, get_products
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_models.admin import AdminRole
from app.model.product_models import ProductCreateRequest, ProductResponse
from app.utilities.query_models import SortByProduct, SortOrder, ProductQueryParams

router = APIRouter()


@router.get("/", status_code=200, response_model=list[ProductResponse])
async def get_all_products_admin(
    admin: Annotated[dict, Depends(get_current_admin)],
    query_params: Annotated[ProductQueryParams, Depends()]
):
    '''Get all products route'''
    try:
        return await get_products(
            search=query_params.search,
            size=query_params.size,
            brand=query_params.brand,
            category=query_params.category,
            page=query_params.page,
            sort_by=query_params.sort_by,
            sort_order=query_params.sort_order
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e

    except Exception as e:
        print("Unexpected error fetching products route: ", e)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error fetching products"
        ) from e


@router.post("/", status_code=201, response_model=ProductResponse)
async def product_create(
    admin: Annotated[dict, Depends(get_current_admin)],
    product: ProductCreateRequest
):
    '''Add product route'''
    if not admin["role"] == AdminRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized for this action"
        )
    try:
        print(admin["role"], admin["username"])
        # if admin["role"] != AdminRole.ADMIN or admin["role"] != AdminRole.PRODUCT_MANAGER:
        #     raise HTTPException(
        #         status_code=403,
        #         detail="You are not authorized for this action"
        #     )

        return await add_product(product)
    except HTTPException as e:
        print(f"Error in adding product, HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Unexpected Error in adding product: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected Error in adding product"
        ) from e


@router.put("/{product_id}/add-image", status_code=201, response_model=ProductResponse)
async def add_images(
    admin: Annotated[dict, Depends(get_current_admin)],
    product_id: str,
    images: list[UploadFile] = File(...),
):
    try:
        print("A")
        for image in images:
            if image.content_type.lower() not in ["image/jpeg", "image/png", "image/jpg",]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only jpeg, png and jpg images are accepted"
                )
            return await add_images_product(product_id, images)
    except HTTPException as e:
        print(f"Error adding image HTTP: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
    except Exception as e:
        print(f"Error adding image Unexpected: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error adding product images"
        ) from e
