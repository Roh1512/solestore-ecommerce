'''Admin Product routes'''

from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException

from beanie import PydanticObjectId

from app.admin_app.admin_crud_operations.product_crud import add_product
from app.admin_app.admin_utilities.admin_auth_utils import get_current_admin
from app.admin_app.admin_models.admin import AdminRole
from app.model.product_models import ProductCreateRequest, ProductResponse
from app.model.brand_models import Brand
from app.model.category_model import Category

router = APIRouter()


@router.post("/", status_code=201, response_model=ProductResponse)
async def product_create(admin: Annotated[dict, Depends(get_current_admin)], product: ProductCreateRequest):
    '''Add product route'''
    try:

        return await add_product(product)
    except HTTPException as e:
        print(f"Error in adding product, HTTPException: {e}")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        ) from e
