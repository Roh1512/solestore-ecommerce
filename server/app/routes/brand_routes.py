from fastapi import APIRouter, Depends, status, Body
from fastapi.exceptions import HTTPException
from app.utilities.auth_utils import get_current_user
from app.model.brand_models import BrandCreateRequest, BrandResponse
from typing import Annotated
from app.admin_app.admin_crud_operations.brand_crud import create_brand


router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=BrandResponse)
async def brand_create(user: Annotated[dict, Depends(get_current_user)], brand: BrandCreateRequest):
    print("Received brand data: ", brand.model_dump())
    try:
        return await create_brand(brand)
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
